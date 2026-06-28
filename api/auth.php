<?php
// api/auth.php

require_once 'config.php';

header('Content-Type: application/json');

// Parse JSON body or POST form data
$inputData = json_decode(file_get_contents('php://input'), true) ?? $_POST;
$action = $_GET['action'] ?? $inputData['action'] ?? 'status';

if ($action === 'status') {
    if (isset($_SESSION['logado']) && $_SESSION['logado'] === true && isset($_SESSION['user_id'])) {
        try {
            $stmt = $pdo->prepare("SELECT id, usuario FROM usuarios WHERE id = ?");
            $stmt->execute([$_SESSION['user_id']]);
            $user = $stmt->fetch();
            if ($user) {
                echo json_encode([
                    'logged' => true,
                    'user' => [
                        'id' => (int)$user['id'],
                        'usuario' => $user['usuario']
                    ]
                ]);
                exit;
            }
        } catch (PDOException $e) {
            echo json_encode(['logged' => false, 'error' => $e->getMessage()]);
            exit;
        }
    }
    echo json_encode(['logged' => false]);
    exit;
}

if ($action === 'login') {
    $user = trim($inputData['usuario'] ?? '');
    $pass = $inputData['senha'] ?? '';
    $recaptchaResponse = $inputData['g-recaptcha-response'] ?? '';

    if (empty($user) || empty($pass)) {
        echo json_encode(['status' => 'error', 'message' => 'Preencha todos os campos!']);
        exit;
    }

    // 1. Validar reCAPTCHA
    $secret = "6LfhcJ8aAAAAAHcBHcc1FfPLFAwUDj2mQAKqtVcc";
    $verifyUrl = "https://www.google.com/recaptcha/api/siteverify?secret={$secret}&response=" . urlencode($recaptchaResponse);
    $verify = @file_get_contents($verifyUrl);
    $responseData = json_decode($verify);

    if (!$responseData || !$responseData->success) {
        echo json_encode(['status' => 'error', 'message' => 'Por favor, confirme que você não é um robô.']);
        exit;
    }

    try {
        // 2. Validar Usuário
        $stmt = $pdo->prepare("SELECT * FROM usuarios WHERE usuario = ?");
        $stmt->execute([$user]);
        $usuario = $stmt->fetch();

        if ($usuario && password_verify($pass, $usuario['senha'])) {
            $_SESSION['logado'] = true;
            $_SESSION['user_id'] = $usuario['id'];
            
            echo json_encode([
                'status' => 'success',
                'user' => [
                    'id' => (int)$usuario['id'],
                    'usuario' => $usuario['usuario']
                ]
            ]);
            exit;
        } else {
            sleep(1); // Atraso para dificultar ataques de força bruta
            echo json_encode(['status' => 'error', 'message' => 'Usuário ou senha inválidos!']);
            exit;
        }
    } catch (PDOException $e) {
        echo json_encode(['status' => 'error', 'message' => 'Erro interno: ' . $e->getMessage()]);
        exit;
    }
}

if ($action === 'logout') {
    // Limpa a sessão
    $_SESSION = [];
    if (ini_get("session.use_cookies")) {
        $params = session_get_cookie_params();
        setcookie(session_name(), '', time() - 42000,
            $params["path"], $params["domain"],
            $params["secure"], $params["httponly"]
        );
    }
    session_destroy();
    echo json_encode(['status' => 'success']);
    exit;
}

echo json_encode(['status' => 'error', 'message' => 'Ação inválida.']);
