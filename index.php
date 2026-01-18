<?php
require_once 'config.php';

// 1. LÓGICA DE NAVEGAÇÃO
$pai_id = isset($_GET['pai_id']) ? (int)$_GET['pai_id'] : 0;

// 2. BREADCRUMB RECURSIVO
function buscarCaminho($id, $pdo)
{
    $caminho = [];
    while ($id > 0) {
        $stmt = $pdo->prepare("SELECT id, nome_real, diretorio_id FROM arquivos WHERE id = ?");
        $stmt->execute([$id]);
        $pasta = $stmt->fetch();
        if (!$pasta) break;
        array_unshift($caminho, $pasta);
        $id = $pasta['diretorio_id'];
    }
    return $caminho;
}
$lista_breadcrumb = buscarCaminho($pai_id, $pdo);

// 3. LOGICA VOLTAR
$id_voltar = 0;
if ($pai_id > 0) {
    $stmt_v = $pdo->prepare("SELECT diretorio_id FROM arquivos WHERE id = ?");
    $stmt_v->execute([$pai_id]);
    $res_v = $stmt_v->fetch();
    $id_voltar = $res_v['diretorio_id'] ?? 0;
}

// 4. BUSCA ITENS
$stmt = $pdo->prepare("SELECT * FROM arquivos WHERE diretorio_id = ? ORDER BY tipo DESC, nome_real ASC");
$stmt->execute([$pai_id]);
$todos_itens = $stmt->fetchAll();

$pastas = [];
$arquivos = [];
foreach ($todos_itens as $it) {
    if ($it['tipo'] == 'pasta') $pastas[] = $it;
    else $arquivos[] = $it;
}

function getIcone($item)
{
    if ($item['tipo'] == 'pasta') return ['icon' => 'fa-folder', 'color' => '#fbbf24'];
    $ext = strtolower($item['extensao'] ?? '');
    return match ($ext) {
        'pdf'  => ['icon' => 'fa-file-pdf', 'color' => '#f87171'],
        'jpg', 'png', 'jpeg', 'webp' => ['icon' => 'fa-file-image', 'color' => '#34d399'],
        'zip', 'rar', '7z' => ['icon' => 'fa-file-archive', 'color' => '#a78bfa'],
        'xls', 'xlsx', 'csv' => ['icon' => 'fa-file-excel', 'color' => '#10b981'],
        default => ['icon' => 'fa-file', 'color' => '#94a3b8'],
    };
}
?>
<!DOCTYPE html>
<html lang="pt-br">

<head>
    <meta charset="UTF-8">
    <title>PrivatCloud Pro</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" rel="stylesheet">
    <link href="style.css" rel="stylesheet">
</head>

