<?php
// api/criar_pasta.php

require_once 'config.php';

header('Content-Type: application/json');

$inputData = json_decode(file_get_contents('php://input'), true) ?? $_POST;

if (isset($inputData['nome_pasta'])) {
    $nome = trim($inputData['nome_pasta']);
    $pai_id = (int)($inputData['pai_id'] ?? 0);

    if (!empty($nome)) {
        try {
            $stmt = $pdo->prepare("INSERT INTO arquivos (nome_real, diretorio_id, tipo) VALUES (?, ?, 'pasta')");
            $stmt->execute([$nome, $pai_id]);
            echo json_encode([
                'status' => 'success',
                'id' => (int)$pdo->lastInsertId()
            ]);
        } catch (PDOException $e) {
            echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
        }
    } else {
        echo json_encode(['status' => 'error', 'message' => 'Nome da pasta não pode ser vazio.']);
    }
} else {
    echo json_encode(['status' => 'error', 'message' => 'Nome da pasta não informado.']);
}
