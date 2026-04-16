<?php

namespace App\Controllers;

use CodeIgniter\Controller;
use SQLite3;
use Throwable;

class Visitor extends Controller
{
    private function getDatabasePath(): string
    {
        $directory = WRITEPATH . 'analytics';

        if (! is_dir($directory)) {
            mkdir($directory, 0775, true);
        }

        return $directory . DIRECTORY_SEPARATOR . 'visitors.sqlite3';
    }

    private function connect(): SQLite3
    {
        $database = new SQLite3($this->getDatabasePath());

        $database->exec(
            'CREATE TABLE IF NOT EXISTS visitor_counters (
                id INTEGER PRIMARY KEY,
                total INTEGER NOT NULL DEFAULT 0,
                updated_at TEXT DEFAULT NULL
            )'
        );

        $database->exec(
            'INSERT OR IGNORE INTO visitor_counters (id, total, updated_at)
             VALUES (1, 0, NULL)'
        );

        return $database;
    }

    private function readCounter(SQLite3 $database): array
    {
        $result = $database->querySingle(
            'SELECT total, updated_at FROM visitor_counters WHERE id = 1',
            true
        );

        return [
            'total' => (int) ($result['total'] ?? 0),
            'updatedAt' => $result['updated_at'] ?? null,
        ];
    }

    public function show()
    {
        try {
            $database = $this->connect();
            $result = $this->readCounter($database);
            $database->close();

            return $this->response->setJSON([
                'success' => true,
                'result' => $result,
            ]);
        } catch (Throwable $exception) {
            return $this->response->setStatusCode(500)->setJSON([
                'success' => false,
                'message' => $exception->getMessage(),
            ]);
        }
    }

    public function increment()
    {
        try {
            $database = $this->connect();
            $database->exec('BEGIN IMMEDIATE TRANSACTION');

            $database->exec(
                "UPDATE visitor_counters
                 SET total = total + 1,
                     updated_at = '" . $database->escapeString(date(DATE_ATOM)) . "'
                 WHERE id = 1"
            );

            $result = $this->readCounter($database);
            $database->exec('COMMIT');
            $database->close();

            return $this->response->setJSON([
                'success' => true,
                'result' => $result,
            ]);
        } catch (Throwable $exception) {
            if (isset($database) && $database instanceof SQLite3) {
                @$database->exec('ROLLBACK');
                $database->close();
            }

            return $this->response->setStatusCode(500)->setJSON([
                'success' => false,
                'message' => $exception->getMessage(),
            ]);
        }
    }
}
