<?php

use CodeIgniter\Router\RouteCollection;

/**
 * @var RouteCollection $routes
 */
// Frontend React production sekarang dilayani dari root website oleh CodeIgniter.
$routes->get('/', 'Frontend::index');
$routes->get('open-data', 'Frontend::index');
$routes->get('jadwal-rilis-dataset', 'Frontend::index');
$routes->get('login', 'Frontend::index');
$routes->get('admin', 'Frontend::index');
$routes->get('dataset/(:segment)', 'Frontend::index/$1');

// Route lama `/app` dipertahankan agar link lama tetap bekerja dan diarahkan ke root baru.
$routes->get('app', 'Home::index');
$routes->get('app/(:any)', 'Home::index/$1');

// Endpoint API tetap ditangani backend CodeIgniter untuk integrasi ke CKAN dan autentikasi JWT.
$routes->get('api/datasets', 'Dataset::index');
$routes->get('api/dataset/(:segment)', 'Dataset::show/$1');
$routes->get('api/search', 'Dataset::search');
$routes->get('api/preview/(:segment)', 'Dataset::preview/$1');
$routes->post('api/login', 'Auth::login');

$routes->post('api/admin/dataset', 'Dataset::create', ['filter'=>'jwt']);
$routes->put('api/admin/dataset/(:segment)', 'Dataset::update/$1', ['filter'=>'jwt']);
$routes->delete('api/admin/dataset/(:segment)', 'Dataset::delete/$1', ['filter'=>'jwt']);
$routes->options('(:any)', function () {
    return response()->setStatusCode(200);
});
