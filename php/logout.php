<?php
require_once 'db.php';
header('Content-Type: application/json');

session_unset();
session_destroy();
echo json_encode(['status' => 'ok']);
?>
