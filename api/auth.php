<?php
require 'db.php';
// Verifica session_token e restituisce user_id
function authenticate() {
    // leggere JSON input, validare token
    // se valido, return user_id
    // altrimenti, http_response_code(401) + exit
}