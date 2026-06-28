// src/components/ModalMove.jsx
import React, { useState, useEffect } from 'react';
import { Folder, ChevronRight, X, ArrowLeft, Loader2 } from 'lucide-react';
import { api } from '../services/api';

export default function ModalMove({ isOpen, onClose, item, onSubmit }) {
  const [currentFolderId, setCurrentFolderId] = useState(0);
  const [loading, setLoading] = useState(false);
  const [folders, setFolders] = useState([]);
  const [path, setPath] = useState([]);

  useEffect(() => {
    if (isOpen) {
      setCurrentFolderId(0);
      setPath([]);
      loadFolders(0);
    }
  }, [isOpen]);

  const loadFolders = async (dirId) => {
    setLoading(true);
    const res = await api.get(`arquivos.php?pai_id=${dirId}`);
    if (res.status === 'success') {
      // Filtra para pegar apenas as pastas, excluindo a própria pasta que está sendo movida (para evitar loops)
      const filtered = (res.pastas || []).filter(f => f.id !== item?.id);
      setFolders(filtered);
      setPath(res.breadcrumb || []);
      setCurrentFolderId(dirId);
    }
    setLoading(false);
  };

  if (!isOpen || !item) return null;

  const handleNavigate = (folder) => {
    loadFolders(folder.id);
  };

  const handleGoBack = () => {
    const parentId = path.length > 1 ? path[path.length - 2].id : 0;
    loadFolders(parentId);
  };

  const handleConfirm = () => {
    onSubmit(item.id, currentFolderId);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container preview-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '420px' }}>
        <div className="modal-header">
          <h5 className="modal-title">Mover "{item.nome_real}"</h5>
          <button className="modal-close" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="modal-body" style={{ minHeight: '300px', display: 'flex', flexDirection: 'column' }}>
          {/* Breadcrumb / Navegação superior */}
          <div className="d-flex align-items-center gap-2 mb-3 pb-2 border-bottom" style={{ fontSize: '0.85rem' }}>
            {currentFolderId !== 0 && (
              <button className="btn p-1 d-flex align-items-center" onClick={handleGoBack} style={{ border: 'none', background: 'transparent', color: '#fff' }}>
                <ArrowLeft size={16} />
              </button>
            )}
            <span 
              style={{ cursor: 'pointer', fontWeight: currentFolderId === 0 ? 'bold' : 'normal', color: currentFolderId === 0 ? 'var(--primary)' : '#fff' }}
              onClick={() => currentFolderId !== 0 && loadFolders(0)}
            >
              Meu Drive
            </span>
            {path.map((p) => {
              const isCurrent = currentFolderId === p.id;
              return (
                <React.Fragment key={p.id}>
                  <ChevronRight size={12} className="text-secondary" />
                  <span 
                    style={{ cursor: 'pointer', fontWeight: isCurrent ? 'bold' : 'normal', color: isCurrent ? 'var(--primary)' : '#fff' }}
                    onClick={() => currentFolderId !== p.id && loadFolders(p.id)}
                  >
                    {p.nome_real}
                  </span>
                </React.Fragment>
              );
            })}
          </div>

          {/* Lista de subpastas do diretório selecionado */}
          <div style={{ flexGrow: 1, overflowY: 'auto', maxHeight: '200px' }} className="move-folders-list">
            {loading ? (
              <div className="text-center py-4 text-secondary">
                <Loader2 size={24} className="animate-spin" />
              </div>
            ) : folders.length === 0 ? (
              <div className="text-center py-4 text-secondary small">
                Nenhuma pasta de destino encontrada neste nível.
              </div>
            ) : (
              folders.map(f => (
                <div 
                  key={f.id} 
                  className="d-flex align-items-center justify-content-between p-2 rounded list-row"
                  style={{ cursor: 'pointer', transition: 'background 0.2s', margin: '4px 0' }}
                  onClick={() => handleNavigate(f)}
                >
                  <div className="d-flex align-items-center gap-2">
                    <Folder size={18} style={{ color: 'var(--folder-color)', fill: 'var(--folder-color)' }} />
                    <span className="small text-white">{f.nome_real}</span>
                  </div>
                  <ChevronRight size={14} className="text-secondary" />
                </div>
              ))
            )}
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn btn-outline" onClick={onClose}>Cancelar</button>
          <button className="btn btn-primary" onClick={handleConfirm}>Mover para cá</button>
        </div>
      </div>
    </div>
  );
}
