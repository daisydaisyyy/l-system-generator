<?php
session_start();
function requireAuth() {
    if (empty($_SESSION['user_id'])) {
        http_response_code(401);
        exit(json_encode(['error'=>'Unauthorized']));
    }
}