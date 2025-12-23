<?php
require_once 'db.php';
header('Content-Type: application/json');

if (!isset($_SESSION['username'])) {
    http_response_code(401);
    echo json_encode(['error' => 'You must be logged in to delete a drawing']);
    exit;
}

if (!isset($_GET['name'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Missing drawing name']);
    exit;
}

$name = $_GET['name'];
$owner = $_SESSION['username']; 

$mysqli->begin_transaction();

try {
    
    $stmt_del_drawing = $mysqli->prepare("DELETE FROM drawing WHERE name = ? AND owner = ?");
    if (!$stmt_del_drawing) throw new Exception('DB prepare failed: ' . $mysqli->error);
    
    $stmt_del_drawing->bind_param('ss', $name, $owner);
    if (!$stmt_del_drawing->execute()) throw new Exception('DB execute failed: ' . $stmt_del_drawing->error);

    if ($stmt_del_drawing->affected_rows === 0) {
        throw new Exception('Drawing not found or you are not its owner', 404);
    }
    $stmt_del_drawing->close();

    $mysqli->commit();
    echo json_encode(['status' => 'ok', 'message' => 'Drawing deleted successfully.']);

} catch (Exception $e) {
    $mysqli->rollback();
    
    $code = $e->getCode() === 404 ? 404 : 500;
    http_response_code($code);
    echo json_encode(['error' => $e->getMessage()]);
}
?>