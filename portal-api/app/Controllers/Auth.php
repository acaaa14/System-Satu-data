<?php

namespace App\Controllers;

use CodeIgniter\Controller;
use Firebase\JWT\JWT;

class Auth extends Controller
{
    private $key;

    public function __construct()
    {
    $this->key = env('JWT_SECRET');
    }

    public function login()
    {
        $data = $this->request->getJSON(true);
        $username = $data['username'] ?? "";
        $password = $data['password'] ?? "";
        // sementara hardcode dulu
        if($username === "admin" && $password === "123456"){

            $payload = [
                "iss" => "portal-data",
                "iat" => time(),
                "exp" => time() + 3600,
                "user" => $username
            ];

            $token = JWT::encode($payload, $this->key, 'HS256');

            return $this->response->setJSON([
                "status" => "success",
                "token" => $token
            ]);
        }

        return $this->response->setJSON([
            "status" => "error",
            "message" => "Login gagal",
            "debug" => $data
        ]);
    }
}