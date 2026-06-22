import logging

from flask import Blueprint

import ckan.plugins as p
import ckan.plugins.toolkit as tk
import ckan.authz as authz
import ckan.model as model
import ckan.lib.base as base
from ckan.lib.helpers import helper_functions as h
from ckan.common import _, current_user


log = logging.getLogger(__name__)

STATUS_FIELD = 'stats_workflow_status'
# Note filter UI:
# CKAN mengubah semua query parameter non-standar menjadi facet otomatis.
# Karena itu filter status dari halaman /dataset memakai prefix ext_ supaya
# tidak muncul sebagai pill "None: published" dan bisa diproses manual di hook
# before_dataset_search menjadi filter Solr stats_workflow_status.
STATUS_FILTER_PARAM = 'ext_statsworkflow_status'

DRAFT = 'draft'
WAITING_VALIDATION = 'waiting_validation'
REVISION_FROM_VALIDATOR = 'revision_from_validator'
WAITING_VERIFICATION = 'waiting_verification'
REVISION_FROM_VERIFICATOR = 'revision_from_verificator'
WAITING_PUBLISH = 'waiting_publish'
PUBLISHED = 'published'

ALL_STATUSES = (
    DRAFT,
    WAITING_VALIDATION,
    REVISION_FROM_VALIDATOR,
    WAITING_VERIFICATION,
    REVISION_FROM_VERIFICATOR,
    WAITING_PUBLISH,
    PUBLISHED,
)

WORKFLOW_SEARCH_FILTERS = (
    {'value': DRAFT, 'label': _('Revisian')},
    {'value': WAITING_VALIDATION, 'label': _('Waiting Validation')},
    {'value': WAITING_VERIFICATION, 'label': _('Waiting Verifikator')},
    {'value': PUBLISHED, 'label': _('Published')},
    {'value': 'private', 'label': _('Private')},
)
EDITOR_EDITABLE_STATUSES = (
    DRAFT,
    REVISION_FROM_VALIDATOR,
    REVISION_FROM_VERIFICATOR,
)


ROLE_CONFIG = {
    'validator': 'ckanext.statsworkflow.validators',
    'verificator': 'ckanext.statsworkflow.verificators',
    'publikator': 'ckanext.statsworkflow.publikators',
}

WORKFLOW_ROLES = {
    'validator': _('Validator'),
    'verificator': _('Verifikator'),
    'publikator': _('Publikator'),
}

WORKFLOW_ACTIONS = {
    # Konfigurasi tombol UI workflow. Key dipakai sebagai slug URL, sedangkan
    # action menunjuk ke CKAN action yang mengubah status secara aman.
    'submit-validation': {
        'action': 'statsworkflow_submit_validation',
        'label': _('Kirim ke Validator'),
        'class': 'btn btn-primary',
        'source_statuses': EDITOR_EDITABLE_STATUSES,
    },
    'validator-revision': {
        'action': 'statsworkflow_validator_revision',
        'label': _('Minta Revisi'),
        'class': 'btn btn-warning',
        'source_statuses': (WAITING_VALIDATION,),
    },
    'validator-approve': {
        'action': 'statsworkflow_validator_approve',
        'label': _('Setujui Validasi'),
        'class': 'btn btn-success',
        'source_statuses': (WAITING_VALIDATION,),
    },
    'verificator-revision': {
        'action': 'statsworkflow_verificator_revision',
        'label': _('Minta Revisi'),
        'class': 'btn btn-warning',
        'source_statuses': (WAITING_VERIFICATION,),
    },
    'verificator-approve': {
        'action': 'statsworkflow_verificator_approve',
        'label': _('Setujui Verifikasi'),
        'class': 'btn btn-success',
        'source_statuses': (WAITING_VERIFICATION,),
    },
    'publish': {
        'action': 'statsworkflow_publish',
        'label': _('Publish'),
        'class': 'btn btn-success',
        'source_statuses': (WAITING_PUBLISH,),
    },
    'unpublish': {
        'action': 'statsworkflow_unpublish',
        'label': _('Jadikan Private'),
        'class': 'btn btn-warning',
        'source_statuses': (PUBLISHED,),
    },
}


