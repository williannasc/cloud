<?php
// api/arquivos.php

require_once 'config.php';

header('Content-Type: application/json');

$pai_id = isset($_GET['pai_id']) ? (int)$_GET['pai_id'] : 0;

// 1. Caminho recursivo (breadcrumb)
function buscarCaminho($id, $pdo)
{
    $caminho = [];
    while ($id > 0) {
        $stmt = $pdo->prepare("SELECT id, nome_real, diretorio_id FROM arquivos WHERE id = ?");
        $stmt->execute([$id]);
        $pasta = $stmt->fetch();
        if (!$pasta) break;
        
        // Converte id para int
        $pasta['id'] = (int)$pasta['id'];
        $pasta['diretorio_id'] = (int)$pasta['diretorio_id'];
        
        array_unshift($caminho, $pasta);
        $id = $pasta['diretorio_id'];
    }
    return $caminho;
}

try {
    $lista_breadcrumb = buscarCaminho($pai_id, $pdo);

    // 2. Lógica voltar
    $id_voltar = 0;
    $nome_atual = 'Inicio';
    
    if ($pai_id > 0) {
        $stmt_v = $pdo->prepare("SELECT nome_real, diretorio_id FROM arquivos WHERE id = ?");
        $stmt_v->execute([$pai_id]);
        $res_v = $stmt_v->fetch();
        if ($res_v) {
            $id_voltar = (int)($res_v['diretorio_id'] ?? 0);
            $nome_atual = $res_v['nome_real'];
        }
    }

    // 3. Busca itens
    $stmt = $pdo->prepare("SELECT * FROM arquivos WHERE diretorio_id = ? ORDER BY tipo DESC, nome_real ASC");
    $stmt->execute([$pai_id]);
    $todos_itens = $stmt->fetchAll();

    // 4. Calcula o espaço total utilizado no storage
    $stmt_t = $pdo->query("SELECT SUM(tamanho) AS total FROM arquivos WHERE tipo = 'arquivo'");
    $tamanho_total_usado = (int)$stmt_t->fetchColumn();

    $pastas = [];
    $arquivos = [];
    
    foreach ($todos_itens as $it) {
        // Cast ids to int
        $it['id'] = (int)$it['id'];
        $it['diretorio_id'] = (int)$it['diretorio_id'];
        
        if ($it['tipo'] === 'pasta') {
            $pastas[] = [
                'id' => $it['id'],
                'nome_real' => $it['nome_real'],
                'diretorio_id' => $it['diretorio_id'],
                'tipo' => 'pasta',
                'criado_em' => $it['criado_em']
            ];
        } else {
            $it['tamanho'] = (int)$it['tamanho'];
            $arquivos[] = [
                'id' => $it['id'],
                'nome_real' => $it['nome_real'],
                'nome_sistema' => $it['nome_sistema'],
                'diretorio_id' => $it['diretorio_id'],
                'tipo' => 'arquivo',
                'tamanho' => $it['tamanho'],
                'tamanho_formatado' => formatarTamanho($it['tamanho']),
                'extensao' => $it['extensao'],
                'criado_em' => $it['criado_em']
            ];
        }
    }

    $free_space = @disk_free_space(UPLOAD_DIR);
    if ($free_space === false) {
        $free_space = 15 * 1024 * 1024 * 1024; // Fallback 15GB
    }
    $limite_total = $tamanho_total_usado + $free_space;

    echo json_encode([
        'status' => 'success',
        'pai_id' => $pai_id,
        'nome_atual' => $nome_atual,
        'id_voltar' => $id_voltar,
        'breadcrumb' => $lista_breadcrumb,
        'pastas' => $pastas,
        'arquivos' => $arquivos,
        'tamanho_total_usado' => $tamanho_total_usado,
        'tamanho_total_usado_formatado' => formatarTamanho($tamanho_total_usado),
        'limite_total' => $limite_total,
        'limite_total_formatado' => formatarTamanho($limite_total)
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
}
