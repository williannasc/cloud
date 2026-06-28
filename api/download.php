<?php
// api/download.php

require_once 'config.php';

if (isset($_GET['id'])) {
    $id = (int)$_GET['id'];

    try {
        // Busca as informações do arquivo no banco
        $stmt = $pdo->prepare("SELECT * FROM arquivos WHERE id = ? AND tipo = 'arquivo'");
        $stmt->execute([$id]);
        $arquivo = $stmt->fetch();

        if ($arquivo) {
            $caminho_fisico = UPLOAD_DIR . $arquivo['nome_sistema'];

            if (file_exists($caminho_fisico)) {
                // Limpa o buffer de saída para evitar arquivos corrompidos
                if (ob_get_level()) {
                    ob_end_clean();
                }

                // Configura os cabeçalhos para o navegador
                header('Content-Description: File Transfer');
                header('Content-Type: application/octet-stream');
                header('Content-Disposition: attachment; filename="' . $arquivo['nome_real'] . '"');
                header('Expires: 0');
                header('Cache-Control: must-revalidate');
                header('Pragma: public');
                header('Content-Length: ' . filesize($caminho_fisico));

                // Lê o arquivo e envia para o navegador
                readfile($caminho_fisico);
                exit;
            } else {
                http_response_code(404);
                die("Erro: Arquivo físico não encontrado no servidor.");
            }
        } else {
            http_response_code(404);
            die("Erro: Registro não encontrado no banco de dados.");
        }
    } catch (PDOException $e) {
        http_response_code(500);
        die("Erro interno no banco de dados: " . $e->getMessage());
    }
} else {
    http_response_code(400);
    die("Erro: ID não informado.");
}
