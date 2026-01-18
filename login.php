<?php
require_once 'config.php';

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $user = $_POST['usuario'];
    $pass = $_POST['senha'];

    $stmt = $pdo->prepare("SELECT * FROM usuarios WHERE usuario = ?");
    $stmt->execute([$user]);
    $usuario = $stmt->fetch();

    // Verificação de senha com password_hash
    if ($usuario && password_verify($pass, $usuario['senha'])) {
        $_SESSION['logado'] = true;
        $_SESSION['user_id'] = $usuario['id'];
        header("Location: index.php");
        exit;
    } else {
        $erro = "Usuário ou senha inválidos!";
    }
} 
?>
<!DOCTYPE html>
<html lang="pt-br">
<head>
    <meta charset="UTF-8">
    <title>Login | PrivatCloud</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <style>
        body { background: #0f172a; color: white; display: flex; align-items: center; justify-content: center; height: 100vh; }
        .login-card { background: #1e293b; padding: 2rem; border-radius: 15px; width: 100%; max-width: 400px; box-shadow: 0 10px 25px rgba(0,0,0,0.3); }
    </style>
</head>
<body>
    <div class="login-card">
        <h3 class="text-center mb-4"><i class="fa-solid fa-lock me-2"></i> PrivatCloud</h3>
        <?php if(isset($erro)): ?> <div class="alert alert-danger p-2 small"><?= $erro ?></div> <?php endif; ?>
        <form method="POST">
            <div class="mb-3">
                <label class="small text-white-50">Usuário</label>
                <input type="text" name="usuario" class="form-control bg-dark text-white border-secondary" required>
            </div>
            <div class="mb-3">
                <label class="small text-white-50">Senha</label>
                <input type="password" name="senha" class="form-control bg-dark text-white border-secondary" required>
            </div>
            <button type="submit" class="btn btn-info w-100 fw-bold">Entrar</button>
        </form>
    </div>
</body>
</html>