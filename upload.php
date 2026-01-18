<?php
require_once 'config.php';

if ($_SERVER['REQUEST_METHOD'] == 'POST' && isset($_FILES['arquivo'])) {
    try {
        $arquivo = $_FILES['arquivo'];
        $diretorio_id = (int)$_POST['diretorio_id'];
        
        $ext = strtolower(pathinfo($arquivo['name'], PATHINFO_EXTENSION));
        $nome_real = $arquivo['name'];
        $nome_sistema = uniqid() . "_" . bin2hex(random_bytes(4)) . "." . $ext;
        $caminho_final = UPLOAD_DIR . $nome_sistema;

        if (move_uploaded_file($arquivo['tmp_name'], $caminho_final)) {
            $nome_personalizado = trim($_POST['nome_custom'] ?? '');
            $nome_real = !empty($nome_personalizado) ? $nome_personalizado : $arquivo['name'];

            // Se o usuário esqueceu a extensão no nome personalizado, vamos readicionar
            $ext_original = pathinfo($arquivo['name'], PATHINFO_EXTENSION);
            if (!empty($nome_personalizado) && !str_ends_with(strtolower($nome_personalizado), strtolower($ext_original))) {
                $nome_real .= "." . $ext_original;
            }
            // Preparamos o SQL com as colunas exatas
            $sql = "INSERT INTO arquivos (nome_real, nome_sistema, diretorio_id, tipo, tamanho, extensao) 
                    VALUES (:nome, :sistema, :pai, 'arquivo', :tam, :ext)";
            
            $stmt = $pdo->prepare($sql);
            $stmt->execute([
                ':nome'    => $nome_real,
                ':sistema' => $nome_sistema,
                ':pai'     => $diretorio_id,
                ':tam'     => $arquivo['size'],
                ':ext'     => $ext
            ]);
            
            echo json_encode(['status' => 'success']);
        } else {
            echo json_encode(['status' => 'error', 'message' => 'Erro ao mover para storage']);
        }
    } catch (PDOException $e) {
        // Se o erro for no banco, ele vai te dizer o porquê
        http_response_code(500);
        echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
    }
} else {
    echo json_encode(['status' => 'error', 'message' => 'Nenhum arquivo enviado.']);
}