def _username(context):
    user_obj = context.get('auth_user_obj')
    if user_obj:
        return user_obj.name
    return context.get('user')


def _is_sysadmin(context):
    user_obj = context.get('auth_user_obj')
    if user_obj and getattr(user_obj, 'sysadmin', False):
        return True

    username = context.get('user')
    if not username:
        return False

    user_obj = model.User.get(username)
    return bool(user_obj and getattr(user_obj, 'sysadmin', False))


def _configured_users(role):
    # Isi dari .env berbentuk comma-separated username, misalnya:
    # CKANEXT__STATSWORKFLOW__VALIDATORS=validator1,validator2
    value = tk.config.get(ROLE_CONFIG[role], '') or ''
    return {
        item.strip()
        for item in value.split(',')
        if item.strip()
    }


def _has_configured_role(context, role):
    if _is_sysadmin(context):
        return True

    user_obj = context.get('auth_user_obj')
    allowed = _configured_users(role)
    identifiers = {_username(context)}
    if user_obj and not getattr(user_obj, 'is_anonymous', False):
        identifiers.update([user_obj.name, user_obj.id, user_obj.email])

    return bool(allowed.intersection(identifier for identifier in identifiers if identifier))


def _install_workflow_roles():
    # CKAN memakai authz.ROLE_PERMISSIONS untuk daftar role dan permission.
    # Role workflow dibuat readonly: bisa melihat dataset private organisasi,
    # tetapi tidak bisa manage organisasi, membuat dataset, atau mengedit file.
    for role, label in WORKFLOW_ROLES.items():
        authz.ROLE_PERMISSIONS[role] = ['read']
        authz._trans_functions.setdefault(role, lambda label=label: label)


def _user_has_org_capacity(context, org_id, capacity):
    if _is_sysadmin(context):
        return True

    user_obj = context.get('auth_user_obj')
    if not user_obj or not org_id:
        return False

    group = model.Group.get(org_id)
    if not group:
        return False

    return model.Session.query(model.Member.id).filter(
        model.Member.group_id == group.id,
        model.Member.table_name == 'user',
        model.Member.table_id == user_obj.id,
        model.Member.state == 'active',
        model.Member.capacity == capacity,
    ).first() is not None


def _has_workflow_role(context, data_dict, role):
    if _is_sysadmin(context) or _has_configured_role(context, role):
        return True

    try:
        pkg = _package_show(context, _package_id(data_dict))
    except (tk.ObjectNotFound, tk.ValidationError):
        return False

    return _user_has_org_capacity(context, pkg.get('owner_org'), role)


def _current_user_has_workflow_org_role(pkg_dict):
    if not pkg_dict:
        return False

    try:
        if current_user.is_anonymous or current_user.sysadmin:
            return False
    except AttributeError:
        return False

    org_id = pkg_dict.get('owner_org')
    if not org_id:
        return False

    group = model.Group.get(org_id)
    if not group:
        return False

    return model.Session.query(model.Member.id).filter(
        model.Member.group_id == group.id,
        model.Member.table_name == 'user',
        model.Member.table_id == current_user.id,
        model.Member.state == 'active',
        model.Member.capacity.in_(WORKFLOW_ROLES.keys()),
    ).first() is not None


def can_edit_resources(pkg_dict):
    try:
        if current_user.is_anonymous:
            return False
    except AttributeError:
        return False

    if _current_user_has_workflow_org_role(pkg_dict):
        return False

    try:
        return tk.check_access(
            'package_update',
            {
                'model': model,
                'user': current_user.name,
                'auth_user_obj': current_user,
            },
            {'id': pkg_dict.get('id')},
        )
    except tk.NotAuthorized:
        return False


def _get_extra(pkg_dict, key, default=None):
    for extra in pkg_dict.get('extras', []) or []:
        if extra.get('key') == key:
            return extra.get('value')
    return default


def _has_extra(pkg_dict, key):
    return any(
        extra.get('key') == key
        for extra in pkg_dict.get('extras', []) or []
    )


def _set_extra(pkg_dict, key, value):
    extras = list(pkg_dict.get('extras') or [])
    for extra in extras:
        if extra.get('key') == key:
            extra['value'] = value
            break
    else:
        extras.append({'key': key, 'value': value})
    pkg_dict['extras'] = extras


