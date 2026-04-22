<?php

namespace App\Controllers;

use CodeIgniter\Controller;

class Dataset extends Controller
{

    // CKAN endpoint
    private $ckan = "http://ckan:5000/api/3/action";

    // tambahan supaya kode lama tetap jalan
    private $ckanUrl = "http://ckan:5000/api/3/action";
    private $publicationGroup = "topik";
    private $organizationExcludedGroup = "publikasi";


    // =============================
    // HELPER REQUEST KE CKAN
    // =============================

    private function requestCkan($endpoint)
    {
        try {

            // Semua request ke CKAN dipusatkan di helper ini agar timeout dan error handling konsisten.
            $client = \Config\Services::curlrequest([
                "timeout" => 10
            ]);

            $response = $client->get($this->ckan . $endpoint);

            return json_decode($response->getBody(), true);

        } catch (\Throwable $e) {

            // Jika CKAN gagal diakses, backend tetap mengembalikan JSON error yang mudah dibaca frontend.
            return [
                "success" => false,
                "error" => $e->getMessage()
            ];

        }
    }

    private function getOrganizationNamesFromGroup(string $groupName): array
    {
        // Helper ini membaca semua dataset di satu group CKAN lalu mengumpulkan
        // nama organisasi pemilik dataset tersebut.
        $groupDatasets = $this->requestCkan(
            "/package_search?rows=1000&fq=" . urlencode('groups:' . $groupName)
        );

        if (
            ($groupDatasets['success'] ?? false) !== true ||
            ! isset($groupDatasets['result']['results']) ||
            ! is_array($groupDatasets['result']['results'])
        ) {
            return [];
        }

        $organizationNames = [];

        foreach ($groupDatasets['result']['results'] as $dataset) {
            $organizationName = $dataset['organization']['name'] ?? null;

            if (! $organizationName) {
                continue;
            }

            $organizationNames[] = (string) $organizationName;
        }

        return array_values(array_unique($organizationNames));
    }



    // =============================
    // LIST DATASET
    // =============================

    public function index()
    {

        // rows=1000 dipakai agar daftar dataset tidak berhenti di page pertama CKAN.
        $data = $this->requestCkan("/package_search?rows=1000");

        return $this->response->setJSON($data);

    }



    // =============================
    // DATASET DETAIL
    // =============================

    public function show($id)
    {

        // package_show dipakai untuk menampilkan detail lengkap satu dataset.
        $data = $this->requestCkan("/package_show?id=" . $id);

        return $this->response->setJSON($data);

    }



    // =============================
    // SEARCH DATASET
    // =============================

    public function search()
    {

        $q = $this->request->getGet("q") ?? "";

        // Search tetap mengambil banyak hasil agar frontend bisa memfilter dan menampilkan data lebih lengkap.
        $data = $this->requestCkan("/package_search?q=" . urlencode($q) . "&rows=1000");

        return $this->response->setJSON($data);

    }



    // =============================
    // LIST ORGANISASI
    // =============================

    public function organizations()
    {

        // Endpoint ini dipakai halaman Organisasi untuk menampilkan semua organisasi CKAN, termasuk yang 0 dataset.
        $data = $this->requestCkan("/organization_list?all_fields=true&include_dataset_count=true");

        if (
            ($data['success'] ?? false) === true &&
            isset($data['result']) &&
            is_array($data['result'])
        ) {
            // Organisasi yang sudah dipakai oleh group publikasi tidak dikirim ke frontend
            // agar halaman Organisasi tidak menampilkan item yang seharusnya hidup di halaman Publikasi.
            $excludedOrganizations = $this->getOrganizationNamesFromGroup($this->organizationExcludedGroup);

            if ($excludedOrganizations !== []) {
                $data['result'] = array_values(array_filter(
                    $data['result'],
                    static function ($organization) use ($excludedOrganizations) {
                        $organizationName = (string) ($organization['name'] ?? '');

                        return ! in_array($organizationName, $excludedOrganizations, true);
                    }
                ));
            }
        }

        return $this->response->setJSON($data);

    }



    // =============================
    // LIST TOPIK DARI GROUP CKAN
    // =============================

    public function topics()
    {

        // Halaman Topik versi murni CKAN mengambil organisasi yang menjadi pemilik
        // dataset di group `topik`. Kalau data di CKAN dihapus, item di portal ikut hilang.
        $organizationNames = $this->getOrganizationNamesFromGroup($this->publicationGroup);

        $topicOrganizations = [];

        foreach ($organizationNames as $organizationName) {
            $organizationData = $this->requestCkan(
                "/organization_show?id=" . urlencode((string) $organizationName)
            );

            if (($organizationData['success'] ?? false) !== true) {
                continue;
            }

            $organizationResult = $organizationData['result'] ?? null;

            if (! is_array($organizationResult)) {
                continue;
            }

            $topicOrganizations[] = $organizationResult;
        }

        return $this->response->setJSON([
            'success' => true,
            'result' => $topicOrganizations,
        ]);

    }



    // =============================
    // LIST PUBLIKASI DARI GROUP CKAN
    // =============================

    public function publications()
    {

        // Halaman Publikasi portal mengambil dataset yang berada di group CKAN `topik`.
        $data = $this->requestCkan(
            "/package_search?rows=1000&fq=" . urlencode('groups:' . $this->publicationGroup)
        );

        if (
            ($data['success'] ?? false) === true &&
            isset($data['result']['results']) &&
            is_array($data['result']['results'])
        ) {
            // Struktur organisasi dari package_search sering belum lengkap,
            // jadi kita perkaya lagi dengan organization_show agar frontend bisa
            // memakai logo/gambar organisasi yang sama dengan halaman CKAN.
            foreach ($data['result']['results'] as $index => $dataset) {
                $organizationName = $dataset['organization']['name'] ?? null;

                if (! $organizationName) {
                    continue;
                }

                // Detail organisasi diambil lagi dari CKAN agar image/logo yang dipakai
                // sama persis dengan yang tampil di halaman organisasi CKAN.
                $organizationData = $this->requestCkan(
                    "/organization_show?id=" . urlencode((string) $organizationName)
                );

                if (($organizationData['success'] ?? false) !== true) {
                    continue;
                }

                $organizationResult = $organizationData['result'] ?? null;

                if (! is_array($organizationResult)) {
                    continue;
                }

                $data['result']['results'][$index]['organization'] = array_merge(
                    $dataset['organization'] ?? [],
                    $organizationResult
                );
            }
        }

        return $this->response->setJSON($data);

    }



    // =============================
    // DATASTORE PREVIEW
    // =============================

    public function preview($resourceId)
    {

        // Preview dibatasi 20 baris agar response tetap ringan saat ditampilkan di UI.
        $data = $this->requestCkan(
            "/datastore_search?resource_id=" .
            $resourceId .
            "&limit=20"
        );

        return $this->response->setJSON($data);

    }

}
