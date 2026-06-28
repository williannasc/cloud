// src/services/api.js

// Retorna o caminho correto da API dependendo se o usuário está acessando pela pasta /dist/ ou pela raiz
const getBaseUrl = () => {
  const isDist = window.location.pathname.includes('/dist/');
  return isDist ? '../api' : 'api';
};

async function request(endpoint, options = {}) {
  const url = `${getBaseUrl()}/${endpoint}`;
  
  // Define credentials para compartilhar os cookies de sessão (PHPSESSID)
  options.credentials = 'include';
  
  if (!options.headers) {
    options.headers = {};
  }
  
  // Se estiver enviando dados normais que não sejam FormData, converte para JSON
  if (options.body && !(options.body instanceof FormData)) {
    options.headers['Content-Type'] = 'application/json';
    if (typeof options.body === 'object') {
      options.body = JSON.stringify(options.body);
    }
  }

  try {
    const response = await fetch(url, options);
    
    // Trata erro de autenticação (401)
    if (response.status === 401) {
      return { unauthorized: true };
    }
    
    const text = await response.text();
    try {
      return JSON.parse(text);
    } catch (e) {
      return { status: 'error', message: 'Resposta inválida do servidor.', raw: text };
    }
  } catch (error) {
    return { status: 'error', message: error.message || 'Erro de conexão com o servidor.' };
  }
}

export const api = {
  get: (endpoint) => request(endpoint, { method: 'GET' }),
  post: (endpoint, body) => request(endpoint, { method: 'POST', body }),
  
  // Helper para obter a URL correta de download/preview
  getDownloadUrl: (id) => {
    return `${getBaseUrl()}/download.php?id=${id}`;
  },

  // Upload customizado via XHR para suportar progresso real de envio
  upload: (endpoint, formData, onProgress) => {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('POST', `${getBaseUrl()}/${endpoint}`, true);
      xhr.withCredentials = true; // Essencial para passar cookies de sessão
      
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable && onProgress) {
          const percent = Math.round((e.loaded / e.total) * 100);
          onProgress(percent);
        }
      };
      
      xhr.onload = () => {
        if (xhr.status === 401) {
          resolve({ unauthorized: true });
          return;
        }
        try {
          resolve(JSON.parse(xhr.responseText));
        } catch (e) {
          resolve({ status: 'error', message: 'Erro ao processar resposta do upload.', raw: xhr.responseText });
        }
      };
      
      xhr.onerror = () => {
        resolve({ status: 'error', message: 'Erro de conexão ao enviar arquivo.' });
      };
      
      xhr.send(formData);
    });
  }
};
