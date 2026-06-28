<?php
// api/editar.php

require_once 'config.php';

header('Content-Type: application/json');

$inputData = json_decode(file_get_contents('php://input'), true) ?? $_POST;

if (isset($inputData['id'])) {
    $id = (int)$inputData['id'];
    $novo_nome = trim($inputData['novo_nome'] ?? '');

    if (!empty($novo_nome)) {
        try {
            $stmt = $pdo->prepare("UPDATE arquivos SET nome_real = ? WHERE id = ?");
            $stmt->execute([$novo_nome, $id]);
            echo json_encode(['status' => 'success']);
        } catch (PDOException $e) {
            echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
        }
    } else {
        echo json_encode(['status' => 'error', 'message' => 'O novo nome não pode ser vazio.']);
    }
} else {
    echo json_encode(['status' => 'error', 'message' => 'ID não informado.']);
}