def get_workflow_counts():
    try:
        # Query PostgreSQL directly for performance and accuracy
        query = model.Session.query(model.PackageExtra.value)\
            .join(model.Package, model.Package.id == model.PackageExtra.package_id)\
            .filter(model.PackageExtra.key == 'stats_workflow_status')\
            .filter(model.Package.state == 'active')
        
        counts = {
            'waiting_validation': 0,
            'waiting_verification': 0,
            'waiting_publish': 0,
            'draft': 0,
            'published': 0
        }
        
        for row in query.all():
            val = row[0]
            if val in counts:
                counts[val] += 1
            elif 'revision' in val:
                counts['draft'] += 1
        
        return counts
    except Exception as e:
        log.error("Error getting workflow counts: %s", e)
        return {
            'waiting_validation': 0,
            'waiting_verification': 0,
            'waiting_publish': 0,
            'draft': 0,
            'published': 0
        }


def _workflow_status(pkg_dict):
    status = _get_extra(pkg_dict, STATUS_FIELD, DRAFT)
    if status not in ALL_STATUSES:
        return DRAFT
    return status


def _workflow_context():
    # Context ini dipakai oleh tombol UI agar check_access dan action CKAN
    # membaca user login yang sama dengan request browser saat ini.
    username = ''
    try:
        if not current_user.is_anonymous:
            username = current_user.name
    except AttributeError:
        username = ''

    return {
        'model': model,
        'user': username,
        'auth_user_obj': current_user,
    }


def _package_show(context, package_id):
    show_context = dict(context, ignore_auth=True)
    return tk.get_action('package_show')(show_context, {'id': package_id})


def _package_id(data_dict):
    package_id = data_dict.get('id') or data_dict.get('name')
    if not package_id:
        raise tk.ValidationError({'id': ['Dataset id/name wajib diisi']})
    return package_id


def _transition(context, data_dict, source_statuses, target_status, role):
    tk.check_access('statsworkflow_{}'.format(role), context, data_dict)

    pkg = _package_show(context, _package_id(data_dict))
    current_status = _workflow_status(pkg)
    if current_status not in source_statuses:
        raise tk.ValidationError({
            STATUS_FIELD: [
                'Status saat ini "{}" tidak bisa diproses ke "{}"'.format(
                    current_status,
                    target_status,
                )
            ]
        })

    _set_extra(pkg, STATUS_FIELD, target_status)
    # Prinsip utama: semua dataset internal private, public hanya saat published.
    pkg['private'] = target_status != PUBLISHED

    update_context = dict(
        context,
        ignore_auth=True,
        statsworkflow_transition=True,
    )
    updated = tk.get_action('package_update')(update_context, pkg)
    log.info(
        'statsworkflow transition package=%s user=%s %s->%s',
        updated.get('name') or updated.get('id'),
        _username(context),
        current_status,
        target_status,
    )
    return updated


@tk.chained_action
def package_create(original_action, context, data_dict):
    # Dataset baru selalu masuk draft dan private.
    _set_extra(data_dict, STATUS_FIELD, DRAFT)
    data_dict['private'] = True
    return original_action(context, data_dict)


@tk.chained_action
def package_update(original_action, context, data_dict):
    package_id = data_dict.get('id') or data_dict.get('name')
    if package_id:
        current_pkg = _package_show(context, package_id)
        current_status = _workflow_status(current_pkg)
    else:
        current_status = _workflow_status(data_dict)

    requested_status = (
        _workflow_status(data_dict)
        if _has_extra(data_dict, STATUS_FIELD)
        else current_status
    )

    if (
        _is_sysadmin(context)
        and not context.get('statsworkflow_transition')
        and not _has_extra(data_dict, STATUS_FIELD)
        and 'private' in data_dict
    ):
        requested_private = data_dict.get('private')
        if isinstance(requested_private, str):
            requested_private = requested_private.lower() == 'true'

        if requested_private is False:
            requested_status = PUBLISHED
        elif current_status == PUBLISHED:
            requested_status = DRAFT

    if not context.get('statsworkflow_transition') and requested_status != current_status:
        if not _is_sysadmin(context):
            raise tk.NotAuthorized(
                'Status workflow hanya boleh berubah lewat action statsworkflow'
            )

    _set_extra(data_dict, STATUS_FIELD, requested_status)
    data_dict['private'] = requested_status != PUBLISHED
    return original_action(context, data_dict)


