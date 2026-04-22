<?php

namespace App\Controllers;

use CodeIgniter\Controller;
use Firebase\JWT\JWT;
use Throwable;

class Auth extends Controller
{
    private $key;
    private $ckanBaseUrl;

    public function __construct()
    {
        // JWT portal dipakai sebagai token internal setelah user lolos login portal
        // atau setelah session CKAN berhasil divalidasi oleh backend.
        $this->key = env('JWT_SECRET');
        // Base URL CKAN dipakai untuk verifikasi session login CKAN dari sisi backend.
        $this->ckanBaseUrl = rtrim((string) (env('CKAN_SITE_URL') ?: 'http://ckan:5000'), '/');
    }

    private function issuePortalToken(string $user, array $extra = []): string
    {
        // Token ini dipakai frontend portal untuk mengakses route admin yang dilindungi JWT.
        $payload = [
            'iss' => 'portal-data',
            'iat' => time(),
            'exp' => time() + 3600,
            'user' => $user,
            ...$extra,
        ];

        return JWT::encode($payload, $this->key, 'HS256');
    }

    private function extractCkanIdentityFromHtml(string $html): array
    {
        // Hybrid login saat ini membaca identitas user dari halaman CKAN yang hanya bisa
        // diakses setelah login. Jika pola user ditemukan, nilainya dipakai ke JWT portal.
        $patterns = [
            '/href="\/user\/([^"\/?#]+)"/i',
            "/href='\/user\/([^'\/?#]+)'/i",
            '/data-user="([^"]+)"/i',
            "/data-user='([^']+)'/i",
            '/"name"\s*:\s*"([^"]+)"/i',
            '/"display_name"\s*:\s*"([^"]+)"/i',
        ];

        foreach ($patterns as $pattern) {
            if (preg_match($pattern, $html, $matches)) {
                $value = trim(urldecode((string) ($matches[1] ?? '')));

                if ($value !== '') {
                    return [
                        'username' => $value,
                        'displayName' => $value,
                        'source' => 'dashboard-html',
                    ];
                }
            }
        }

        return [
            'username' => 'ckan-session',
            'displayName' => 'CKAN Session',
            'source' => 'dashboard-html-fallback',
        ];
    }

    public function login()
    {
        $data = $this->request->getJSON(true);
        $username = $data['username'] ?? "";
        $password = $data['password'] ?? "";
        // Login lama portal dipertahankan sebagai fallback/manual login internal.
        if($username === "admin" && $password === "123456"){

            $token = $this->issuePortalToken($username, [
                'source' => 'portal-login',
            ]);

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

    public function syncCkanSession()
    {
        // Browser yang sudah login ke CKAN akan membawa cookie session.
        // Cookie ini diteruskan ke CKAN untuk mengecek apakah user benar-benar sudah login.
        $cookieHeader = $this->request->getHeaderLine('Cookie');

        if (! $cookieHeader) {
            return $this->response->setStatusCode(401)->setJSON([
                'status' => 'error',
                'message' => 'Session CKAN belum ditemukan di browser.',
            ]);
        }

        try {
            $client = \Config\Services::curlrequest([
                'timeout' => 10,
                'allow_redirects' => false,
            ]);

            // Endpoint dashboard dipakai sebagai target verifikasi karena normalnya hanya
            // bisa diakses jika session CKAN user masih valid.
            $response = $client->get($this->ckanBaseUrl . '/dashboard', [
                'headers' => [
                    'Cookie' => $cookieHeader,
                ],
            ]);

            $statusCode = $response->getStatusCode();
            $location = $response->getHeaderLine('Location');
            $body = (string) $response->getBody();

            // Jika CKAN me-redirect ke halaman login, berarti session browser belum valid.
            if ($statusCode >= 300 && $statusCode < 400 && stripos($location, '/user/login') !== false) {
                return $this->response->setStatusCode(401)->setJSON([
                    'status' => 'error',
                    'message' => 'Session CKAN tidak valid atau belum login.',
                ]);
            }

            if ($statusCode !== 200) {
                return $this->response->setStatusCode(401)->setJSON([
                    'status' => 'error',
                    'message' => 'Session CKAN tidak bisa diverifikasi.',
                    'ckan_status' => $statusCode,
                ]);
            }

            // Jika valid, backend mencoba membaca identitas user CKAN dari HTML dashboard
            // lalu membuat JWT portal agar route admin portal tetap memakai auth internal.
            $identity = $this->extractCkanIdentityFromHtml($body);

            $token = $this->issuePortalToken($identity['username'], [
                'source' => 'ckan-session',
                'provider' => 'ckan',
                'display_name' => $identity['displayName'],
                'identity_source' => $identity['source'],
            ]);

            return $this->response->setJSON([
                'status' => 'success',
                'token' => $token,
                'auth' => [
                    'provider' => 'ckan',
                    'validated' => true,
                    'user' => [
                        'username' => $identity['username'],
                        'displayName' => $identity['displayName'],
                        'source' => $identity['source'],
                    ],
                ],
            ]);
        } catch (Throwable $exception) {
            return $this->response->setStatusCode(500)->setJSON([
                'status' => 'error',
                'message' => 'Gagal memverifikasi session CKAN.',
                'error' => $exception->getMessage(),
            ]);
        }
    }
}
