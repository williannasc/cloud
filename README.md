# ☁️ Private Drive

**Private Drive** é uma plataforma de armazenamento de arquivos pessoal e auto-hospedada, inspirada visualmente e funcionalmente no **Google Drive**. Construído com **React 19**, **Vite 8** e **PHP** com **MySQL**, ele oferece uma interface moderna, responsiva e rica em recursos para gerenciar seus arquivos diretamente em seu próprio servidor.

---

## 📸 Funcionalidades

### 📂 Gerenciamento de Arquivos e Pastas
- **Upload de Arquivos** — Envio individual ou múltiplo de arquivos via botão, drag-and-drop ou menu de contexto.
- **Upload de Pastas Completas** — Arraste uma pasta inteira do seu computador (incluindo subpastas) e a estrutura de diretórios será recriada automaticamente no banco de dados.
- **Criação de Pastas** — Crie novas pastas diretamente pela interface, pelo menu lateral ou clicando com o botão direito.
- **Renomear** — Renomeie arquivos e pastas com clique no menu de contexto ou nos três pontos.
- **Excluir** — Exclusão com confirmação visual em modal dedicado.
- **Mover Arquivos e Pastas** — Mova itens entre diretórios arrastando e soltando sobre pastas, ou pelo modal de navegação de caminhos.
- **Download** — Baixe qualquer arquivo diretamente com um clique.

### 👁️ Visualização Imersiva (Google Drive Style)
- **Preview Full-Screen** — Tela escura translúcida com overlay imersivo, semelhante ao Google Drive.
- **Player de Vídeo Nativo** — Arquivos `.mp4`, `.webm`, `.ogg`, `.mov`, `.mkv` são reproduzidos diretamente no navegador com controles HTML5.
- **Player de Áudio** — Arquivos `.mp3`, `.wav`, `.m4a`, `.flac` abrem um mini-player centralizado com controles nativos.
- **Visualização de Imagens** — Formatos `.jpg`, `.jpeg`, `.png`, `.gif`, `.webp`, `.svg` são exibidos em alta qualidade.
- **Preview de PDFs** — Documentos `.pdf` são renderizados em um iframe integrado.
- **Navegação por Setas** — Cicle entre arquivos da pasta ativa usando as teclas `←` / `→` do teclado ou clicando nas setas flutuantes laterais.
- **Atalho de Teclado** — Pressione `Esc` para fechar o preview instantaneamente.

### 🔗 Compartilhamento Público
- **Links Públicos** — Gere links de compartilhamento para qualquer arquivo. Quem acessar o link pode visualizar e baixar o arquivo sem precisar de login.
- **Página de Compartilhamento** — O sistema renderiza uma página pública estilizada (`s.php`) com preview, ícone do tipo de arquivo e botão de download.

### 🎨 Interface & Design
- **Visual Google Drive** — Layout fiel ao Google Drive com sidebar fixa, painel principal arredondado, breadcrumb de navegação e cards de pastas e arquivos.
- **Modo Grade/Lista** — Alterne entre visualização em grid (cards) ou lista (tabela) com um clique.
- **Ícones por Tipo de Arquivo** — Ícones dedicados e cores diferenciadas para vídeos, áudios, imagens, PDFs, planilhas, documentos de texto, executáveis, arquivos compactados e códigos-fonte.
- **Menus de Contexto** — Clique com o botão direito em arquivos, pastas ou no fundo vazio para acessar ações rápidas.
- **Painel de Upload** — Widget flutuante no canto inferior direito mostrando progresso em tempo real de cada upload com barra de porcentagem.
- **Drag and Drop** — Arraste arquivos ou pastas do seu sistema diretamente para a interface.
- **Dark Mode Nativo** — Toda a interface é projetada em dark mode com paleta de cores escura (`#131314` / `#1e1f20`).
- **Responsivo** — Layout adaptável que funciona em telas de diferentes tamanhos.

### 🔐 Autenticação e Segurança
- **Login com reCAPTCHA** — Proteção contra bots usando Google reCAPTCHA v2.
- **Sessões PHP** — Autenticação baseada em sessão com cookies seguros (`PHPSESSID`).
- **Senhas com Hash** — Senhas armazenadas com `password_hash()` e verificadas com `password_verify()`.
- **Middleware de Autenticação** — Todas as rotas da API (exceto login) verificam a sessão ativa antes de processar a requisição.
- **Proteção contra Força Bruta** — Delay de 1 segundo após tentativas de login inválidas.

---

## 🏗️ Arquitetura do Projeto

