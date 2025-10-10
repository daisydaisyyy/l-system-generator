<?php
$mysqli = new mysqli("localhost", "root", "", "lsystems_db");
if ($mysqli->connect_error) {
    http_response_code(500);
    die("Connection error");
}

$data = json_decode(file_get_contents("php://input"), true);
if (!$data) {
    http_response_code(400);
    die("JSON is not valid");
}

$stmt = $mysqli->prepare("INSERT INTO l_system (name, axiom, depth, angle, starting_rot, line_width, scale) VALUES (?, ?, ?, ?, ?, ?, ?)");
$stmt->bind_param("ssiiiid", $data['name'], $data['axiom'], $data['depth'], $data['angle'], $data['starting_rot'], $data['line_width'], $data['scale']);
$stmt->execute();
$lsystem_id = $mysqli->insert_id;

if (!empty($data['rules'])) {
    $stmt = $mysqli->prepare("INSERT INTO rule (name, l_system, replacement) VALUES (?, ?, ?)");
    foreach ($data['rules'] as $rule) {
        $stmt->bind_param("sis", $rule['name'], $lsystem_id, $rule['replacement']);
        $stmt->execute();
    }
}

echo json_encode(["status" => "ok"]);
?>