<?php
require_once 'db.php';
header('Content-Type: application/json');

if (!isset($_GET['name'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Missing name']);
    exit;
}
$name = $_GET['name'];
$owner_param = isset($_GET['owner']) ? $_GET['owner'] : null;

// check se l'utente e' admin
$is_admin = false;
if (isset($_SESSION['username'])) {
    $a = $mysqli->prepare("SELECT is_admin FROM user WHERE username = ?"); 
    if ($a) {
        $a->bind_param('s', $_SESSION['username']);
        $a->execute();
        $ares = $a->get_result();
        if ($ares && $row = $ares->fetch_assoc()) {
            $is_admin = (int)$row['is_admin'] === 1;
        }
        $a->close();
    }
}

// se viene fornito l'owner, prendi quel disegno
if ($owner_param !== null) {
    $stmt = $mysqli->prepare("SELECT name, owner, axiom, depth, angle, starting_rot, line_width, scale, is_public FROM drawing WHERE name = ? AND owner = ?");
    $stmt->bind_param('ss', $name, $owner_param);
} else {
    // altrimenti seleziona qualsiasi disegno
    if ($is_admin) {
        $stmt = $mysqli->prepare("SELECT name, owner, axiom, depth, angle, starting_rot, line_width, scale, is_public FROM drawing WHERE name = ?");
        $stmt->bind_param('s', $name);
    } elseif (isset($_SESSION['username'])) {
        $user = $_SESSION['username'];
        $stmt = $mysqli->prepare("SELECT name, owner, axiom, depth, angle, starting_rot, line_width, scale, is_public FROM drawing WHERE name = ? AND (is_public = 1 OR owner = ?)");
        $stmt->bind_param('ss', $name, $user);
    } else {
        $stmt = $mysqli->prepare("SELECT name, owner, axiom, depth, angle, starting_rot, line_width, scale, is_public FROM drawing WHERE name = ? AND is_public = 1");
        $stmt->bind_param('s', $name);
    }
}

if ($stmt === false) {
    http_response_code(500);
    echo json_encode(['error' => 'DB prepare failed: ' . $mysqli->error]);
    exit;
}

$stmt->execute();
$res = $stmt->get_result();
if ($res->num_rows === 0) {
    http_response_code(404);
    echo json_encode(['error' => 'Drawing not found or access denied']);
    exit;
}
$drawing = $res->fetch_assoc(); 
$stmt->close();

$rstmt = $mysqli->prepare("SELECT id, variable, replacement, movement_type, color FROM rule WHERE drawing_name = ? AND owner = ?");
$rstmt->bind_param('ss', $drawing['name'], $drawing['owner']);
$rstmt->execute();
$rres = $rstmt->get_result();
$rules = [];
while ($row = $rres->fetch_assoc()) $rules[] = $row;
$rstmt->close();

$drawing['is_public'] = (int)$drawing['is_public'];
$drawing['rules'] = $rules;

echo json_encode($drawing, JSON_UNESCAPED_UNICODE);

?>