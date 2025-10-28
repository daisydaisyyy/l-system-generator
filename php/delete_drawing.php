<?php
require_once 'db.php';
header('Content-Type: application/json');

if (!isset($_SESSION['username'])) {
    http_response_code(401);
    echo json_encode(['error' => 'Devi essere loggato per eliminare un disegno']);
    exit;
}

if (!isset($_GET['name'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Nome del disegno mancante']);
    exit;
}

$name = $_GET['name'];
$owner = $_SESSION['username']; 

$mysqli->begin_transaction();

try {
    $stmt_find_rules = $mysqli->prepare("SELECT rule FROM drawing_rule WHERE drawing_name = ? AND owner = ?");
    if (!$stmt_find_rules) throw new Exception('DB prepare (find rules) failed: ' . $mysqli->error);
    
    $stmt_find_rules->bind_param('ss', $name, $owner);
    if (!$stmt_find_rules->execute()) throw new Exception('DB execute (find rules) failed: ' . $stmt_find_rules->error);

    $res = $stmt_find_rules->get_result();
    $rule_ids = [];
    while ($row = $res->fetch_assoc()) {
        $rule_ids[] = $row['rule'];
    }
    $stmt_find_rules->close();

    $stmt_del_drawing = $mysqli->prepare("DELETE FROM drawing WHERE name = ? AND owner = ?");
    if (!$stmt_del_drawing) throw new Exception('DB prepare failed: ' . $mysqli->error);
    
    $stmt_del_drawing->bind_param('ss', $name, $owner);
    if (!$stmt_del_drawing->execute()) throw new Exception('DB execute failed: ' . $stmt_del_drawing->error);


    if ($stmt_del_drawing->affected_rows === 0) {
        throw new Exception('Drawing not found or you are not its owner', 404);
    }
    $stmt_del_drawing->close();

    if (!empty($rule_ids)) {
        $placeholders = implode(',', array_fill(0, count($rule_ids), '?'));
        $types = str_repeat('i', count($rule_ids));
        
        $stmt_del_rules = $mysqli->prepare("DELETE FROM rule WHERE id IN ($placeholders)");
        if (!$stmt_del_rules) throw new Exception('DB prepare (del rules) failed: ' . $mysqli->error);

        $stmt_del_rules->bind_param($types, ...$rule_ids);
        if (!$stmt_del_rules->execute()) throw new Exception('DB execute (del rules) failed: ' . $stmt_del_rules->error);
        
        $stmt_del_rules->close();
    }

    $mysqli->commit();
    echo json_encode(['status' => 'ok', 'message' => 'Disegno eliminato con successo']);

} catch (Exception $e) {
    $mysqli->rollback();
    
    $code = $e->getCode() === 404 ? 404 : 500;
    http_response_code($code);
    echo json_encode(['error' => $e->getMessage()]);
}
?>