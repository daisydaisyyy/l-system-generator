<?php
require_once 'db.php';
header('Content-Type: application/json');

$input = json_decode(file_get_contents('php://input'), true);
if (!$input) {
    http_response_code(400);
    echo json_encode(['error' => 'JSON non valido']);
    exit;
}

if (!isset($_SESSION['username'])) {
    http_response_code(401);
    echo json_encode(['error' => 'Devi essere loggato per salvare un disegno']);
    exit;
}


$name = isset($input['name']) ? trim($input['name']) : null;
$owner = $_SESSION['username'];
$axiom = isset($input['axiom']) ? trim($input['axiom']) : '';
$depth = isset($input['depth']) ? (int)$input['depth'] : 0;
$angle = isset($input['angle']) ? (float)$input['angle'] : 0.0;
$starting_rot = isset($input['starting_rot']) ? (float)$input['starting_rot'] : 0.0;
$line_width = isset($input['line_width']) ? (float)$input['line_width'] : 1.0;
$scale = isset($input['scale']) ? (float)$input['scale'] : 1.0;
$is_public = isset($input['is_public']) ? (int)$input['is_public'] : 0;

if (!$name || mb_strlen($name) > 128) {
    http_response_code(400);
    echo json_encode(['error' => 'Nome non valido']);
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

// --- CORREZIONE SALVATAGGIO REGOLE ---
if (!empty($input['rules']) && is_array($input['rules'])) {
    
    $rstmt = $mysqli->prepare("INSERT INTO rule (variable, drawing_name, replacement, movement_type, color) VALUES (?, ?, ?, ?, ?)");
    if ($rstmt === false) {
        http_response_code(500);
        echo json_encode(['error' => 'DB prepare failed (rule): ' . $mysqli->error]);
        exit;
    }
    
    $jrstmt = $mysqli->prepare("INSERT INTO drawing_rule (drawing_name, owner, rule) VALUES (?, ?, ?)");
    if ($jrstmt === false) {
        http_response_code(500);
        echo json_encode(['error' => 'DB prepare failed (drawing_rule): ' . $mysqli->error]);
        exit;
    }

    foreach ($input['rules'] as $rule) {
        $variable = isset($rule['variable']) ? $rule['variable'] : null;
        $replacement = isset($rule['replacement']) ? $rule['replacement'] : ''; // Default a stringa vuota se null
        
         $movement_type = isset($rule['movement_type']) ? $rule['movement_type'] : 'noOp';
        $color = isset($rule['color']) ? $rule['color'] : '#000000'; // Default se non fornito

        if ($variable === null) continue; // Non salvare regole senza variabile

        $rstmt->bind_param("sssss", $variable, $name, $replacement, $movement_type, $color);
        if (!$rstmt->execute()) {
            error_log("Failed to insert rule for variable $variable: " . $rstmt->error);
            continue; 
        }
        
        $rule_id = $mysqli->insert_id;
        $jrstmt->bind_param("ssi", $name, $owner, $rule_id);
        $jrstmt->execute();
    }
    $rstmt->close();
    $jrstmt->close();
}

echo json_encode(['status' => 'ok', 'name' => $name, 'owner' => $owner]);

?>