<?php

session_start();

// Lista de arquivos que NÃO precisam de login (o próprio login.php)
$arquivo_atual = basename($_SERVER['PHP_SELF']);

if (!isset($_SESSION['logado']) && $arquivo_atual != 'login.php') {
    header("Location: login.php");
    exit;
}


// Configurações de exibição de erros (importante no desenvolvimento)
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// Configurações de Banco de Dados
// Configure conforme seu ambiente local
$host    = 'localhost'; 
$db      = 'cloud_db'; 
$user    = 'root'; 
$pass    = ''; 
$charset = 'utf8mb4';

try {
    $pdo = new PDO("mysql:host=$host;dbname=$db;charset=$charset", $user, $pass);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
} catch (PDOException $e) {
    die("Erro na conexão: " . $e->getMessage());
}


// Configurações de Pastas
define('UPLOAD_DIR', __DIR__ . '/storage/'); // Onde os arquivos ficam fisicamente
define('BASE_URL', 'https://wn.dev.br/cloud/'); // Ajuste para sua URL



// Cria a pasta storage automaticamente se não existir
if (!file_exists(UPLOAD_DIR)) {
    mkdir(UPLOAD_DIR, 0777, true);
}

// Função auxiliar para formatar tamanho de arquivo
function formatarTamanho($bytes) {
    if ($bytes >= 1073741824) { $bytes = number_format($bytes / 1073741824, 2) . ' GB'; }
    elseif ($bytes >= 1048576) { $bytes = number_format($bytes / 1048576, 2) . ' MB'; }
    elseif ($bytes >= 1024) { $bytes = number_format($bytes / 1024, 2) . ' KB'; }
    else { $bytes = $bytes . ' bytes'; }
    return $bytes;
}