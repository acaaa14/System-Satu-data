<?php

namespace App\Controllers;

use CodeIgniter\Controller;

class Dataset extends Controller
{

    // CKAN endpoint
    private $ckan = "http://ckan:5000/api/3/action";

    // tambahan supaya kode lama tetap jalan
    private $ckanUrl = "http://ckan:5000/api/3/action";
    private $topicGroup = "topik";
    private $publicationGroup = "publikasi";
    private $organizationExcludedGroup = "publikasi";
    private $publicationCacheFile = "publications-cache.json";


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
        $resolvedGroupName = $this->resolveGroupName($groupName);
        $groupDatasets = $this->requestCkan(
            "/package_search?rows=1000&fq=" . urlencode('groups:' . $resolvedGroupName)
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

    private function resolveGroupName(string $groupLabel): string
    {
        $groups = $this->requestCkan("/group_list?all_fields=true");

        if (($groups['success'] ?? false) !== true || ! is_array($groups['result'] ?? null)) {
            return $groupLabel;
        }

        $needle = $this->normalizeTextValue($groupLabel);

        foreach ($groups['result'] as $group) {
            if (! is_array($group)) {
                continue;
            }

            $aliases = [
                $group['name'] ?? '',
                $group['title'] ?? '',
                $group['display_name'] ?? '',
            ];

            foreach ($aliases as $alias) {
                if ($this->normalizeTextValue($alias) === $needle) {
                    return (string) ($group['name'] ?? $groupLabel);
                }
            }
        }

        return $groupLabel;
    }

    private function emptyPackageSearchResult(): array
    {
        return [
            'success' => true,
            'result' => [
                'count' => 0,
                'results' => [],
            ],
        ];
    }

    private function getPackageSearchResults(array $data): array
    {
        if (
            ($data['success'] ?? false) !== true ||
            ! isset($data['result']['results']) ||
            ! is_array($data['result']['results'])
        ) {
            return [];
        }

        return $data['result']['results'];
    }

    private function normalizeTextValue($value): string
    {
        return strtolower(trim((string) $value));
    }

    private function datasetMatchesPublication(array $dataset): bool
    {
        $values = [
            $dataset['name'] ?? '',
            $dataset['title'] ?? '',
            $dataset['notes'] ?? '',
            $dataset['organization']['name'] ?? '',
            $dataset['organization']['title'] ?? '',
            $dataset['organization']['display_name'] ?? '',
        ];

        foreach (($dataset['groups'] ?? []) as $group) {
            $values[] = $group['name'] ?? '';
            $values[] = $group['title'] ?? '';
            $values[] = $group['display_name'] ?? '';
        }

        foreach (($dataset['tags'] ?? []) as $tag) {
            $values[] = $tag['name'] ?? '';
            $values[] = $tag['display_name'] ?? '';
        }

        foreach ($values as $value) {
            if (strpos($this->normalizeTextValue($value), $this->publicationGroup) !== false) {
                return true;
            }
        }

        return false;
    }

    private function mergeUniqueDatasets(array ...$datasetGroups): array
    {
        $merged = [];
        $seen = [];

        foreach ($datasetGroups as $datasets) {
            foreach ($datasets as $dataset) {
                if (! is_array($dataset)) {
                    continue;
                }

                $key = (string) ($dataset['id'] ?? $dataset['name'] ?? '');

                if ($key === '' || isset($seen[$key])) {
                    continue;
                }

                $seen[$key] = true;
                $merged[] = $dataset;
            }
        }

        return $merged;
    }

    private function enrichPublicationOrganizations(array $datasets): array
    {
        $organizationCache = [];

        foreach ($datasets as $index => $dataset) {
            $organizationName = $dataset['organization']['name'] ?? null;

            if (! $organizationName) {
                continue;
            }

            if (! array_key_exists($organizationName, $organizationCache)) {
                $organizationData = $this->requestCkan(
                    "/organization_show?id=" . urlencode((string) $organizationName)
                );

                $organizationCache[$organizationName] =
                    (($organizationData['success'] ?? false) === true && is_array($organizationData['result'] ?? null))
                        ? $organizationData['result']
                        : null;
            }

            if (! is_array($organizationCache[$organizationName])) {
                continue;
            }

            $datasets[$index]['organization'] = array_merge(
                $dataset['organization'] ?? [],
                $organizationCache[$organizationName]
            );
        }

        return $datasets;
    }

    private function buildPackageSearchResponse(array $datasets, array $baseResponse = []): array
    {
        $response = $baseResponse ?: $this->emptyPackageSearchResult();
        $response['success'] = true;
        $response['result'] = is_array($response['result'] ?? null)
            ? $response['result']
            : [];
        $response['result']['count'] = count($datasets);
        $response['result']['results'] = array_values($datasets);

        return $response;
    }

    private function publicationCachePath(): string
    {
        return WRITEPATH . 'cache/' . $this->publicationCacheFile;
    }

    private function readPublicationCache(): ?array
    {
        $path = $this->publicationCachePath();

        if (! is_file($path)) {
            return null;
        }

        $cached = json_decode((string) file_get_contents($path), true);

        if (! is_array($cached)) {
            return null;
        }

        return $cached;
    }

    private function writePublicationCache(array $data): void
    {
        if (! is_dir(WRITEPATH . 'cache')) {
            return;
        }

        file_put_contents($this->publicationCachePath(), json_encode($data));
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
        $organizationNames = $this->getOrganizationNamesFromGroup($this->topicGroup);

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

        // Halaman Publikasi portal memprioritaskan group CKAN `publikasi`.
        // Jika dataset belum dimasukkan ke group tetapi masih diberi tag/organisasi/judul publikasi,
        // fallback di bawah tetap menangkapnya agar halaman tidak kosong setelah aplikasi dibuka ulang.
        $publicationGroupName = $this->resolveGroupName($this->publicationGroup);
        $groupData = $this->requestCkan(
            "/package_search?rows=1000&fq=" . urlencode('groups:' . $publicationGroupName)
        );

        $groupResults = $this->getPackageSearchResults($groupData);
        $data = $groupData;

        if ($groupResults === []) {
            $searchData = $this->requestCkan(
                "/package_search?rows=1000&q=" . urlencode($this->publicationGroup)
            );
            $allData = $this->requestCkan("/package_search?rows=1000");
            $searchResults = array_filter(
                $this->getPackageSearchResults($searchData),
                fn ($dataset) => is_array($dataset) && $this->datasetMatchesPublication($dataset)
            );
            $allResults = array_filter(
                $this->getPackageSearchResults($allData),
                fn ($dataset) => is_array($dataset) && $this->datasetMatchesPublication($dataset)
            );
            $fallbackResults = $this->mergeUniqueDatasets($searchResults, $allResults);

            if ($fallbackResults !== []) {
                $data = $this->buildPackageSearchResponse($fallbackResults, $searchData);
            }
        }

        $results = $this->getPackageSearchResults($data);

        if ($results !== []) {
            $data = $this->buildPackageSearchResponse(
                $this->enrichPublicationOrganizations($results),
                $data
            );
            $this->writePublicationCache($data);

            return $this->response->setJSON($data);
        }

        $cached = $this->readPublicationCache();

        if ($cached !== null) {
            $cached['from_cache'] = true;

            return $this->response->setJSON($cached);
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
