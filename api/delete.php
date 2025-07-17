<?php
require '../db/connection.php';
require '../utils/session.php';
session_start(); requireAuth();
$data = json_decode(file_get_contents('php://input'), true);
$id = (int)$data['id'];
$uid = $_SESSION['user_id'];
$pdo = getPDO();
$stmt = $pdo->prepare('DELETE FROM plants WHERE id=? AND user_id=?');
$stmt->execute([$id, $uid]);
echo json_encode(['status'=>'ok']);