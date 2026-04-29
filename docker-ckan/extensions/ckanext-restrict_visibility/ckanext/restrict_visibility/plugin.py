import ckan.plugins as p
import ckan.plugins.toolkit as tk


def _check_access(action, context=None, data_dict=None):
    # Wrapper agar pengecekan permission CKAN mengembalikan True/False,
    # bukan menghentikan proses dengan NotAuthorized.
    try:
        return tk.check_access(action, context or {}, data_dict or {})
    except tk.NotAuthorized:
        return False


def _organization_id(data_dict):
    # CKAN bisa mengirim organisasi dataset lewat beberapa nama field,
    # tergantung form create/update yang sedang dipakai.
    if not data_dict:
        return None

    return (
        data_dict.get('owner_org')
        or data_dict.get('group_id')
        or data_dict.get('groups__0__id')
    )


class RestrictVisibilityPlugin(p.SingletonPlugin):
    # IAuthFunctions membatasi create/update dataset di backend.
    # IConfigurer memuat template override.
    # ITemplateHelpers menyediakan helper untuk dipakai di template.
    p.implements(p.IAuthFunctions)
    p.implements(p.IConfigurer)
    p.implements(p.ITemplateHelpers)

    def update_config(self, config):
        # Mendaftarkan folder templates milik extension agar CKAN memakai
        # override dropdown Visibility dari extension ini.
        tk.add_template_directory(config, 'templates')

    def get_helpers(self):
        return {
            'restrict_visibility_can_set_public': self.can_set_public,
        }

    def get_auth_functions(self):
        return {
            'package_create': self.package_create,
            'package_update': self.package_update
        }

    def can_set_public(self, data_dict=None, context=None):
        # Public hanya boleh untuk sysadmin atau admin organisasi.
        # Admin organisasi dianggap punya akses organization_update.
        if _check_access('sysadmin', context):
            return True

        org_id = _organization_id(data_dict)
        if not org_id:
            return False

        return _check_access(
            'organization_update',
            context,
            {'id': org_id}
        )

    def package_create(self, context, data_dict):
        # Only sysadmins and organization admins can create public datasets.
        if not self.can_set_public(data_dict, context):
            # Editor tetap boleh membuat dataset, tetapi selalu dipaksa Private.
            data_dict['private'] = True
        return {'success': True}

    def package_update(self, context, data_dict):
        # Only sysadmins and organization admins can switch datasets to public.
        if not self.can_set_public(data_dict, context):
            if data_dict.get('private') is False:
                # Pengaman backend jika editor mencoba set Public lewat API/devtools.
                return {
                    'success': False,
                    'msg': 'Hanya sysadmin atau admin organisasi yang boleh set Public'
                }
        return {'success': True}
