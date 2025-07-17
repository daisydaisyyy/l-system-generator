<?php
require '../db/connection.php';
require '../utils/session.php';
session_start(); requireAuth();
$uid = $_SESSION['user_id'];
$pdo = getPDO();
$stmt = $pdo->prepare('SELECT id,name,genome FROM plants WHERE user_id=? ORDER BY created_at DESC');
$stmt->execute([$uid]);
echo json_encode($stmt->fetchAll());