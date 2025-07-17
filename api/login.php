<?php
require '../db/connection.php';
require '../utils/validate.php';
$data = json_decode(file_get_contents('php://input'), true);
$user = sanitize($data['username'] ?? '');
$pass = $data['password'] ?? '';
$pdo = getPDO();
$stmt = $pdo->prepare('SELECT id, password_hash FROM users WHERE username=?');
$stmt->execute([$user]);
$row = $stmt->fetch();
if ($row && password_verify($pass, $row['password_hash'])) {
    session_start();
    $_SESSION['user_id'] = $row['id'];
    echo json_encode(['status'=>'ok']);
} else {
    http_response_code(401);
    echo json_encode(['error'=>'Invalid credentials']);
}