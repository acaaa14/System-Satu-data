<?php

namespace App\Controllers;

use CodeIgniter\Controller;

class Home extends Controller
{
    public function index(?string $path = null)
    {
        // Controller ini sekarang hanya menjaga kompatibilitas route lama `/app`.
        if ($path) {
            return redirect()->to('/' . ltrim($path, '/'));
        }

        return redirect()->to('/');
    }
}
