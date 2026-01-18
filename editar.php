<?php
require_once 'config.php';

if ($_SERVER['REQUEST_METHOD'] == 'POST' && isset($_POST['id'])) {
    $id = (int)$_POST['id'];
    $novo_nome = trim($_POST['novo_nome']);

    if (!empty($novo_nome)) {
        try {
            $stmt = $pdo->prepare("UPDATE arquivos SET nome_real = ? WHERE id = ?");
            $stmt->execute([$novo_nome, $id]);
            echo json_encode(['status' => 'success']);
        } catch (PDOException $e) {
            echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
        }
    }
} else {
    echo json_encode(['status' => 'error', 'message' => 'ID ou novo nome não informado.']);
 }