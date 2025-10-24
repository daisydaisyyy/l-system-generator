<?php
// db.php
declare(strict_types=1);
session_start();

define('DB_HOST', 'localhost');
define('DB_USER', 'app_user');    // cambia se usi un utente diverso
define('DB_PASS', 'user');
define('DB_NAME', 'lsystem_db');

$mysqli = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);
if ($mysqli->connect_error) {
    http_response_code(500);
    die(json_encode(['error' => 'DB connection failed']));
}
$mysqli->set_charset('utf8mb4');
?>
