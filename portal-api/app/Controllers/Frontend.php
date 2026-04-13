<?php

namespace App\Controllers;

use CodeIgniter\Controller;
use CodeIgniter\Exceptions\PageNotFoundException;

class Frontend extends Controller
{
    public function index(?string $path = null)
    {
        // Frontend React production dibuild ke folder public/frontend,
        // lalu file index.html itu yang disajikan untuk semua route frontend.
        $indexFile = FCPATH . 'frontend/index.html';

        if (! is_file($indexFile)) {
            throw PageNotFoundException::forPageNotFound(
                'React build not found. Run npm run build:portal in portal-frontend.'
            );
        }

        // Browser menerima shell HTML React, lalu asset JS/CSS melanjutkan render di client side.
        return $this->response
            ->setContentType('text/html')
            ->setBody((string) file_get_contents($indexFile));
    }
}
