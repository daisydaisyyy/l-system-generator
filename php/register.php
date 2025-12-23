<?php
require_once 'db.php';
header('Content-Type: application/json');

$input = json_decode(file_get_contents('php://input'), true);
if (!$input || empty($input['username']) || empty($input['password'])) {
    http_response_code(400);
    echo json_encode(['error' => 'username and password required']);
    exit;
}

$username = strip_tags($input['username']);
$password = $input['password'];

if (strlen($username) > 64 || strlen($password) < 6) {
    http_response_code(400);
    echo json_encode(['error' => 'invalid username or password']);
    exit;
}

$hash = password_hash($password, PASSWORD_DEFAULT);

$stmt = $mysqli->prepare("INSERT INTO user (username, password_hash, is_admin) VALUES (?, ?, 0)");
if (!$stmt) {
    http_response_code(500);
    echo json_encode(['error' => 'prepare failed: ' . $mysqli->error]);
    exit;
}
$stmt->bind_param('ss', $username, $hash);

if (!$stmt->execute()) {
    if ($mysqli->errno === 1062) {
        http_response_code(409);
        echo json_encode(['error' => 'username already exists']);
    } else {
        http_response_code(500);
        echo json_encode(['error' => 'db error: ' . $stmt->error]);
    }
    exit;
}

$_SESSION['username'] = $username;
echo json_encode(['status' => 'ok', 'username' => $username]);