@tk.chained_action
@tk.side_effect_free
def member_roles_list(original_action, context, data_dict):
    roles = original_action(context, data_dict)
    group_type = data_dict.get('group_type', 'organization')

    if group_type != 'organization':
        return [
            role for role in roles
            if role.get('value') not in WORKFLOW_ROLES
        ]

    existing = {role.get('value') for role in roles}
    for value, text in WORKFLOW_ROLES.items():
        if value not in existing:
            roles.append({'text': text, 'value': value})
    return roles


def statsworkflow_submit_validation(context, data_dict):
    return _transition(
        context,
        data_dict,
        EDITOR_EDITABLE_STATUSES,
        WAITING_VALIDATION,
        'editor',
    )


def statsworkflow_validator_approve(context, data_dict):
    return _transition(
        context,
        data_dict,
        (WAITING_VALIDATION,),
        WAITING_VERIFICATION,
        'validator',
    )


def statsworkflow_validator_revision(context, data_dict):
    return _transition(
        context,
        data_dict,
        (WAITING_VALIDATION,),
        REVISION_FROM_VALIDATOR,
        'validator',
    )


def statsworkflow_verificator_approve(context, data_dict):
    return _transition(
        context,
        data_dict,
        (WAITING_VERIFICATION,),
        WAITING_PUBLISH,
        'verificator',
    )


def statsworkflow_verificator_revision(context, data_dict):
    return _transition(
        context,
        data_dict,
        (WAITING_VERIFICATION,),
        REVISION_FROM_VERIFICATOR,
        'verificator',
    )


def statsworkflow_publish(context, data_dict):
    source_statuses = tuple(
        status for status in ALL_STATUSES
        if status != PUBLISHED
    ) if _is_sysadmin(context) else (WAITING_PUBLISH,)

    return _transition(
        context,
        data_dict,
        source_statuses,
        PUBLISHED,
        'publikator',
    )


def statsworkflow_unpublish(context, data_dict):
    return _transition(
        context,
        data_dict,
        (PUBLISHED,),
        DRAFT,
        'publikator',
    )


@tk.side_effect_free
def statsworkflow_status_show(context, data_dict):
    pkg = _package_show(context, _package_id(data_dict))
    return {
        'id': pkg.get('id'),
        'name': pkg.get('name'),
        'private': pkg.get('private'),
        'status': _workflow_status(pkg),
        'status_field': STATUS_FIELD,
    }


def workflow_status_label(status):
    # Label ramah pengguna untuk status internal yang tersimpan di extras.
    return {
        DRAFT: _('Revisian'),
        WAITING_VALIDATION: _('Menunggu Validasi'),
        REVISION_FROM_VALIDATOR: _('Revisi dari Validator'),
        WAITING_VERIFICATION: _('Menunggu Verifikasi'),
        REVISION_FROM_VERIFICATOR: _('Revisi dari Verifikator'),
        WAITING_PUBLISH: _('Menunggu Publish'),
        PUBLISHED: _('Published'),
    }.get(status, status)


def workflow_search_filters():
    return WORKFLOW_SEARCH_FILTERS


def _append_search_filter(search_params, clause):
    current = search_params.get('fq')

    if isinstance(current, list):
        current.append(clause)
        search_params['fq'] = current
        return

    search_params['fq'] = '{} {}'.format(current, clause) if current else clause


def workflow_buttons(pkg_dict):
    # Menentukan tombol yang boleh muncul berdasarkan status dataset dan role
    # user. Tombol disembunyikan jika check_access menolak action terkait.
    status = _workflow_status(pkg_dict)
    context = _workflow_context()
    buttons = []

    for slug, item in WORKFLOW_ACTIONS.items():
        if status not in item['source_statuses'] and not (
            _is_sysadmin(context)
            and slug == 'publish'
            and status != PUBLISHED
        ):
            continue

        try:
            tk.check_access(item['action'], context, {'id': pkg_dict.get('id')})
        except tk.NotAuthorized:
            continue

        buttons.append({
            'slug': slug,
            'label': item['label'],
            'class': item['class'],
        })

    return buttons


