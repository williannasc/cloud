<?php
// api/upload.php

require_once 'config.php';

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] == 'POST' && isset($_FILES['arquivo'])) {
    try {
        $arquivo = $_FILES['arquivo'];
        $diretorio_id = isset($_POST['diretorio_id']) ? (int)$_POST['diretorio_id'] : 0;
        
        // Verifica se foi informado um caminho relativo de pasta (Ex: SOFTWARES/chrome.exe)
        $relative_path = isset($_POST['relative_path']) ? trim($_POST['relative_path']) : '';
        if (!empty($relative_path)) {
            // Divide o caminho em partes
            $parts = explode('/', $relative_path);
            array_pop($parts); // Remove o nome do arquivo (ex: "chrome.exe") para sobrar apenas as pastas
            
            $current_parent_id = $diretorio_id;
            foreach ($parts as $folder_name) {
                $folder_name = trim($folder_name);
                if (empty($folder_name)) continue;
                
                // Verifica se a pasta já existe no nível atual
                $chk = $pdo->prepare("SELECT id FROM arquivos WHERE nome_real = ? AND diretorio_id = ? AND tipo = 'pasta'");
                $chk->execute([$folder_name, $current_parent_id]);
                $folder = $chk->fetch();
                
                if ($folder) {
                    $current_parent_id = (int)$folder['id'];
                } else {
                    // Cria a pasta automaticamente
                    $ins = $pdo->prepare("INSERT INTO arquivos (nome_real, diretorio_id, tipo) VALUES (?, ?, 'pasta')");
                    $ins->execute([$folder_name, $current_parent_id]);
                    $current_parent_id = (int)$pdo->lastInsertId();
                }
            }
            // Atualiza o diretorio_id para ser a pasta final criada/encontrada
            $diretorio_id = $current_parent_id;
        }

        $ext = strtolower(pathinfo($arquivo['name'], PATHINFO_EXTENSION));
        $nome_real = $arquivo['name'];
        $nome_sistema = uniqid() . "_" . bin2hex(random_bytes(4)) . "." . $ext;
        $caminho_final = UPLOAD_DIR . $nome_sistema;

        if (move_uploaded_file($arquivo['tmp_name'], $caminho_final)) {
            $nome_personalizado = trim($_POST['nome_custom'] ?? '');
            $nome_real = !empty($nome_personalizado) ? $nome_personalizado : $arquivo['name'];

            // Se o usuário esqueceu a extensão no nome personalizado, readiciona
            $ext_original = pathinfo($arquivo['name'], PATHINFO_EXTENSION);
            if (!empty($nome_personalizado) && !str_ends_with(strtolower($nome_personalizado), strtolower($ext_original))) {
                if (!empty($ext_original)) {
                    $nome_real .= "." . $ext_original;
                }
            }

            // Insere o registro do arquivo
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
            
            echo json_encode([
                'status' => 'success',
                'id' => (int)$pdo->lastInsertId()
            ]);
        } else {
            echo json_encode(['status' => 'error', 'message' => 'Erro ao mover arquivo para storage. Verifique as permissões de escrita da pasta.']);
        }
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['status' => 'error', 'message' => 'Erro no banco de dados: ' . $e->getMessage()]);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['status' => 'error', 'message' => 'Erro geral: ' . $e->getMessage()]);
    }
} else {
    echo json_encode(['status' => 'error', 'message' => 'Nenhum arquivo enviado.']);
}
