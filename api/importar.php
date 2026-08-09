<?php
// api/importar.php

require_once 'config.php';

header('Content-Type: application/json');

// Apenas aceita requisições se o arquivo for especificado
$filename = isset($_GET['arquivo']) ? trim($_GET['arquivo']) : '';
$diretorio_id = isset($_GET['diretorio_id']) ? (int)$_GET['diretorio_id'] : 0;

if (empty($filename)) {
    echo json_encode([
        'status' => 'error',
        'message' => 'Informe o nome do arquivo copiado na pasta storage. Ex: ?arquivo=nome_do_arquivo.iso'
    ]);
    exit;
}

// Sanitiza o nome do arquivo para evitar Directory Traversal (../)
$filename = basename($filename);
$source_path = UPLOAD_DIR . $filename;

if (!file_exists($source_path)) {
    echo json_encode([
        'status' => 'error',
        'message' => "O arquivo '$filename' nao foi encontrado fisicamente dentro do diretorio 'storage/'."
    ]);
    exit;
}

try {
    $ext = strtolower(pathinfo($filename, PATHINFO_EXTENSION));
    $tamanho = filesize($source_path);
    
    // Gera um nome unico de sistema para evitar conflitos
    $nome_sistema = uniqid() . "_" . bin2hex(random_bytes(4)) . "." . $ext;
    $dest_path = UPLOAD_DIR . $nome_sistema;

    // Renomeia o arquivo fisicamente para o padrao do sistema
    if (rename($source_path, $dest_path)) {
        // Insere o registro no banco de dados
        $stmt = $pdo->prepare("INSERT INTO arquivos (nome_real, nome_sistema, diretorio_id, tipo, tamanho, extensao) VALUES (?, ?, ?, 'arquivo', ?, ?)");
        $stmt->execute([$filename, $nome_sistema, $diretorio_id, $tamanho, $ext]);
        
        echo json_encode([
            'status' => 'success',
            'message' => "Arquivo '$filename' importado e registrado com sucesso!",
            'item' => [
                'id' => (int)$pdo->lastInsertId(),
                'nome_real' => $filename,
                'diretorio_id' => $diretorio_id,
                'tamanho_formatado' => formatarTamanho($tamanho)
            ]
        ]);
    } else {
        echo json_encode([
            'status' => 'error',
            'message' => 'Falha ao renomear o arquivo no disco.'
        ]);
    }
} catch (Exception $e) {
    echo json_encode([
        'status' => 'error',
        'message' => 'Erro durante a importacao: ' . $e->getMessage()
    ]);
}