def workflow_transition(action_slug, id):
    # Endpoint POST dari tombol UI. Perubahan status tetap lewat action
    # statsworkflow_* agar alur tidak bisa dilompati dari form biasa.
    if current_user.is_anonymous:
        return base.abort(401, _('Login required'))

    workflow_action = WORKFLOW_ACTIONS.get(action_slug)
    if not workflow_action:
        return base.abort(404, _('Workflow action not found'))

    context = _workflow_context()
    data_dict = {'id': id}

    try:
        updated = tk.get_action(workflow_action['action'])(context, data_dict)
    except tk.ObjectNotFound:
        return base.abort(404, _('Dataset not found'))
    except tk.NotAuthorized as error:
        return base.abort(403, str(error))
    except tk.ValidationError as error:
        h.flash_error(error.error_summary)
        return h.redirect_to('dataset.read', id=id)

    h.flash_success(
        _('Status workflow berhasil diubah menjadi {status}').format(
            status=workflow_status_label(_workflow_status(updated))
        )
    )
    return h.redirect_to('dataset.read', id=updated.get('name') or id)


def _auth_success():
    return {'success': True}


def _auth_fail(message):
    return {'success': False, 'msg': message}


def _can_update_package(context, data_dict):
    try:
        tk.check_access('package_update', context, data_dict)
        return True
    except tk.NotAuthorized:
        return False


def statsworkflow_editor_auth(context, data_dict):
    if _is_sysadmin(context):
        return _auth_success()

    pkg = _package_show(context, _package_id(data_dict))
    status = _workflow_status(pkg)
    if status not in EDITOR_EDITABLE_STATUSES:
        return _auth_fail(
            'Editor hanya boleh mengirim dataset dari draft/revision'
        )

    if not _can_update_package(context, pkg):
        return _auth_fail('User tidak punya akses edit dataset ini')

    return _auth_success()


def statsworkflow_validator_auth(context, data_dict):
    if _has_workflow_role(context, data_dict, 'validator'):
        return _auth_success()
    return _auth_fail('Hanya validator yang boleh melakukan review validasi')


def statsworkflow_verificator_auth(context, data_dict):
    if _has_workflow_role(context, data_dict, 'verificator'):
        return _auth_success()
    return _auth_fail('Hanya verifikator yang boleh melakukan review verifikasi')


def statsworkflow_publikator_auth(context, data_dict):
    if _has_workflow_role(context, data_dict, 'publikator'):
        return _auth_success()
    return _auth_fail('Hanya publikator yang boleh publish final')


@tk.chained_auth_function
def package_update_auth(next_auth, context, data_dict):
    if context.get('statsworkflow_transition') or _is_sysadmin(context):
        return next_auth(context, data_dict)

    package_id = data_dict.get('id') or data_dict.get('name')
    if not package_id:
        return next_auth(context, data_dict)

    pkg = _package_show(context, package_id)
    current_status = _workflow_status(pkg)
    requested_status = (
        _workflow_status(data_dict)
        if _has_extra(data_dict, STATUS_FIELD)
        else current_status
    )

    if requested_status != current_status:
        return _auth_fail(
            'Status workflow hanya boleh berubah lewat action statsworkflow'
        )

    if current_status not in EDITOR_EDITABLE_STATUSES:
        return _auth_fail(
            'Dataset readonly. Editor hanya bisa edit saat draft/revision'
        )

    return next_auth(context, data_dict)


