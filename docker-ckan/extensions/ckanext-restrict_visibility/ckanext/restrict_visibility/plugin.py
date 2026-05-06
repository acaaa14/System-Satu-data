import csv
from html.parser import HTMLParser
import ckan.plugins as p
import ckan.plugins.toolkit as tk


class _HtmlTableParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.rows = []
        self._current_row = None
        self._current_cell = None

    def handle_starttag(self, tag, attrs):
        if tag == 'tr':
            self._current_row = []
        elif tag in ('td', 'th') and self._current_row is not None:
            self._current_cell = []

    def handle_data(self, data):
        if self._current_cell is not None:
            self._current_cell.append(data)

    def handle_endtag(self, tag):
        if tag in ('td', 'th') and self._current_cell is not None:
            value = ' '.join(''.join(self._current_cell).split())
            self._current_row.append(value)
            self._current_cell = None
        elif tag == 'tr' and self._current_row is not None:
            if any(cell for cell in self._current_row):
                self.rows.append(self._current_row)
            self._current_row = None


def _looks_like_html_table(filepath):
    with open(filepath, 'rb') as file_obj:
        sample = file_obj.read(4096).lower()

    return b'<table' in sample and (b'<tr' in sample or b'<td' in sample)


def _write_rows_to_csv(filepath, rows):
    with open(filepath, 'w', encoding='utf-8', newline='') as file_obj:
        writer = csv.writer(file_obj)
        writer.writerows(rows)


def _unique_headers(headers):
    used_headers = {}
    unique = []

    for index, header in enumerate(headers, start=1):
        normalized = header or 'column_{}'.format(index)
        used_headers[normalized] = used_headers.get(normalized, 0) + 1
        if used_headers[normalized] > 1:
            normalized = '{}_{}'.format(normalized, used_headers[normalized])
        unique.append(normalized)

    return unique


def _build_csv_rows_from_html_rows(rows):
    if len(rows) >= 2 and 'Tahun' in rows[0]:
        year_headers = rows[1]
        fixed_headers = [cell for cell in rows[0] if cell != 'Tahun']
        headers = fixed_headers[:2] + year_headers + fixed_headers[2:]
        data_rows = rows[2:]

        if data_rows and len(headers) == max(len(row) for row in data_rows):
            return [_unique_headers(headers)] + data_rows

    headers = _unique_headers(rows[0])
    return [headers] + rows[1:]


def _convert_html_table_to_csv(filepath, logger):
    with open(filepath, 'r', encoding='utf-8', errors='ignore') as file_obj:
        parser = _HtmlTableParser()
        parser.feed(file_obj.read())

    rows = [row for row in parser.rows if row]
    if not rows:
        return False

    rows = _build_csv_rows_from_html_rows(rows)
    max_columns = max(len(row) for row in rows)
    normalized_rows = [
        row + [''] * (max_columns - len(row))
        for row in rows
    ]

    # xloader menentukan parser dari ekstensi temporary file. Karena resource
    # aslinya bernama .xls, file salinan .csv dipakai hanya untuk membaca
    # metadata/header, sedangkan file utama tetap ditimpa dengan isi CSV.
    metadata_filepath = '{}.csv'.format(filepath)
    _write_rows_to_csv(filepath, normalized_rows)
    _write_rows_to_csv(metadata_filepath, normalized_rows)

    logger.info('Converted HTML table resource to CSV before xloader import')
    return metadata_filepath


def _patch_xloader_html_table_support():
    try:
        import ckanext.xloader.loader as xloader_loader
    except ImportError:
        return

    if getattr(xloader_loader, '_restrict_visibility_html_patch', False):
        return

    original_read_metadata = xloader_loader._read_metadata

    def read_metadata_with_html_table_support(table_filepath, mimetype, logger):
        if _looks_like_html_table(table_filepath):
            metadata_filepath = _convert_html_table_to_csv(table_filepath, logger)
            if metadata_filepath:
                return original_read_metadata(metadata_filepath, 'csv', logger)

        return original_read_metadata(table_filepath, mimetype, logger)

    xloader_loader._read_metadata = read_metadata_with_html_table_support
    xloader_loader._restrict_visibility_html_patch = True


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
        # Beberapa file dari portal memakai ekstensi .xls, tetapi isi aslinya
        # adalah HTML table. Patch ini membuat xloader membaca file seperti itu
        # sebagai CSV sementara sebelum disimpan ke DataStore.
        _patch_xloader_html_table_support()

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
