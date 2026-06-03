# ckanext-statsworkflow

Plugin ini membuat workflow publikasi dataset statistik bertingkat.

## Status workflow

- `draft`
- `waiting_validation`
- `revision_from_validator`
- `waiting_verification`
- `revision_from_verificator`
- `waiting_publish`
- `published`

Status disimpan di dataset extras dengan key:

```text
stats_workflow_status
```

## Filter status dataset di CKAN

Halaman daftar dataset CKAN (`/dataset`) memiliki dropdown **Status** di area
yang sama dengan **Order by**. Dropdown ini menampilkan:

- `draft`
- `waiting_validation`
- `waiting_verification`
- `published`
- `private`

Filter tidak memakai parameter `workflow_status`, karena CKAN akan menganggap
parameter non-standar sebagai facet otomatis dan dapat menampilkan pill seperti
`None: published`. Karena itu UI memakai parameter:

```text
ext_statsworkflow_status
```

Plugin lalu menerjemahkan parameter tersebut di `before_dataset_search` menjadi
filter Solr pada field:

```text
stats_workflow_status
```

Contoh URL:

```text
http://localhost:5000/dataset?ext_statsworkflow_status=published
http://localhost:5000/dataset?ext_statsworkflow_status=draft
http://localhost:5000/dataset?ext_statsworkflow_status=waiting_validation
```

Catatan akses: status selain `published` biasanya masih `private=True`, jadi
hasilnya hanya muncul untuk user login yang memang punya izin melihat dataset
private tersebut. Jika data sudah ada di database tetapi belum muncul di filter,
pastikan search index CKAN/Solr sudah diperbarui.

## Prinsip private/public

- Dataset baru selalu `private=True`.
- Dataset internal selalu dipaksa private.
- Dataset hanya menjadi public saat action `statsworkflow_publish` berhasil.

## Role

Plugin menambahkan role organisasi CKAN:

- `validator`
- `verificator`
- `publikator`

Admin organisasi bisa buka halaman **Members -> Add Member**, lalu memilih role
Validator, Verifikator, atau Publikator dari dropdown Role.

Konfigurasi `.env` ini masih bisa dipakai sebagai fallback global jika diperlukan:

```env
CKANEXT__STATSWORKFLOW__VALIDATORS=validator1,validator2
CKANEXT__STATSWORKFLOW__VERIFICATORS=verifikator1
CKANEXT__STATSWORKFLOW__PUBLIKATORS=publikator1
```

Editor OPD memakai permission edit dataset CKAN biasa, misalnya user dengan akses editor/admin di organisasi dataset.

## Action API

Semua perubahan status dilakukan lewat action internal CKAN:

```bash
curl -H "Authorization: <API_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"id": "<dataset>"}' \
  http://localhost:5000/api/3/action/statsworkflow_submit_validation
```

Ganti nama action sesuai kebutuhan:

- `statsworkflow_status_show`
- `statsworkflow_submit_validation`
- `statsworkflow_validator_approve`
- `statsworkflow_validator_revision`
- `statsworkflow_verificator_approve`
- `statsworkflow_verificator_revision`
- `statsworkflow_publish`

## Alur

Editor OPD mengisi dataset pada `draft`, lalu mengirim ke validator.
Validator hanya approve/revisi.
Verifikator hanya approve/revisi.
Publikator melakukan publish final dan plugin mengubah `private=False`.