class StatsWorkflowPlugin(p.SingletonPlugin):
    p.implements(p.IActions)
    p.implements(p.IAuthFunctions)
    p.implements(p.IPackageController)
    p.implements(p.IConfigurer)
    p.implements(p.ITemplateHelpers)
    p.implements(p.IBlueprint)

    def update_config(self, config):
        _install_workflow_roles()
        tk.add_template_directory(config, 'templates')

    def get_helpers(self):
        return {
            'statsworkflow_can_edit_resources': can_edit_resources,
            'statsworkflow_status_label': workflow_status_label,
            'statsworkflow_buttons': workflow_buttons,
            'statsworkflow_counts': get_workflow_counts,
            'statsworkflow_search_filters': workflow_search_filters,
        }

    def get_blueprint(self):
        # Route form tombol workflow di halaman dataset CKAN.
        blueprint = Blueprint('statsworkflow', self.__module__)
        blueprint.add_url_rule(
            '/statsworkflow/<action_slug>/<id>',
            'transition',
            workflow_transition,
            methods=['POST'],
        )
        return blueprint

    def get_actions(self):
        return {
            'member_roles_list': member_roles_list,
            'package_create': package_create,
            'package_update': package_update,
            'statsworkflow_status_show': statsworkflow_status_show,
            'statsworkflow_submit_validation': statsworkflow_submit_validation,
            'statsworkflow_validator_approve': statsworkflow_validator_approve,
            'statsworkflow_validator_revision': statsworkflow_validator_revision,
            'statsworkflow_verificator_approve': statsworkflow_verificator_approve,
            'statsworkflow_verificator_revision': statsworkflow_verificator_revision,
            'statsworkflow_publish': statsworkflow_publish,
            'statsworkflow_unpublish': statsworkflow_unpublish,
        }

    def get_auth_functions(self):
        return {
            'package_update': package_update_auth,
            'statsworkflow_editor': statsworkflow_editor_auth,
            'statsworkflow_validator': statsworkflow_validator_auth,
            'statsworkflow_verificator': statsworkflow_verificator_auth,
            'statsworkflow_publikator': statsworkflow_publikator_auth,
            'statsworkflow_status_show': lambda context, data_dict: _auth_success(),
            'statsworkflow_submit_validation': statsworkflow_editor_auth,
            'statsworkflow_validator_approve': statsworkflow_validator_auth,
            'statsworkflow_validator_revision': statsworkflow_validator_auth,
            'statsworkflow_verificator_approve': statsworkflow_verificator_auth,
            'statsworkflow_verificator_revision': statsworkflow_verificator_auth,
            'statsworkflow_publish': statsworkflow_publikator_auth,
            'statsworkflow_unpublish': statsworkflow_publikator_auth,
        }

    def before_dataset_index(self, pkg_dict):
        # Field ini masuk Solr agar status bisa dipakai filter/debug.
        pkg_dict[STATUS_FIELD] = pkg_dict.get(STATUS_FIELD) or DRAFT
        return pkg_dict

    def before_dataset_view(self, pkg_dict):
        pkg_dict[STATUS_FIELD] = _workflow_status(pkg_dict)
        return pkg_dict

    def after_dataset_show(self, context, pkg_dict):
        pkg_dict[STATUS_FIELD] = _workflow_status(pkg_dict)

    def read(self, entity):
        pass

    def create(self, entity):
        pass

    def edit(self, entity):
        pass

    def delete(self, entity):
        pass

    def after_dataset_create(self, context, pkg_dict):
        pass

    def after_dataset_update(self, context, pkg_dict):
        pass

    def after_dataset_delete(self, context, pkg_dict):
        pass

    def before_dataset_search(self, search_params):
        # Note alur filter:
        # Dropdown Status mengirim ext_statsworkflow_status. CKAN menyimpannya
        # di search_params['extras'], lalu hook ini mengubahnya menjadi fq Solr.
        # Status non-published umumnya private, jadi include_private dinyalakan;
        # CKAN tetap membatasi hasil sesuai permission user yang sedang login.
        workflow_status = None

        try:
            workflow_status = tk.request.args.get(STATUS_FILTER_PARAM)
        except (RuntimeError, AttributeError):
            workflow_status = None

        extras = search_params.get('extras') or {}
        workflow_status = workflow_status or search_params.pop(
            STATUS_FILTER_PARAM,
            None,
        ) or extras.get(STATUS_FILTER_PARAM)

        allowed_filters = {
            item['value']
            for item in WORKFLOW_SEARCH_FILTERS
        }
        if workflow_status not in allowed_filters:
            return search_params

        search_params['include_private'] = True

        if workflow_status == 'private':
            _append_search_filter(search_params, 'private:true')
        else:
            _append_search_filter(
                search_params,
                '{}:"{}"'.format(STATUS_FIELD, workflow_status),
            )

        return search_params

    def after_dataset_search(self, search_results, search_params):
        return search_results
