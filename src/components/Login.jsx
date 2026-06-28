// src/components/Login.jsx
import React, { useState, useEffect, useRef } from 'react';
import { CloudLightning, User, Lock, AlertTriangle, ArrowRight, Loader2 } from 'lucide-react';
import { api } from '../services/api';

export default function Login({ onLoginSuccess }) {
  const [usuario, setUsuario] = useState('');
  const [senha, setSenha] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const recaptchaRef = useRef(null);
  const widgetIdRef = useRef(null);

  // Carrega e renderiza o reCAPTCHA explicitamente
  useEffect(() => {
    let checkCount = 0;
    
    const renderRecaptcha = () => {
      if (window.grecaptcha && window.grecaptcha.render && recaptchaRef.current) {
        try {
          // Renderiza explicitamente e guarda o ID do widget
          widgetIdRef.current = window.grecaptcha.render(recaptchaRef.current, {
            sitekey: '6LfhcJ8aAAAAACJfNdQEKyMHlaIahpaoSvig3KCX',
            theme: 'dark',
          });
        } catch (e) {
          console.warn('reCAPTCHA render warning:', e);
        }
      } else if (checkCount < 30) {
        checkCount++;
        setTimeout(renderRecaptcha, 200); // Tenta novamente
      }
    };

    renderRecaptcha();

    // Limpeza ao desmontar
    return () => {
      widgetIdRef.current = null;
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // Obtém a resposta do reCAPTCHA
    let recaptchaToken = '';
    if (window.grecaptcha) {
      if (widgetIdRef.current !== null) {
        recaptchaToken = window.grecaptcha.getResponse(widgetIdRef.current);
      } else {
        recaptchaToken = window.grecaptcha.getResponse();
      }
    }

    if (!recaptchaToken) {
      setError('Por favor, confirme que você não é um robô.');
      return;
    }

    setLoading(true);

    try {
      const res = await api.post('auth.php?action=login', {
        usuario,
        senha,
        'g-recaptcha-response': recaptchaToken
      });

      if (res.status === 'success') {
        onLoginSuccess(res.user);
      } else {
        setError(res.message || 'Usuário ou senha inválidos!');
        // Reseta o reCAPTCHA em caso de erro
        if (window.grecaptcha && widgetIdRef.current !== null) {
          window.grecaptcha.reset(widgetIdRef.current);
        }
      }
    } catch (err) {
      setError('Erro ao conectar-se ao servidor.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="text-center mb-4">
          <CloudLightning size={48} className="login-header-icon" />
          <h3 className="login-title">Private Drive</h3>
          <p className="login-subtitle">Acesse seu armazenamento seguro</p>
        </div>

        {error && (
          <div className="login-alert">
            <AlertTriangle size={16} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="input-container">
            <label className="input-label">Usuário</label>
            <div className="input-wrapper">
              <User size={18} className="input-icon" />
              <input
                type="text"
                className="form-input"
                placeholder="Seu usuário"
                value={usuario}
                onChange={(e) => setUsuario(e.target.value)}
                required
                disabled={loading}
                autoComplete="username"
              />
            </div>
          </div>

          <div className="input-container">
            <label className="input-label">Senha</label>
            <div className="input-wrapper">
              <Lock size={18} className="input-icon" />
              <input
                type="password"
                className="form-input"
                placeholder="••••••••"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                required
                disabled={loading}
                autoComplete="current-password"
              />
            </div>
          </div>

          {/* Container do reCAPTCHA do Google */}
          <div className="recaptcha-wrapper">
            <div ref={recaptchaRef}></div>
          </div>

          <button type="submit" className="btn btn-primary w-full py-3 fs-6" disabled={loading} style={{ width: '100%', borderRadius: '12px' }}>
            {loading ? (
              <>
                <Loader2 size={18} className="animate-spin me-2" />
                Entrando...
              </>
            ) : (
              <>
                Entrar
                <ArrowRight size={18} className="ms-2" />
              </>
            )}
          </button>
        </form>

        <div className="text-center mt-4">
          <p className="small text-muted mb-0" style={{ fontSize: '0.75rem' }}>
            Protegido por SSL em <span className="text-info font-weight-bold">wn.dev.br</span>
          </p>
        </div>
      </div>
    </div>
  );
}
