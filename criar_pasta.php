<?php
require_once 'config.php';

if ($_SERVER['REQUEST_METHOD'] == 'POST' && isset($_POST['nome_pasta'])) {
    $nome = trim($_POST['nome_pasta']);
    $pai_id = (int)$_POST['pai_id'];

    if (!empty($nome)) {
        try {
            $stmt = $pdo->prepare("INSERT INTO arquivos (nome_real, diretorio_id, tipo) VALUES (?, ?, 'pasta')");
            $stmt->execute([$nome, $pai_id]);
            echo json_encode(['status' => 'success']);
        } catch (PDOException $e) {
            echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
        }
    }
} else {
    echo json_encode(['status' => 'error', 'message' => 'Nome da pasta não informado.']);
}