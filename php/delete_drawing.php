<?php
require_once 'db.php';
header('Content-Type: application/json');

// Verifica che l'utente sia loggato
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

// Verifica che il disegno appartenga all'utente
$stmt = $mysqli->prepare("SELECT owner FROM drawing WHERE name = ?");
$stmt->bind_param('s', $name);
$stmt->execute();
$res = $stmt->get_result();

if ($res->num_rows === 0) {
    http_response_code(404);
    echo json_encode(['error' => 'Disegno non trovato']);
    exit;
}

$drawing = $res->fetch_assoc();
$stmt->close();

if ($drawing['owner'] !== $owner) {
    http_response_code(403);
    echo json_encode(['error' => 'Non hai il permesso di eliminare questo disegno']);
    exit;
}

// Elimina le regole associate al disegno
$rstmt = $mysqli->prepare("DELETE FROM rule WHERE drawing_name = ?");
$rstmt->bind_param('s', $name);
$rstmt->execute();
$rstmt->close();

// Elimina il disegno
$stmt = $mysqli->prepare("DELETE FROM drawing WHERE name = ?");
$stmt->bind_param('s', $name);
if ($stmt->execute()) {
    echo json_encode(['status' => 'ok', 'message' => 'Disegno eliminato con successo']);
} else {
    http_response_code(500);
    echo json_encode(['error' => 'Errore durante l\'eliminazione del disegno']);
}
$stmt->close();
?>
