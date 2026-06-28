<?php
// api/excluir.php

require_once 'config.php';

header('Content-Type: application/json');

$inputData = json_decode(file_get_contents('php://input'), true) ?? $_POST;
$id = isset($_GET['id']) ? (int)$_GET['id'] : (isset($inputData['id']) ? (int)$inputData['id'] : 0);

if ($id > 0) {
    try {
        // 1. Busca os dados do item antes de deletar
        $stmt = $pdo->prepare("SELECT * FROM arquivos WHERE id = ?");
        $stmt->execute([$id]);
        $item = $stmt->fetch();

        if ($item) {
            if ($item['tipo'] === 'pasta') {
                // 2. Verifica se a pasta está vazia
                $stmt_del = $pdo->prepare("SELECT COUNT(*) FROM arquivos WHERE diretorio_id = ?");
                $stmt_del->execute([$id]);
                $tem_filhos = $stmt_del->fetchColumn();

                if ($tem_filhos > 0) {
                    echo json_encode(['status' => 'error', 'message' => 'A pasta não está vazia!']);
                    exit;
                }
            } else {
                // 3. Tenta deletar o arquivo físico
                $caminho_fisico = UPLOAD_DIR . $item['nome_sistema'];
                if (file_exists($caminho_fisico)) {
                    @unlink($caminho_fisico);
                }
            }

            // 4. Deleta o registro no banco de dados
            $pdo->prepare("DELETE FROM arquivos WHERE id = ?")->execute([$id]);
            echo json_encode(['status' => 'success']);
        } else {
            echo json_encode(['status' => 'error', 'message' => 'Item não encontrado ou já excluído.']);
        }
    } catch (PDOException $e) {
        echo json_encode(['status' => 'error', 'message' => 'Erro ao excluir: ' . $e->getMessage()]);
    }
} else {
    echo json_encode(['status' => 'error', 'message' => 'ID não informado.']);
}
