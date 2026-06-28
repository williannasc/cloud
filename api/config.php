<?php
// api/config.php

session_start();

// Configurações de exibição de erros
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// Autenticação para todas as APIs exceto auth.php
$arquivo_atual = basename($_SERVER['PHP_SELF']);
if ($arquivo_atual !== 'auth.php' && $arquivo_atual !== 'config.php') {
    if (!isset($_SESSION['logado']) || $_SESSION['logado'] !== true) {
        header('Content-Type: application/json');
        http_response_code(401);
        echo json_encode(['status' => 'error', 'message' => 'Não autorizado. Faça login novamente.']);
        exit;
    }
}

// Função para ler arquivo .env na raiz e disponibilizar no $_ENV e getenv()
function loadEnv($path)
{
    if (!file_exists($path)) {
        return;
    }
    $lines = file($path, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        $line = trim($line);
        if (empty($line) || str_starts_with($line, '#')) {
            continue;
        }
        if (strpos($line, '=') !== false) {
            list($name, $value) = explode('=', $line, 2);
            $name = trim($name);
            $value = trim($value);
            // Remove aspas se houver
            $value = trim($value, '"\'');
            if (!array_key_exists($name, $_SERVER) && !array_key_exists($name, $_ENV)) {
                putenv("{$name}={$value}");
                $_ENV[$name] = $value;
                $_SERVER[$name] = $value;
            }
        }
    }
}

// Carrega o .env localizado na raiz do projeto (um nível acima de api/)
loadEnv(dirname(__DIR__) . '/.env');

// Configurações de Banco de Dados obtidas do .env
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
    header('Content-Type: application/json');
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => "Erro na conexão do banco: " . $e->getMessage()]);
    exit;
}

// Configurações de Pastas
define('UPLOAD_DIR', dirname(__DIR__) . '/storage/'); // Onde os arquivos ficam fisicamente
define('BASE_URL', $_ENV['BASE_URL'] ?? 'https://wn.dev.br/cloud/'); // URL base do sistema

// Cria a pasta storage se não existir
if (!file_exists(UPLOAD_DIR)) {
    mkdir(UPLOAD_DIR, 0777, true);
}

// Função auxiliar para formatar tamanho de arquivo
function formatarTamanho($bytes)
{
    if ($bytes >= 1073741824) {
        $bytes = number_format($bytes / 1073741824, 2) . ' GB';
    } elseif ($bytes >= 1048576) {
        $bytes = number_format($bytes / 1048576, 2) . ' MB';
    } elseif ($bytes >= 1024) {
        $bytes = number_format($bytes / 1024, 2) . ' KB';
    } else {
        $bytes = $bytes . ' bytes';
    }
    return $bytes;
}
