// src/components/ModalEdit.jsx
import React, { useState, useEffect } from 'react';
import { X, Edit } from 'lucide-react';

export default function ModalEdit({ isOpen, item, onClose, onSubmit }) {
  const [nome, setNome] = useState('');

  useEffect(() => {
    if (item) {
      setNome(item.nome_real || '');
    }
  }, [item]);

  if (!isOpen || !item) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (nome.trim() && nome.trim() !== item.nome_real) {
      onSubmit(item.id, nome.trim());
    } else {
      onClose();
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h5 className="modal-title d-flex align-items-center gap-2">
            <Edit size={18} className="text-info" />
            Renomear {item.tipo === 'pasta' ? 'Pasta' : 'Arquivo'}
          </h5>
          <button className="modal-close" onClick={onClose}>
            <X size={18} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="input-container">
              <label className="input-label">Nome Atual: <span className="text-muted">{item.nome_real}</span></label>
              <input 
                type="text" 
                className="form-input" 
                placeholder="Novo nome" 
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                autoFocus
                required
                autoComplete="off"
              />
            </div>
          </div>
          
          <div className="modal-footer">
            <button type="button" className="btn btn-outline" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary">
              Salvar Alterações
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
