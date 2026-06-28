<?php
// api/mover.php

require_once 'config.php';

header('Content-Type: application/json');

$inputData = json_decode(file_get_contents('php://input'), true) ?? $_POST;

if (isset($inputData['id']) && isset($inputData['destino_id'])) {
    $id = (int)$inputData['id'];
    $destino_id = (int)$inputData['destino_id'];

    if ($id === $destino_id) {
        echo json_encode(['status' => 'error', 'message' => 'Não é possível mover um item para dentro de si mesmo.']);
        exit;
    }

    try {
        // Obter informações do item a ser movido
        $stmt = $pdo->prepare("SELECT tipo FROM arquivos WHERE id = ?");
        $stmt->execute([$id]);
        $item = $stmt->fetch();

        if (!$item) {
            echo json_encode(['status' => 'error', 'message' => 'Item não encontrado.']);
            exit;
        }

        // Se for pasta, verificar se o destino não é subpasta dela
        if ($item['tipo'] === 'pasta' && $destino_id > 0) {
            $currentId = $destino_id;
            $loopDetected = false;
            while ($currentId > 0) {
                if ($currentId === $id) {
                    $loopDetected = true;
                    break;
                }
                $chk = $pdo->prepare("SELECT diretorio_id FROM arquivos WHERE id = ? AND tipo = 'pasta'");
                $chk->execute([$currentId]);
                $row = $chk->fetch();
                if (!$row) break;
                $currentId = (int)$row['diretorio_id'];
            }

            if ($loopDetected) {
                echo json_encode(['status' => 'error', 'message' => 'Não é possível mover uma pasta para dentro de uma subpasta dela mesma.']);
                exit;
            }
        }

        // Realiza o UPDATE
        $stmt = $pdo->prepare("UPDATE arquivos SET diretorio_id = ? WHERE id = ?");
        $stmt->execute([$destino_id, $id]);
        echo json_encode(['status' => 'success']);
    } catch (PDOException $e) {
        echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
    }
} else {
    echo json_encode(['status' => 'error', 'message' => 'Parâmetros insuficientes.']);
}
