<?php

use CodeIgniter\Router\RouteCollection;

/**
 * @var RouteCollection $routes
 */
// Frontend React production sekarang dilayani dari root website oleh CodeIgniter.
$ckanBaseUrl = rtrim((string) (env('CKAN_SITE_URL') ?: 'http://localhost:5000'), '/');

$routes->get('/', 'Frontend::index');
$routes->get('organisasi', 'Frontend::index');
$routes->get('publikasi', 'Frontend::index');
$routes->get('topik', 'Frontend::index');
$routes->get('pencarian', 'Frontend::index');
$routes->get('open-data', 'Frontend::index');
$routes->get('jadwal-rilis-dataset', 'Frontend::index');
$routes->get('login', 'Frontend::index');
$routes->get('admin', static fn () => redirect()->to($ckanBaseUrl . '/dashboard'));
// Detail dataset juga diarahkan ke frontend agar render halaman tetap dikendalikan React.
$routes->get('dataset/(:segment)', 'Frontend::index/$1');

// Route lama `/app` dipertahankan agar link lama tetap bekerja dan diarahkan ke root baru.
$routes->get('app', 'Home::index');
$routes->get('app/(:any)', 'Home::index/$1');

// Endpoint API tetap ditangani backend CodeIgniter untuk integrasi ke CKAN.
$routes->get('api/datasets', 'Dataset::index');
$routes->get('api/publications', 'Dataset::publications');
$routes->get('api/topics', 'Dataset::topics');
$routes->get('api/group-datasets', 'Dataset::groupDatasets');

// Endpoint organisasi dipakai khusus untuk halaman daftar organisasi di frontend.
$routes->get('api/organizations', 'Dataset::organizations');
$routes->get('api/dataset/(:segment)', 'Dataset::show/$1');
$routes->get('api/search', 'Dataset::search');
$routes->get('api/preview/(:segment)', 'Dataset::preview/$1');
$routes->get('api/visitors', 'Visitor::show');
$routes->post('api/visitors/increment', 'Visitor::increment');
$routes->options('(:any)', function () {
    return response()->setStatusCode(200);
});
