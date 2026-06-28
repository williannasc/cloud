<?php
// api/mover.php

require_once 'config.php';

header('Content-Type: application/json');

$inputData = json_decode(file_get_contents('php://input'), true) ?? $_POST;

// Suporte batch: aceita "ids" (array) ou "id" (single)
$ids = [];
if (isset($inputData['ids']) && is_array($inputData['ids'])) {
    $ids = array_map('intval', $inputData['ids']);
} elseif (isset($inputData['id'])) {
    $ids = [(int)$inputData['id']];
}

if (empty($ids) || !isset($inputData['destino_id'])) {
    echo json_encode(['status' => 'error', 'message' => 'Parâmetros insuficientes.']);
    exit;
}

$destino_id = (int)$inputData['destino_id'];
$errors = [];
$moved = 0;

try {
    foreach ($ids as $id) {
        if ($id === $destino_id) {
            $errors[] = "Item ID $id: Não é possível mover para dentro de si mesmo.";
            continue;
        }

        // Obter informações do item a ser movido
        $stmt = $pdo->prepare("SELECT tipo FROM arquivos WHERE id = ?");
        $stmt->execute([$id]);
        $item = $stmt->fetch();

        if (!$item) {
            $errors[] = "Item ID $id: não encontrado.";
            continue;
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
                $errors[] = "Item ID $id: Não é possível mover uma pasta para dentro de uma subpasta dela mesma.";
                continue;
            }
        }

        // Realiza o UPDATE
        $stmt = $pdo->prepare("UPDATE arquivos SET diretorio_id = ? WHERE id = ?");
        $stmt->execute([$destino_id, $id]);
        $moved++;
    }

    if ($moved > 0) {
        echo json_encode(['status' => 'success', 'moved' => $moved, 'errors' => $errors]);
    } else {
        echo json_encode(['status' => 'error', 'message' => implode(' | ', $errors)]);
    }
} catch (PDOException $e) {
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
}
