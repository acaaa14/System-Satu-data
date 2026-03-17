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

            $client = \Config\Services::curlrequest([
                "timeout" => 10
            ]);

            $response = $client->get($this->ckan . $endpoint);

            return json_decode($response->getBody(), true);

        } catch (\Throwable $e) {

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

        $data = $this->requestCkan("/package_search");

        return $this->response->setJSON($data);

    }



    // =============================
    // DATASET DETAIL
    // =============================

    public function show($id)
    {

        $data = $this->requestCkan("/package_show?id=" . $id);

        return $this->response->setJSON($data);

    }



    // =============================
    // SEARCH DATASET
    // =============================

    public function search()
    {

        $q = $this->request->getGet("q") ?? "";

        $data = $this->requestCkan("/package_search?q=" . urlencode($q));

        return $this->response->setJSON($data);

    }



    // =============================
    // DATASTORE PREVIEW
    // =============================

    public function preview($resourceId)
    {

        $data = $this->requestCkan(
            "/datastore_search?resource_id=" .
            $resourceId .
            "&limit=20"
        );

        return $this->response->setJSON($data);

    }

}