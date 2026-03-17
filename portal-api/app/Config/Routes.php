<?php

use CodeIgniter\Router\RouteCollection;

/**
 * @var RouteCollection $routes
 */
$routes->get('/', 'Home::index');
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