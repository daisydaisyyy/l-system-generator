<?php
header('Content-Type: application/json');

if (!isset($_GET['name'])) {
  echo json_encode(['error' => 'Missing name']);
  exit;
}

$mysqli = new mysqli("localhost", "root", "", "lsystem_db");
if ($mysqli->connect_error) {
  die(json_encode(['error' => 'DB connection failed']));
}

$name = $mysqli->real_escape_string($_GET['name']);
$res = $mysqli->query("SELECT * FROM l_system WHERE name='$name'");
if (!$res || $res->num_rows === 0) {
  echo json_encode(['error' => 'L-System not found']);
  exit;
}

$l = $res->fetch_assoc();
$rules = [];
$rres = $mysqli->query("SELECT name, replacement FROM rule WHERE l_system='$name'");
while ($row = $rres->fetch_assoc())
  $rules[] = $row;

$l['rules'] = $rules;
echo json_encode($l);
?>