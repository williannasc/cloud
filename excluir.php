<?php
require_once 'config.php';

if (isset($_GET['id'])) {
    $id = (int)$_GET['id'];

    // 1. Busca os dados do item antes de deletar
    $stmt = $pdo->prepare("SELECT * FROM arquivos WHERE id = ?");
    $stmt->execute([$id]);
    $item = $stmt->fetch();

    if ($item) {
        if ($item['tipo'] == 'arquivo') {
            $caminho_fisico = UPLOAD_DIR . $item['nome_sistema'];
            
            // 2. Tenta deletar o arquivo físico no Windows
            if (file_exists($caminho_fisico)) {
                unlink($caminho_fisico);
            }
        }

        // 3. Deleta o registro no banco de dados
        $stmt_del = $pdo->prepare("SELECT COUNT(*) FROM arquivos WHERE diretorio_id = ?");
        $stmt_del->execute([$id]);
        $tem_filhos = $stmt_del->fetchColumn();

        if ($tem_filhos > 0) {
            die(json_encode(['status' => 'error', 'message' => 'Pasta não está vazia!']));
        }

        $pdo->prepare("DELETE FROM arquivos WHERE id = ?")->execute([$id]);
        echo json_encode(['status' => 'success']);
    }
} else {
    echo json_encode(['status' => 'error', 'message' => 'ID não informado.']);
}