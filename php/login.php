<?php
require_once 'db.php';
header('Content-Type: application/json');

$input = json_decode(file_get_contents('php://input'), true);
if (!$input || empty($input['username']) || empty($input['password'])) {
    http_response_code(400);
    echo json_encode(['error' => 'username and password required']);
    exit;
}

$username = trim($input['username']);
$password = $input['password'];

$stmt = $mysqli->prepare("SELECT password_hash FROM user WHERE username = ?");
if ($stmt === false) {
    http_response_code(500);
    echo json_encode(['error' => 'DB prepare failed: ' . $mysqli->error]);
    exit;
}
$stmt->bind_param('s', $username);
$stmt->execute();
$res = $stmt->get_result();
if ($res->num_rows === 0) {
    http_response_code(401);
    echo json_encode(['error' => 'invalid credentials']);
    exit;
}
$row = $res->fetch_assoc();
$hash = $row['password_hash'];

if (!password_verify($password, $hash)) {
    http_response_code(401);
    echo json_encode(['error' => 'invalid credentials']);
    exit;
}

// protezione di sicurezza da session fixation (l'attaccante potrebbe impostare l'id di sessione dell'utente prima che l'utente faccia login e fargli visitare il sito con l'id dell'attaccante)
session_regenerate_id(true); // rigenera un nuovo id al login

$_SESSION['username'] = $username;
echo json_encode(['status' => 'ok', 'username' => $username]);
