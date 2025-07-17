<?php
require '../db/connection.php';
require '../utils/validate.php';
// Leggi JSON
$data = json_decode(file_get_contents('php://input'), true);
$user = sanitize($data['username'] ?? '');
$pass = $data['password'] ?? '';
if (!$user || !$pass) {
    http_response_code(400);
    exit(json_encode(['error'=>'Missing fields']));
}
$hash = password_hash($pass, PASSWORD_BCRYPT);
$pdo = getPDO();
$stmt = $pdo->prepare('INSERT INTO users (username, password_hash) VALUES (?,?)');
$stmt->execute([$user, $hash]);
session_start();
$_SESSION['user_id'] = $pdo->lastInsertId();
echo json_encode(['status'=>'ok']);