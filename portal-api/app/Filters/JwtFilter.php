<?php

namespace App\Filters;

use CodeIgniter\HTTP\RequestInterface;
use CodeIgniter\HTTP\ResponseInterface;
use CodeIgniter\Filters\FilterInterface;
use Firebase\JWT\JWT;
use Firebase\JWT\Key;
use Throwable;

class JwtFilter implements FilterInterface
{
    public function before(RequestInterface $request, $arguments = null)
    {
        $header = $request->getHeaderLine('Authorization');

        if (! preg_match('/Bearer\s+(.*)$/i', $header, $matches)) {
            return service('response')->setStatusCode(401)->setJSON([
                'status' => 'error',
                'message' => 'Token tidak ditemukan.',
            ]);
        }

        try {
            $decoded = JWT::decode($matches[1], new Key((string) env('JWT_SECRET'), 'HS256'));
            $request->user = $decoded;
        } catch (Throwable $exception) {
            return service('response')->setStatusCode(401)->setJSON([
                'status' => 'error',
                'message' => 'Token tidak valid.',
            ]);
        }
    }

    public function after(RequestInterface $request, ResponseInterface $response, $arguments = null)
    {
    }
}
