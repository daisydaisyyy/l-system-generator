<?php
require_once 'db.php';
header('Content-Type: application/json');

$input = json_decode(file_get_contents('php://input'), true);
if (!$input) {
    http_response_code(400);
    echo json_encode(['error' => 'JSON not valid']);
    exit;
}

if (!isset($_SESSION['username'])) {
    http_response_code(401);
    echo json_encode(['error' => 'You must be logged in to save a drawing']);
    exit;
}

// sanitize degli input usando strip_tags per evitare Stored XSS
$name = isset($input['name']) ? strip_tags(trim($input['name'])) : null;
$owner = $_SESSION['username'];
$axiom = isset($input['axiom']) ? strip_tags(trim($input['axiom'])) : '';


$depth = isset($input['depth']) ? (int)$input['depth'] : 0;
$angle = isset($input['angle']) ? (float)$input['angle'] : 0.0;
$starting_rot = isset($input['starting_rot']) ? (float)$input['starting_rot'] : 0.0;
$line_width = isset($input['line_width']) ? (float)$input['line_width'] : 1.0;
$scale = isset($input['scale']) ? (float)$input['scale'] : 1.0;
$is_public = isset($input['is_public']) ? (int)$input['is_public'] : 0;

if (!$name || mb_strlen($name) > 128) {
    http_response_code(400);
    echo json_encode(['error' => 'Name not valid']);
    exit;
}

$insert_sql = "INSERT INTO drawing (name, owner, axiom, depth, angle, starting_rot, line_width, scale, is_public)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";
$stmt = $mysqli->prepare($insert_sql);
if ($stmt === false) {
    http_response_code(500);
    echo json_encode(['error' => 'DB prepare failed: ' . $mysqli->error]);
    exit;
}

$stmt->bind_param("sssiddddi", $name, $owner, $axiom, $depth, $angle, $starting_rot, $line_width, $scale, $is_public);
if (!$stmt->execute()) {
    if ($mysqli->errno === 1062) {
        http_response_code(409);
        echo json_encode(['error' => 'Drawing already exists for this user']);
    } else {
        http_response_code(500);
        echo json_encode(['error' => 'DB execute failed: ' . $stmt->error]);
    }
    exit;
}
$stmt->close();


if (!empty($input['rules']) && is_array($input['rules'])) {
    
    $rstmt = $mysqli->prepare("INSERT INTO rule (variable, drawing_name, owner, replacement, movement_type, color) VALUES (?, ?, ?, ?, ?, ?)");
    if ($rstmt === false) {
        http_response_code(500);
        echo json_encode(['error' => 'DB prepare failed (rule): ' . $mysqli->error]);
        exit;
    }
    
    foreach ($input['rules'] as $rule) {
        // filtro sugli input per evitare XSS nelle rules
        $variable = isset($rule['variable']) ? strip_tags($rule['variable']) : null;
        $replacement = isset($rule['replacement']) ? strip_tags($rule['replacement']) : ''; // default: stringa vuota
        
        $movement_type = isset($rule['movement_type']) ? $rule['movement_type'] : 'noOp';
        $color = isset($rule['color']) ? $rule['color'] : '#000000'; // se non e' fornito, uso un colore di default

        if ($variable === null) continue; // non salvo le regole senza variabile

        $rstmt->bind_param("ssssss", $variable, $name, $owner, $replacement, $movement_type, $color);
        if (!$rstmt->execute()) {
            error_log("Failed to insert rule for variable $variable: " . $rstmt->error);
            continue; 
        }
    }
    $rstmt->close();
}

echo json_encode(['status' => 'ok', 'name' => $name, 'owner' => $owner]);

?>