// src/components/ModalMove.jsx
import React, { useState, useEffect } from 'react';
import { Folder, ChevronRight, X, ArrowLeft, Loader2 } from 'lucide-react';
import { api } from '../services/api';

export default function ModalMove({ isOpen, onClose, items = [], onSubmit }) {
  const [currentFolderId, setCurrentFolderId] = useState(0);
  const [loading, setLoading] = useState(false);
  const [folders, setFolders] = useState([]);
  const [path, setPath] = useState([]);

  // IDs dos itens sendo movidos (para filtrar da lista de destino)
  const itemIds = items.map(i => i.id);

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
      // Filtra para pegar apenas as pastas, excluindo as próprias pastas que estão sendo movidas
      const filtered = (res.pastas || []).filter(f => !itemIds.includes(f.id));
      setFolders(filtered);
      setPath(res.breadcrumb || []);
      setCurrentFolderId(dirId);
    }
    setLoading(false);
  };

  if (!isOpen || items.length === 0) return null;

  const handleNavigate = (folder) => {
    loadFolders(folder.id);
  };

  const handleGoBack = () => {
    const parentId = path.length > 1 ? path[path.length - 2].id : 0;
    loadFolders(parentId);
  };

  const handleConfirm = () => {
    onSubmit(itemIds, currentFolderId);
  };

  // Título dinâmico
  const titleText = items.length === 1
    ? `Mover "${items[0].nome_real}"`
    : `Mover ${items.length} itens`;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container preview-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '420px' }}>
        <div className="modal-header">
          <h5 className="modal-title">{titleText}</h5>
          <button className="modal-close" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="modal-body" style={{ minHeight: '300px', display: 'flex', flexDirection: 'column' }}>
          {/* Lista de itens selecionados (resumo) */}
          {items.length > 1 && (
            <div style={{ marginBottom: '12px', padding: '8px 12px', background: 'rgba(168, 199, 250, 0.08)', borderRadius: '8px', fontSize: '0.8rem', color: 'var(--secondary-text)', maxHeight: '80px', overflowY: 'auto' }}>
              {items.map(it => (
                <div key={it.id} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '2px 0' }}>
                  <Folder size={12} style={{ color: it.tipo === 'pasta' ? 'var(--folder-color)' : 'var(--muted-text)', fill: it.tipo === 'pasta' ? 'var(--folder-color)' : 'transparent', flexShrink: 0 }} />
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{it.nome_real}</span>
                </div>
              ))}
            </div>
          )}

          {/* Breadcrumb / Navegação superior */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', paddingBottom: '8px', borderBottom: '1px solid var(--border-color)', fontSize: '0.85rem' }}>
            {currentFolderId !== 0 && (
              <button style={{ border: 'none', background: 'transparent', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '4px' }} onClick={handleGoBack}>
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
                  <ChevronRight size={12} style={{ color: 'var(--muted-text)' }} />
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
              <div className="text-center" style={{ padding: '24px 0' }}>
                <Loader2 size={24} className="animate-spin" style={{ color: 'var(--muted-text)' }} />
              </div>
            ) : folders.length === 0 ? (
              <div className="text-center small" style={{ padding: '24px 0', color: 'var(--muted-text)' }}>
                Nenhuma pasta de destino encontrada neste nível.
              </div>
            ) : (
              folders.map(f => (
                <div 
                  key={f.id} 
                  className="list-row"
                  style={{ cursor: 'pointer', transition: 'background 0.2s', margin: '4px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px', borderRadius: '8px' }}
                  onClick={() => handleNavigate(f)}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Folder size={18} style={{ color: 'var(--folder-color)', fill: 'var(--folder-color)' }} />
                    <span className="small" style={{ color: '#fff' }}>{f.nome_real}</span>
                  </div>
                  <ChevronRight size={14} style={{ color: 'var(--muted-text)' }} />
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
