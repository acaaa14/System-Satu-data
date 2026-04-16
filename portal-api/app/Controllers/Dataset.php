<?php

namespace App\Controllers;

use CodeIgniter\Controller;

class Dataset extends Controller
{

    // CKAN endpoint
    private $ckan = "http://ckan:5000/api/3/action";

    // tambahan supaya kode lama tetap jalan
    private $ckanUrl = "http://ckan:5000/api/3/action";


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
