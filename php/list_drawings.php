<?php
require_once 'db.php';
header('Content-Type: application/json; charset=utf-8');

$q = isset($_GET['q']) ? trim($_GET['q']) : null;
$page = isset($_GET['page']) ? (int)$_GET['page'] : 1;
$per_page = isset($_GET['per_page']) ? (int)$_GET['per_page'] : 25;

if ($page < 1) $page = 1;
if ($per_page < 1) $per_page = 25;
if ($per_page > 100) $per_page = 100;
$offset = ($page - 1) * $per_page;

if ($q !== null && mb_strlen($q) > 128) $q = mb_substr($q, 0, 128);

$where_clauses = [];
$params = [];
$types = '';

// check dell'identita' dell'utente
if (isset($_SESSION['username'])) {
    $where_clauses[] = "(is_public = 1 OR owner = ?)";
    $types .= 's';
    $params[] = $_SESSION['username'];
} else { // un utente non loggato vede solo i disegni pubblici
    $where_clauses[] = "(is_public = 1)";
}

if ($q !== null && $q !== '') {
    $where_clauses[] = "name LIKE ?";
    $types .= 's';
    $params[] = '%' . $q . '%';
}

$where = implode(' AND ', $where_clauses); # unisci gli elementi per creare la query

$count_sql = "SELECT COUNT(*) AS cnt FROM drawing WHERE $where";
$cstmt = $mysqli->prepare($count_sql);
if ($cstmt === false) {
    http_response_code(500);
    echo json_encode(['error' => 'DB prepare failed: ' . $mysqli->error], JSON_UNESCAPED_UNICODE);
    exit;
}
if ($types !== '') {
    $cstmt->bind_param($types, ...$params);
}
$cstmt->execute();
$cres = $cstmt->get_result();
$total = 0;
if ($cres && $row = $cres->fetch_assoc()) $total = (int)$row['cnt'];
$cstmt->close();

$sql = "SELECT name, owner, depth, angle, starting_rot, line_width, scale, is_public
        FROM drawing
        WHERE $where
        ORDER BY name ASC
        LIMIT ? OFFSET ?";

$mstmt = $mysqli->prepare($sql);
if ($mstmt === false) {
    http_response_code(500);
    echo json_encode(['error' => 'DB prepare failed: ' . $mysqli->error], JSON_UNESCAPED_UNICODE);
    exit;
}

$bind_types = $types . 'ii';
$bind_params = $params;
$bind_params[] = $per_page;
$bind_params[] = $offset;

$refs = [];
foreach ($bind_params as $key => $value) {
    $refs[$key] = &$bind_params[$key];
}
array_unshift($refs, $bind_types);

call_user_func_array([$mstmt, 'bind_param'], $refs);

if (!$mstmt->execute()) {
    http_response_code(500);
    echo json_encode(['error' => 'DB execute failed: ' . $mstmt->error], JSON_UNESCAPED_UNICODE);
    exit;
}

$result = $mstmt->get_result();

$drawings = [];
while ($row = $result->fetch_assoc()) {
    $row['is_public'] = (int)$row['is_public'];
    $drawings[] = $row;
}
$mstmt->close();

$response = [
    'page' => $page,
    'per_page' => $per_page,
    'total' => $total,
    'drawings' => $drawings
];

echo json_encode($response, JSON_UNESCAPED_UNICODE);