<main>

    <body>
        <button class="btn-menu-mobile d-md-none" onclick="toggleSidebar()">
            <i class="fa-solid fa-bars"></i>
        </button>

        <div class="wrapper">
            <aside class="sidebar">
                <h4 class="fw-bold mb-5 text-info text-center"><i class="fa-solid fa-cloud-bolt me-2"></i> PrivatCloud</h4>
                <div class="nav flex-column gap-2">
                    <a href="index.php" class="nav-link text-white active bg-primary bg-opacity-10 rounded p-2 text-decoration-none" onclick="toggleSidebar()">
                        <i class="fa fa-home me-2"></i> Arquivos
                    </a>
                    <a href="logout.php" class="nav-link text-danger mt-4 p-2 text-decoration-none small"><i class="fa fa-power-off me-2"></i> Sair</a>
                </div>
            </aside>

            <main class="main-content">
                <div class="d-flex justify-content-between align-items-center mb-4">
                    <nav aria-label="breadcrumb">
                        <ol class="breadcrumb mb-0">
                            <li class="breadcrumb-item"><a href="index.php">Inicio</a></li>
                            <?php foreach ($lista_breadcrumb as $p): ?>
                                <li class="breadcrumb-item"><a href="index.php?pai_id=<?= $p['id'] ?>"><?= htmlspecialchars($p['nome_real']) ?></a></li>
                            <?php endforeach; ?>
                        </ol>
                    </nav>
                    <div class="d-flex gap-2">
                        <button class="btn btn-outline-secondary border-0 text-white" data-bs-toggle="modal" data-bs-target="#modalPasta"><i class="fa fa-folder-plus fs-5"></i></button>
                        <button class="btn btn-info rounded-pill px-4 fw-bold" data-bs-toggle="modal" data-bs-target="#modalUpload"><i class="fa fa-upload me-2"></i> Novo</button>
                    </div>
                </div>

                <?php if (!empty($pastas) || $pai_id > 0): ?>
                    <p class="section-title">Diretórios</p>
                    <div class="row g-3">
                        <?php if ($pai_id > 0): ?>
                            <div class="col-md-3">
                                <div class="folder-card" onclick="window.location.href='index.php?pai_id=<?= $id_voltar ?>'">
                                    <i class="fa fa-chevron-left text-secondary me-3"></i><b>Voltar</b>
                                </div>
                            </div>
                        <?php endif; ?>
                        <?php foreach ($pastas as $p): ?>
                            <div class="col-md-3">
                                <div class="folder-card">
                                    <div class="item-actions">
                                        <button onclick="event.stopPropagation(); abrirModalEditar(<?= $p['id'] ?>, '<?= htmlspecialchars($p['nome_real']) ?>')" class="btn-action-tool btn-edit-tool"><i class="fa fa-pen"></i></button>
                                        <button onclick="event.stopPropagation(); abrirModalConfirmaExclusao(<?= $p['id'] ?>)" class="btn-action-tool btn-del-tool"><i class="fa fa-trash"></i></button>
                                    </div>
                                    <div class="d-flex align-items-center w-100" onclick="window.location.href='index.php?pai_id=<?= $p['id'] ?>'">
                                        <i class="fa-solid fa-folder text-warning me-3 fs-5"></i>
                                        <span class="text-truncate fw-medium"><?= htmlspecialchars($p['nome_real']) ?></span>
                                    </div>
                                </div>
                            </div>
                        <?php endforeach; ?>
                    </div>
                <?php endif; ?>

                <p class="section-title">Arquivos</p>
                <div class="row g-4">
                    <?php foreach ($arquivos as $a): $estilo = getIcone($a); ?>
                        <div class="col-6 col-md-3 col-lg-2">
                            <div class="file-card-v2">
                                <div class="item-actions">
                                    <button onclick="event.stopPropagation(); window.location.href='download.php?id=<?= $a['id'] ?>'" class="btn-action-tool btn-down-tool" title="Download"><i class="fa fa-download"></i></button>
                                    <button onclick="event.stopPropagation(); abrirModalEditar(<?= $a['id'] ?>, '<?= htmlspecialchars($a['nome_real']) ?>')" class="btn-action-tool btn-edit-tool"><i class="fa fa-pen"></i></button>
                                    <button onclick="event.stopPropagation(); abrirModalConfirmaExclusao(<?= $a['id'] ?>)" class="btn-action-tool btn-del-tool"><i class="fa fa-trash"></i></button>
                                </div>
                                <div class="w-100 h-100 d-flex flex-column align-items-center" onclick="abrirPreview(<?= $a['id'] ?>, '<?= addslashes($a['nome_real']) ?>', '<?= $a['extensao'] ?>')">
                                    <i class="fa-solid <?= $estilo['icon'] ?> mb-3 fs-1" style="color: <?= $estilo['color'] ?>;"></i>
                                    <h6 class="mb-1 text-truncate small fw-bold text-white w-100"><?= htmlspecialchars($a['nome_real']) ?></h6>
                                    <span class="text-secondary small opacity-50"><?= formatarTamanho($a['tamanho']) ?></span>
                                </div>
                            </div>
                        </div>
                    <?php endforeach; ?>
                </div>
            </main>
        </div>

        <div class="modal fade" id="modalPreview" tabindex="-1" aria-hidden="true">
            <div class="modal-dialog modal-dialog-centered modal-lg">
                <div class="modal-content bg-dark border-secondary text-white shadow-lg">
                    <div class="modal-header border-secondary p-2 px-3">
                        <h6 class="modal-title fw-bold small" id="previewTitle">Visualizar</h6>
                        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body p-0 d-flex justify-content-center align-items-center" id="previewContainer" style="min-height: 300px; background: #000;"></div>
                    <div class="modal-footer border-secondary p-2 px-3 d-flex justify-content-end">
                        <button onclick="copiarLinkPublico()" class="btn btn-outline-accent btn-sm rounded-pill px-3 fw-bold">
                            <i class="fa fa-share-nodes me-1"></i> Compartilhar
                        </button>
                        <a href="#" id="previewDownloadBtn" class="btn btn-info btn-sm rounded-pill px-3 fw-bold">Baixar Arquivo</a>
                    </div>
                </div>
            </div>
        </div>

        <div class="modal fade" id="modalConfirmaExcluir" tabindex="-1" aria-hidden="true">
            <div class="modal-dialog modal-dialog-centered">
                <div class="modal-content bg-dark border-secondary text-white shadow-lg">
                    <div class="modal-header border-0 pb-0">
                        <h6 class="modal-title fw-bold text-danger"><i class="fa fa-triangle-exclamation me-2"></i> Confirmar</h6>
                        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body text-center py-4">
                        <p class="mb-0 small opacity-75">Deseja realmente excluir este item permanentemente?</p>
                        <input type="hidden" id="id_excluir_temp">
                    </div>
                    <div class="modal-footer border-0 p-3 pt-0 d-flex">
                        <button type="button" class="btn btn-outline-light btn-sm rounded-pill flex-grow-1" data-bs-dismiss="modal">Não</button>
                        <button type="button" onclick="confirmarExclusaoFinal()" class="btn btn-danger btn-sm rounded-pill flex-grow-1 fw-bold">Sim, Excluir</button>
                    </div>
                </div>
            </div>
        </div>

        <div class="modal fade" id="modalEditar" tabindex="-1" aria-hidden="true">
            <div class="modal-dialog modal-dialog-centered">
                <div class="modal-content bg-dark border-secondary text-white shadow-lg">
                    <form id="formEditar">
                        <div class="modal-header border-secondary">
                            <h6 class="modal-title fw-bold">Renomear</h6><button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <input type="hidden" name="id" id="edit_id">
                            <input type="text" name="novo_nome" id="edit_nome" class="form-control form-control-sm bg-dark text-white border-secondary rounded-pill px-3" required autocomplete="off">
                        </div>
                        <div class="modal-footer border-0 p-3 pt-0"><button type="submit" class="btn btn-info btn-sm w-100 fw-bold rounded-pill">SALVAR</button></div>
                    </form>
                </div>
            </div>
        </div>

        <div class="modal fade" id="modalUpload" tabindex="-1" aria-hidden="true">
            <div class="modal-dialog modal-dialog-centered">
                <div class="modal-content bg-dark border-secondary text-white">
                    <form id="formUpload">
                        <div class="modal-header border-secondary">
                            <h5 class="modal-title fw-bold">Upload</h5><button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <input type="hidden" name="diretorio_id" value="<?= $pai_id ?>">
                            <div class="mb-3"><label class="small text-secondary mb-1">Arquivo</label><input type="file" name="arquivo" class="form-control form-control-sm bg-dark text-white border-secondary rounded-pill" required></div>
                            <div class="mb-3"><label class="small text-secondary mb-1">Nome no Sistema (Opcional)</label><input type="text" name="nome_custom" class="form-control form-control-sm bg-dark text-white border-secondary rounded-pill" placeholder="Ex: Foto_Verão"></div>
                            <div class="progress d-none" style="height: 6px;">
                                <div id="barraProgresso" class="progress-bar bg-info" role="progressbar"></div>
                            </div>
                        </div>
                        <div class="modal-footer border-0 p-3 pt-0"><button type="submit" id="btnUpload" class="btn btn-info btn-sm w-100 fw-bold rounded-pill">UPLOAD</button></div>
                    </form>
                </div>
            </div>
        </div>

        <div class="modal fade" id="modalPasta" tabindex="-1" aria-hidden="true">
            <div class="modal-dialog modal-dialog-centered">
                <div class="modal-content bg-dark border-secondary text-white">
                    <form id="formPasta">
                        <div class="modal-header border-secondary">
                            <h5 class="modal-title fw-bold">Nova Pasta</h5><button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <input type="hidden" name="pai_id" value="<?= $pai_id ?>">
                            <input type="text" name="nome_pasta" class="form-control form-control-sm bg-dark text-white border-secondary rounded-pill" placeholder="Nome" required autocomplete="off">
                        </div>
                        <div class="modal-footer border-0 p-3 pt-0"><button type="submit" class="btn btn-info btn-sm w-100 fw-bold rounded-pill">CRIAR PASTA</button></div>
                    </form>
                </div>
            </div>
        </div>

        <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
        <script>
            let idAtualParaCompartilhar = null;
            // LÓGICA DO PREVIEW
            const modalPreview = new bootstrap.Modal(document.getElementById('modalPreview'));

            function abrirPreview(id, nome, ext) {
                idAtualParaCompartilhar = id; // Guarda o ID aqui para compartilhar depois
                const container = document.getElementById('previewContainer');
                const title = document.getElementById('previewTitle');
                const downloadBtn = document.getElementById('previewDownloadBtn');

                title.innerText = nome;
                downloadBtn.href = 'download.php?id=' + id;
                container.innerHTML = '<div class="text-white opacity-50 small">Carregando preview...</div>';

                const imgExts = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'];
                const pdfExts = ['pdf'];

                if (imgExts.includes(ext.toLowerCase())) {
                    container.innerHTML = `<img src="download.php?id=${id}" alt="Preview">`;
                } else if (pdfExts.includes(ext.toLowerCase())) {
                    container.innerHTML = `<iframe src="download.php?id=${id}"></iframe>`;
                } else {
                    container.innerHTML = `<div class="text-center p-5"><i class="fa fa-file-lines fa-3x mb-3 opacity-20"></i><br><span class="small">Preview não disponível para .${ext}</span></div>`;
                }
                modalPreview.show();
            }

            // LÓGICA DE COMPARTILHAMENTO
            function copiarLinkPublico() {
                if (!idAtualParaCompartilhar) return;

                // Gera o hash (MD5 do ID) para o link ficar "encurtado" e seguro
                // Em JS não temos MD5 nativo fácil, então vamos pedir pro PHP ou usar o ID direto mas recomendo via HASH.
                // Para simplificar agora, vamos gerar a URL:
                const hash = btoa(idAtualParaCompartilhar); // Um base64 simples para o link não ficar feio
                const urlPublica = window.location.origin + '/s.php?h=' + hash; // wn.dev.br/s.php?h=...

                navigator.clipboard.writeText(urlPublica).then(() => {
                    const btn = event.target.closest('button');
                    const originalText = btn.innerHTML;
                    btn.innerHTML = '<i class="fa fa-check"></i> Copiado!';
                    btn.classList.replace('btn-outline-accent', 'btn-success');

                    setTimeout(() => {
                        btn.innerHTML = originalText;
                        btn.classList.replace('btn-success', 'btn-outline-accent');
                    }, 2000);
                });
            }

            // LÓGICA DO MODAL DE EXCLUSÃO
            const modalDel = new bootstrap.Modal(document.getElementById('modalConfirmaExcluir'));

            function abrirModalConfirmaExclusao(id) {
                document.getElementById('id_excluir_temp').value = id;
                modalDel.show();
            }

            function confirmarExclusaoFinal() {
                const id = document.getElementById('id_excluir_temp').value;
                fetch('excluir.php?id=' + id).then(r => r.json()).then(d => {
                    if (d.status === 'success') {
                        location.reload();
                    } else {
                        alert(d.message);
                        modalDel.hide();
                    }
                });
            }

            function abrirModalEditar(id, nome) {
                document.getElementById('edit_id').value = id;
                document.getElementById('edit_nome').value = nome;
                new bootstrap.Modal(document.getElementById('modalEditar')).show();
            }
            document.getElementById('formEditar').onsubmit = function(e) {
                e.preventDefault();
                fetch('editar.php', {
                    method: 'POST',
                    body: new FormData(this)
                }).then(r => r.json()).then(d => location.reload());
            };
            document.getElementById('formUpload').onsubmit = function(e) {
                e.preventDefault();
                const barra = document.getElementById('barraProgresso');
                document.getElementById('btnUpload').disabled = true;
                barra.parentElement.classList.remove('d-none');
                const xhr = new XMLHttpRequest();
                xhr.open('POST', 'upload.php', true);
                xhr.upload.onprogress = function(e) {
                    if (e.lengthComputable) barra.style.width = Math.round((e.loaded / e.total) * 100) + '%';
                };
                xhr.onload = function() {
                    location.reload();
                };
                xhr.send(new FormData(this));
            };
            document.getElementById('formPasta').onsubmit = function(e) {
                e.preventDefault();
                fetch('criar_pasta.php', {
                    method: 'POST',
                    body: new FormData(this)
                }).then(r => r.json()).then(d => location.reload());
            };

            function toggleSidebar() {
                document.querySelector('.sidebar').classList.toggle('active');

                // Muda o ícone de bars para X quando abre
                const icon = document.querySelector('.btn-menu-mobile i');
                if (icon.classList.contains('fa-bars')) {
                    icon.classList.replace('fa-bars', 'fa-xmark');
                } else {
                    icon.classList.replace('fa-xmark', 'fa-bars');
                }
            }
        </script>


    </body>

    <footer class="mt-5 pt-4 pb-4">
        <hr class="opacity-10 mb-4">
        <div class="container-fluid">
            <div class="row align-items-center">
                <div class="col-md-6 text-center text-md-start">
                    <p class="small text-secondary mb-0">
                        &copy; <?= date('Y') ?> <span class="text-info fw-bold">PrivatCloud Pro</span>.
                        <span class="d-none d-sm-inline">Todos os direitos reservados.</span>
                    </p>
                </div>
                <div class="col-md-6 text-center text-md-end mt-3 mt-md-0">
                    <span class="badge rounded-pill bg-dark border border-secondary text-secondary p-2 px-3">
                        <i class="fa fa-hdd me-1"></i> Servidor: <span class="text-white">wn.dev.br</span>
                    </span>
                </div>
            </div>
        </div>
    </footer>
</main>





</html>