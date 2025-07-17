<?php
// Restituisce un seed casuale JSON base64
$default = [
  'axiom'=>'F',
  'rules'=>['F'=>'F[+F]F[-F]F'],
  'depth'=>4,
  'angle'=>25
];
echo json_encode(['genome'=>base64_encode(json_encode($default))]);