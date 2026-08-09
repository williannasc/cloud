// src/App.jsx
import React, { useState, useEffect } from 'react';
import { api } from './services/api';
import Login from './components/Login';
import Sidebar from './components/Sidebar';
import FileManager from './components/FileManager';
import { Loader2 } from 'lucide-react';

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('arquivos');
  const [activeDirId, setActiveDirId] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // Compartilhamento de estados de modal e armazenamento
  const [isFolderOpen, setIsFolderOpen] = useState(false);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [storageUsed, setStorageUsed] = useState(0);
  const [storageUsedFormat, setStorageUsedFormat] = useState('0 bytes');
  const [storageLimit, setStorageLimit] = useState(15 * 1024 * 1024 * 1024);
  const [storageLimitFormat, setStorageLimitFormat] = useState('15 GB');

  // Verifica se o usuário já possui sessão ativa ao carregar o app
  const checkAuthStatus = async () => {
    setLoading(true);
    try {
      const res = await api.get('auth.php?action=status');
      if (res.logged) {
        setUser(res.user);
      } else {
        setUser(null);
      }
    } catch (e) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const handleLoginSuccess = (userData) => {
    setUser(userData);
    setActiveDirId(0); // Reinicia para a raiz
  };

  const handleLogout = async () => {
    setLoading(true);
    try {
      await api.post('auth.php?action=logout');
    } catch (e) {
      // Ignora erro de rede no logout
    }
    setUser(null);
    setLoading(false);
  };

  const handleSessionExpired = () => {
    setUser(null);
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  if (loading) {
    return (
      <div className="empty-state" style={{ height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <Loader2 size={36} className="animate-spin text-info" />
        <p className="mt-3 text-secondary">Carregando Private Drive...</p>
      </div>
    );
  }

  // Se não estiver logado, exibe tela de login
  if (!user) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  // Se estiver logado, exibe a interface principal
  return (
    <div className="app-container">
      {/* Sidebar para desktop e mobile drawer */}
      <Sidebar 
        activeTab={activeTab} 
        onTabChange={setActiveTab} 
        onLogout={handleLogout}
        usuario={user.usuario}
        isOpen={sidebarOpen}
        onToggle={toggleSidebar}
        onOpenFolderModal={() => setIsFolderOpen(true)}
        onOpenUploadModal={() => setIsUploadOpen(true)}
        onOpenFolderUpload={() => window.dispatchEvent(new CustomEvent('triggerFolderUpload'))}
        storageUsed={storageUsed}
        storageUsedFormat={storageUsedFormat}
        storageLimit={storageLimit}
        storageLimitFormat={storageLimitFormat}
      />

      {/* Área principal baseada na aba ativa */}
      {activeTab === 'arquivos' && (
        <FileManager 
          activeDirId={activeDirId} 
          setActiveDirId={setActiveDirId}
          onToggleSidebar={toggleSidebar}
          onSessionExpired={handleSessionExpired}
          isFolderOpen={isFolderOpen}
          setIsFolderOpen={setIsFolderOpen}
          isUploadOpen={isUploadOpen}
          setIsUploadOpen={setIsUploadOpen}
          setStorageUsed={setStorageUsed}
          setStorageUsedFormat={setStorageUsedFormat}
          setStorageLimit={setStorageLimit}
          setStorageLimitFormat={setStorageLimitFormat}
        />
      )}
    </div>
  );
}
