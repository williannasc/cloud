// src/components/Sidebar.jsx
import React, { useState, useEffect, useRef } from 'react';
import {
  Plus,
  FolderPlus,
  Upload,
  HardDrive,
  Clock,
  Users,
  Trash2,
  Cloud,
  LogOut,
  X,
  Database,
  Folder
} from 'lucide-react';

export default function Sidebar({
  activeTab,
  onTabChange,
  onLogout,
  usuario,
  isOpen,
  onToggle,
  onOpenFolderModal,
  onOpenUploadModal,
  onOpenFolderUpload,
  storageUsed,
  storageUsedFormat
}) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Fecha o dropdown ao clicar fora dele
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Google Drive free tier: 15 GB
  const FREE_TIER_LIMIT = 15 * 1024 * 1024 * 1024; // 15 GB em bytes
  const percentage = Math.min((storageUsed / FREE_TIER_LIMIT) * 100, 100);

  return (
    <aside className={`sidebar ${isOpen ? 'active' : ''}`}>
      <div className="sidebar-logo">
        <svg viewBox="0 0 24 24" width="28" height="28" style={{ flexShrink: 0 }}>
          <path d="M19.43 12.98c.04-.32.07-.64.07-.98s-.03-.66-.07-.98l2.11-1.65c.19-.15.24-.42.12-.64l-2-3.46c-.12-.22-.39-.3-.61-.22l-2.49 1c-.52-.4-1.08-.73-1.69-.98l-.38-2.65C14.46.18 14.24 0 14 0h-4c-.24 0-.46.18-.49.42l-.38 2.65c-.61.25-1.17.59-1.69.98l-2.49-1c-.23-.09-.49 0-.61.22l-2 3.46c-.13.22-.07.49.12.64l2.11 1.65c-.04.32-.07.65-.07.98s.03.66.07.98l-2.11 1.65c-.19.15-.24.42-.12.64l2 3.46c.12.22.39.3.61.22l2.49-1c.52.4 1.08.73 1.69.98l.38 2.65c.03.24.25.42.49.42h4c.24 0 .46-.18.49-.42l.38-2.65c.61-.25 1.17-.59 1.69-.98l2.49 1c.23.09.49 0 .61-.22l2-3.46c.12-.22.07-.49-.12-.64l-2.11-1.65zM12 15.5c-1.93 0-3.5-1.57-3.5-3.5s1.57-3.5 3.5-3.5 3.5 1.57 3.5 3.5-1.57 3.5-3.5 3.5z" fill="#a8c7fa" />
        </svg>
        <span style={{ marginLeft: '6px' }}>Drive</span>

      </div>

      {/* "+ Novo" Dropdown Button */}
      <div className="new-btn-container" ref={dropdownRef}>
        <button className="new-btn" onClick={() => setDropdownOpen(!dropdownOpen)} style={{ padding: '12px 20px', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <svg viewBox="0 0 36 36" width="24" height="24" style={{ flexShrink: 0 }}>
            <path fill="#34A853" d="M16 16v14h4V20z" />
            <path fill="#4285F4" d="M30 16H20v4h10z" />
            <path fill="#FBBC05" d="M6 16h10v4H6z" />
            <path fill="#EA4335" d="M20 16V6h-4v10z" />
          </svg>
          <span style={{ fontSize: '0.9rem', fontWeight: '500' }}>Novo</span>
        </button>

        {dropdownOpen && (
          <div className="new-dropdown">
            <div
              className="new-dropdown-item"
              onClick={() => {
                setDropdownOpen(false);
                onOpenFolderModal();
              }}
            >
              <FolderPlus size={18} className="text-warning" />
              <span>Nova pasta</span>
            </div>
            <div
              className="new-dropdown-item"
              onClick={() => {
                setDropdownOpen(false);
                onOpenUploadModal();
              }}
            >
              <Upload size={18} className="text-info" />
              <span>Fazer upload de arquivo</span>
            </div>
            <div
              className="new-dropdown-item"
              onClick={() => {
                setDropdownOpen(false);
                onOpenFolderUpload();
              }}
            >
              <Folder size={18} className="text-success" />
              <span>Fazer upload de pasta</span>
            </div>
          </div>
        )}
      </div>

      {/* Navigation Options */}
      <nav className="sidebar-nav">
        <div
          className={`nav-item ${activeTab === 'arquivos' ? 'active' : ''}`}
          onClick={() => {
            onTabChange('arquivos');
            if (isOpen) onToggle();
          }}
        >
          <HardDrive size={18} />
          <span>Meu Drive</span>
        </div>

        <div className="nav-item" onClick={() => alert('Recentes (Apenas visualização no Meu Drive)')}>
          <Clock size={18} />
          <span>Recentes</span>
        </div>

        <div className="nav-item" onClick={() => alert('Compartilhados comigo (Acesse seus arquivos no Meu Drive)')}>
          <Users size={18} />
          <span>Compartilhados</span>
        </div>

        <div className="nav-item" onClick={() => alert('Lixeira (Exclusão física direta ativada no sistema)')}>
          <Trash2 size={18} />
          <span>Lixeira</span>
        </div>

        {usuario && (
          <div className="nav-item" style={{ marginTop: '2rem', cursor: 'default', background: 'transparent' }}>
            <span className="text-truncate" style={{ fontSize: '0.8rem', color: 'var(--muted-text)' }}>Logado: {usuario}</span>
          </div>
        )}

        <div
          className="nav-item logout"
          onClick={() => {
            if (isOpen) onToggle();
            onLogout();
          }}
        >
          <LogOut size={18} />
          <span>Sair</span>
        </div>
      </nav>

      {/* Storage Indicator */}
      <div className="storage-meter">
        <div className="storage-title">
          <Cloud size={16} />
          <span>Armazenamento</span>
        </div>
        <div className="storage-bar-bg">
          <div className="storage-bar-fill" style={{ width: `${percentage}%` }}></div>
        </div>
        <div className="storage-text">
          {storageUsedFormat} de 15 GB usados
        </div>
      </div>
    </aside>
  );
}
