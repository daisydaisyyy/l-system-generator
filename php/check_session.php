<?php
require_once 'db.php';
header('Content-Type: application/json');

if (isset($_SESSION['username'])) {
    // trovato utente loggato
    echo json_encode(['status' => 'ok', 'username' => $_SESSION['username']]);
} else {
    http_response_code(401); // non autorizzato
    echo json_encode(['error' => 'Not authenticated']);
}
?>