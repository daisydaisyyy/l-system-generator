<?php
require '../db/connection.php';
require '../utils/session.php';
require '../utils/validate.php';
session_start(); requireAuth();
$data = json_decode(file_get_contents('php://input'), true);
$genome = $data['genome'] ?? '';
$name = sanitize($data['name'] ?? 'Untitled');
$uid = $_SESSION['user_id'];
$pdo = getPDO();
$stmt = $pdo->prepare('INSERT INTO plants (user_id, name, genome) VALUES (?,?,?)');
$stmt->execute([$uid, $name, $genome]);
echo json_encode(['status'=>'ok']);