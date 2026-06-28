// src/components/ModalFolder.jsx
import React, { useState } from 'react';
import { X, FolderPlus } from 'lucide-react';

export default function ModalFolder({ isOpen, onClose, onSubmit }) {
  const [nome, setNome] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (nome.trim()) {
      onSubmit(nome.trim());
      setNome('');
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h5 className="modal-title d-flex align-items-center gap-2">
            <FolderPlus size={18} className="text-info" />
            Nova Pasta
          </h5>
          <button className="modal-close" onClick={onClose}>
            <X size={18} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="input-container">
              <label className="input-label">Nome da Pasta</label>
              <input 
                type="text" 
                className="form-input" 
                placeholder="Ex: Documentos" 
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
              Criar Pasta
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
