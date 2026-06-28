<?php
// s.php - Link público de compartilhamento

// Configurações de exibição de erros
ini_set('display_errors', 0); // Oculta erros em produção
ini_set('display_startup_errors', 0);
error_reporting(0);

// Função para ler arquivo .env
function loadEnv($path)
{
    if (!file_exists($path)) return;
    $lines = file($path, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        $line = trim($line);
        if (empty($line) || str_starts_with($line, '#')) continue;
        if (strpos($line, '=') !== false) {
            list($name, $value) = explode('=', $line, 2);
            $name = trim($name);
            $value = trim($value);
            $value = trim($value, '"\'');
            if (!array_key_exists($name, $_SERVER) && !array_key_exists($name, $_ENV)) {
                putenv("{$name}={$value}");
                $_ENV[$name] = $value;
                $_SERVER[$name] = $value;
            }
        }
    }
}
loadEnv(__DIR__ . '/.env');

// Configurações de Banco de Dados
$host    = $_ENV['DB_HOST'] ?? '127.0.0.1';
$db      = $_ENV['DB_NAME'] ?? 'cloud_db';
$user    = $_ENV['DB_USER'] ?? 'root';
$pass    = $_ENV['DB_PASS'] ?? '';
$charset = 'utf8mb4';

try {
    $pdo = new PDO("mysql:host=$host;dbname=$db;charset=$charset", $user, $pass);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
} catch (PDOException $e) {
    die("Erro de conexão com o banco de dados.");
}

define('UPLOAD_DIR', __DIR__ . '/storage/');

if (!isset($_GET['h'])) {
    die("Link inválido ou expirado.");
}

$id = (int)base64_decode($_GET['h']);
if ($id <= 0) {
    die("Arquivo inválido.");
}

try {
    $stmt = $pdo->prepare("SELECT * FROM arquivos WHERE id = ? AND tipo = 'arquivo'");
    $stmt->execute([$id]);
    $arquivo = $stmt->fetch();
} catch (PDOException $e) {
    die("Erro interno ao buscar arquivo.");
}

if (!$arquivo) {
    die("Arquivo não encontrado ou removido.");
}

$caminho_fisico = UPLOAD_DIR . $arquivo['nome_sistema'];
if (!file_exists($caminho_fisico)) {
    die("Arquivo físico não encontrado no servidor.");
}

// Se o parâmetro download estiver setado, envia o arquivo diretamente
if (isset($_GET['download']) && $_GET['download'] == 1) {
    if (ob_get_level()) {
        ob_end_clean();
    }
    
    // Identifica Mime-Type correto
    $ext = strtolower($arquivo['extensao'] ?? '');
    $mime = match ($ext) {
        'pdf'  => 'application/pdf',
        'jpg', 'jpeg' => 'image/jpeg',
        'png'  => 'image/png',
        'gif'  => 'image/gif',
        'webp' => 'image/webp',
        'svg'  => 'image/svg+xml',
        default => 'application/octet-stream',
    };

    header('Content-Description: File Transfer');
    header('Content-Type: ' . $mime);
    
    // Se for PDF ou imagem, mostra no navegador (inline), senão baixa (attachment)
    $disposition = in_array($ext, ['pdf', 'jpg', 'jpeg', 'png', 'gif', 'webp', 'svg']) ? 'inline' : 'attachment';
    header('Content-Disposition: ' . $disposition . '; filename="' . $arquivo['nome_real'] . '"');
    header('Expires: 0');
    header('Cache-Control: must-revalidate');
    header('Pragma: public');
    header('Content-Length: ' . filesize($caminho_fisico));
    readfile($caminho_fisico);
    exit;
}

// Caso contrário, mostra a tela de preview customizada
function formatSize($bytes) {
    if ($bytes >= 1073741824) return number_format($bytes / 1073741824, 2) . ' GB';
    if ($bytes >= 1048576) return number_format($bytes / 1048576, 2) . ' MB';
    if ($bytes >= 1024) return number_format($bytes / 1024, 2) . ' KB';
    return $bytes . ' bytes';
}

$ext = strtolower($arquivo['extensao'] ?? '');
$isImage = in_array($ext, ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg']);
$isPdf = $ext === 'pdf';
?>
<!DOCTYPE html>
<html lang="pt-br">
<head>
    <meta charset="UTF-8">
    <title><?= htmlspecialchars($arquivo['nome_real']) ?> - Compartilhamento público</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" rel="stylesheet">
    <style>
        body {
            background: radial-gradient(circle at top, #1e293b, #0f172a, #020617);
            color: white;
            font-family: 'Inter', sans-serif;
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            margin: 0;
            padding: 20px;
        }
        .share-card {
            background: rgba(30, 41, 59, 0.45);
            backdrop-filter: blur(16px);
            -webkit-backdrop-filter: blur(16px);
            border: 1px solid rgba(255, 255, 255, 0.08);
            border-radius: 24px;
            padding: 2.5rem;
            width: 100%;
            max-width: 650px;
            box-shadow: 0 30px 60px -15px rgba(0, 0, 0, 0.6);
            text-align: center;
            transition: all 0.3s;
        }
        .preview-container {
            background: #020617;
            border-radius: 16px;
            overflow: hidden;
            margin-bottom: 2rem;
            max-height: 380px;
            display: flex;
            align-items: center;
            justify-content: center;
            border: 1px solid rgba(255, 255, 255, 0.05);
        }
        .preview-container img {
            max-width: 100%;
            max-height: 380px;
            object-fit: contain;
        }
        .preview-container iframe {
            width: 100%;
            height: 380px;
            border: none;
        }
        .btn-download {
            background: #38bdf8;
            color: #0b0f1a;
            font-weight: 800;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            border-radius: 50px;
            padding: 14px 40px;
            text-decoration: none;
            display: inline-block;
            transition: all 0.3s;
            border: none;
        }
        .btn-download:hover {
            background: #7dd3fc;
            box-shadow: 0 12px 20px -3px rgba(56, 189, 248, 0.4);
            transform: translateY(-2px);
            color: #0b0f1a;
        }
    </style>
</head>
<body>
    <div class="share-card">
        <div class="mb-4">
            <i class="fa-solid fa-cloud-bolt fa-3x text-info mb-2"></i>
            <h5 class="text-secondary small">Private Drive Share</h5>
        </div>

        <?php if ($isImage): ?>
            <div class="preview-container">
                <img src="s.php?h=<?= $_GET['h'] ?>&download=1" alt="Preview">
            </div>
        <?php elseif ($isPdf): ?>
            <div class="preview-container">
                <iframe src="s.php?h=<?= $_GET['h'] ?>&download=1"></iframe>
            </div>
        <?php else: ?>
            <div class="py-5 mb-4 bg-dark bg-opacity-40 rounded-3">
                <i class="fa-solid fa-file-arrow-down fa-5x text-secondary opacity-40 mb-3"></i>
                <p class="text-secondary small">Visualização indisponível para este tipo de arquivo</p>
            </div>
        <?php endif; ?>

        <h4 class="fw-bold mb-1 text-truncate" title="<?= htmlspecialchars($arquivo['nome_real']) ?>">
            <?= htmlspecialchars($arquivo['nome_real']) ?>
        </h4>
        <p class="text-secondary small mb-4"><?= formatSize($arquivo['tamanho']) ?></p>

        <a href="s.php?h=<?= $_GET['h'] ?>&download=1" class="btn btn-download px-5 py-3 fs-6">
            <i class="fa fa-download me-2"></i> Baixar Arquivo
        </a>
    </div>
</body>
</html>