```
cloud/
├── api/                          # Backend PHP (REST API)
│   ├── config.php                # Configuração central (DB, sessão, .env loader)
│   ├── auth.php                  # Autenticação (login, logout, status)
│   ├── arquivos.php              # Listagem de arquivos e pastas (com breadcrumb)
│   ├── upload.php                # Upload de arquivos (com suporte a relative_path)
│   ├── download.php              # Download e streaming de arquivos
│   ├── criar_pasta.php           # Criação de novas pastas
│   ├── editar.php                # Renomear arquivos/pastas
│   ├── excluir.php               # Exclusão de arquivos/pastas
│   └── mover.php                 # Mover itens entre diretórios
│
├── src/                          # Frontend React (código-fonte)
│   ├── main.jsx                  # Ponto de entrada React
│   ├── App.jsx                   # Componente raiz (roteamento de telas)
│   ├── App.css                   # Estilos auxiliares do App
│   ├── index.css                 # Design system principal (1200+ linhas)
│   ├── services/
│   │   └── api.js                # Camada de comunicação HTTP (fetch + XHR)
│   └── components/
│       ├── Login.jsx             # Tela de login com reCAPTCHA
│       ├── FileManager.jsx       # Componente principal do dashboard
│       ├── Sidebar.jsx           # Barra lateral com navegação e "+ Novo"
│       ├── FileCard.jsx          # Card de arquivo (modo grade)
│       ├── FolderCard.jsx        # Chip de pasta (modo grade)
│       ├── ModalPreview.jsx      # Visualizador imersivo full-screen
│       ├── ModalUpload.jsx       # Modal de upload de arquivos
│       ├── ModalFolder.jsx       # Modal de criação de pasta
│       ├── ModalEdit.jsx         # Modal de renomear
│       ├── ModalDelete.jsx       # Modal de confirmação de exclusão
│       └── ModalMove.jsx         # Modal de mover com navegação de caminhos
│
├── storage/                      # Diretório físico dos uploads (auto-criado)
├── assets/                       # Build compilado (JS + CSS minificados)
├── dist/                         # Saída do Vite build (gerado automaticamente)
│
├── index.html                    # Arquivo principal servido pelo IIS/Apache
├── index.dev.html                # Template HTML para desenvolvimento (Vite)
├── s.php                         # Página pública de compartilhamento
├── favicon.svg                   # Ícone do site
├── icons.svg                     # Sprite de ícones SVG
│
├── .env                          # Variáveis de ambiente (NÃO versionado)
├── .htaccess                     # Configurações Apache (limites de upload)
├── .user.ini                     # Configurações PHP-FPM (limites de upload)
├── web.config                    # Configurações IIS (limites de upload)
├── vite.config.js                # Configuração do Vite (proxy, build)
├── package.json                  # Dependências Node.js
└── .gitignore                    # Arquivos ignorados pelo Git
```

---

## 🛠️ Stack Tecnológica

| Camada       | Tecnologia                                          |
|--------------|-----------------------------------------------------|
| **Frontend** | React 19, Vite 8, Lucide React (ícones)             |
| **Estilo**   | CSS puro (Vanilla CSS, sem frameworks)               |
| **Backend**  | PHP 8+ (procedural com PDO)                         |
| **Banco**    | MySQL / MariaDB (charset `utf8mb4`)                 |
| **Servidor** | IIS (Windows Server), Apache ou Nginx               |
| **CDN**      | Cloudflare (opcional, DNS proxy ou DNS only)         |
| **Captcha**  | Google reCAPTCHA v2                                  |

---

## 📋 Pré-requisitos

- **PHP** 8.0 ou superior
- **MySQL** 5.7+ ou **MariaDB** 10.3+
- **Node.js** 18+ e **npm** (apenas para desenvolvimento/build)
- **Servidor Web**: IIS (Windows), Apache ou Nginx
- Extensões PHP habilitadas: `pdo_mysql`, `json`, `session`, `fileinfo`

---

## 🚀 Instalação

### 1. Clone o repositório

```bash
git clone https://github.com/williannasc/cloud.git
cd cloud
```

### 2. Configure as variáveis de ambiente

Crie um arquivo `.env` na raiz do projeto:

```env
DB_HOST=127.0.0.1
DB_NAME=cloud_db
DB_USER=seu_usuario
DB_PASS=sua_senha
BASE_URL=https://seu-dominio.com/cloud/
```

### 3. Crie o banco de dados

Execute o seguinte SQL no seu MySQL/MariaDB:

```sql
CREATE DATABASE cloud_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE cloud_db;

CREATE TABLE usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario VARCHAR(100) NOT NULL UNIQUE,
    senha VARCHAR(255) NOT NULL,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE arquivos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome_real VARCHAR(500) NOT NULL,
    nome_sistema VARCHAR(500) DEFAULT NULL,
    diretorio_id INT DEFAULT 0,
    tipo ENUM('arquivo', 'pasta') NOT NULL DEFAULT 'arquivo',
    tamanho BIGINT DEFAULT 0,
    extensao VARCHAR(50) DEFAULT NULL,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_diretorio (diretorio_id),
    INDEX idx_tipo (tipo)
);

-- Criar um usuário de acesso (substitua 'admin' e 'sua_senha_aqui')
INSERT INTO usuarios (usuario, senha) VALUES (
    'admin',
    -- Gere o hash no PHP: echo password_hash('sua_senha_aqui', PASSWORD_DEFAULT);
    '$2y$10$HASH_GERADO_PELO_PHP'
);
```

> **💡 Dica:** Para gerar o hash da senha, execute no terminal:
> ```bash
> php -r "echo password_hash('sua_senha_aqui', PASSWORD_DEFAULT);"
> ```

