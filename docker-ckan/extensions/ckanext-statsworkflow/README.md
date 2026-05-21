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