### 4. Instale as dependências e compile o frontend

```bash
npm install
npm run build
```

### 5. Copie os assets compilados para a raiz

```bash
# Linux / macOS
cp dist/index.dev.html index.html
cp dist/assets/* assets/

# Windows (PowerShell)
Copy-Item -Path "dist\index.dev.html" -Destination "index.html" -Force
Copy-Item -Path "dist\assets\*" -Destination "assets" -Force
```

### 6. Configure o servidor web

Aponte o **Document Root** do seu servidor para a pasta `cloud/`.

#### IIS (Windows Server)
O arquivo `web.config` já está incluído e configura automaticamente o limite de upload para 512MB.

#### Apache
O arquivo `.htaccess` já está incluído com as diretivas de limite de upload.

#### Nginx
Adicione ao bloco `server {}`:
```nginx
client_max_body_size 512M;

location /cloud/ {
    index index.html;
    try_files $uri $uri/ /cloud/index.html;
}
```

### 7. Verifique as permissões

Certifique-se de que a pasta `storage/` possui permissão de escrita pelo servidor web:

```bash
# Linux
chmod -R 775 storage/
chown -R www-data:www-data storage/

# Windows (IIS)
# Dê permissão de escrita ao usuário IIS_IUSRS na pasta storage/
```

---

## 💻 Desenvolvimento Local

```bash
# Instalar dependências
npm install

# Iniciar o servidor de desenvolvimento com Hot Reload
npm run dev
```

O Vite iniciará em `http://localhost:5173` com proxy automático configurado para redirecionar as chamadas `/api` para `http://localhost/cloud` (seu servidor PHP local).

### Scripts disponíveis

| Comando           | Descrição                                      |
|-------------------|-------------------------------------------------|
| `npm run dev`     | Servidor de desenvolvimento com HMR             |
| `npm run build`   | Compilação para produção (output em `dist/`)     |
| `npm run preview` | Preview local do build de produção               |
| `npm run lint`    | Análise estática com OxLint                      |

---

## 📡 Endpoints da API

Todas as rotas da API estão no diretório `api/` e retornam JSON. Exceto `auth.php`, todas exigem sessão autenticada (cookie `PHPSESSID`).

| Método | Endpoint                          | Descrição                                        |
|--------|-----------------------------------|--------------------------------------------------|
| POST   | `/api/auth.php?action=login`      | Autenticar com usuário, senha e reCAPTCHA         |
| GET    | `/api/auth.php?action=status`     | Verificar status da sessão                        |
| POST   | `/api/auth.php?action=logout`     | Encerrar sessão                                   |
| GET    | `/api/arquivos.php?pai_id=0`      | Listar arquivos e pastas de um diretório          |
| POST   | `/api/upload.php`                 | Fazer upload de arquivo (multipart/form-data)     |
| GET    | `/api/download.php?id=123`        | Download/stream de um arquivo                     |
| POST   | `/api/criar_pasta.php`            | Criar nova pasta                                  |
| POST   | `/api/editar.php`                 | Renomear arquivo ou pasta                         |
| POST   | `/api/excluir.php`                | Excluir arquivo ou pasta                          |
| POST   | `/api/mover.php`                  | Mover item para outro diretório                   |

### Upload com Estrutura de Pasta

O endpoint `upload.php` aceita um campo opcional `relative_path` (ex: `Fotos/Viagem/foto.jpg`). Quando presente, o backend cria automaticamente os diretórios intermediários antes de inserir o arquivo.

---

## ⚙️ Configuração de Limites de Upload

O projeto inclui arquivos de configuração para os três principais servidores web, todos ajustados para permitir uploads de até **512 MB**:

| Arquivo       | Servidor                | Parâmetros                                  |
|---------------|-------------------------|----------------------------------------------|
| `.htaccess`   | Apache (mod_php)        | `upload_max_filesize`, `post_max_size`       |
| `.user.ini`   | PHP-FPM / CGI / Nginx   | `upload_max_filesize`, `post_max_size`       |
| `web.config`  | IIS (Windows Server)    | `maxAllowedContentLength`                    |

> **⚠️ Cloudflare:** Se você utiliza o proxy do Cloudflare (nuvem laranja), o limite de upload no plano gratuito é de **100 MB** por requisição. Para arquivos maiores, utilize um subdomínio com **DNS Only** (nuvem cinza).

---

## 🔧 Variáveis de Ambiente

| Variável    | Descrição                              | Padrão                         |
|-------------|----------------------------------------|--------------------------------|
| `DB_HOST`   | Host do banco de dados MySQL           | `[IP_ADDRESS]`                    |
| `DB_NAME`   | Nome do banco de dados                 | `cloud`                     |
| `DB_USER`   | Usuário do banco de dados              | `db_user`                    |
| `DB_PASS`   | Senha do banco de dados                | `db_password`                    |
| `BASE_URL`  | URL pública base da aplicação          | `https://seu-dominio/cloud/`    |

---

## 📄 Licença

Este projeto é de uso privado.

---

## 🤝 Autor

Desenvolvido por **Willian Nascimento**.
