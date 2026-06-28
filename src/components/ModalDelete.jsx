// src/components/ModalDelete.jsx
import React from 'react';
import { X, AlertTriangle } from 'lucide-react';

export default function ModalDelete({ isOpen, item, onClose, onSubmit }) {
  if (!isOpen || !item) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header" style={{ borderBottom: 'none' }}>
          <h5 className="modal-title d-flex align-items-center gap-2 text-danger">
            <AlertTriangle size={18} />
            Confirmar Exclusão
          </h5>
          <button className="modal-close" onClick={onClose}>
            <X size={18} />
          </button>
        </div>
        
        <div className="modal-body text-center py-4">
          <p className="mb-0 text-secondary" style={{ fontSize: '0.9rem' }}>
            Deseja realmente excluir permanentemente o item <br />
            <strong className="text-white">"{item.nome_real}"</strong>?
          </p>
          {item.tipo === 'pasta' && (
            <p className="text-warning small mt-2 mb-0">
              Nota: A pasta deve estar vazia para ser excluída.
            </p>
          )}
        </div>
        
        <div className="modal-footer" style={{ borderTop: 'none', background: 'transparent' }}>
          <button type="button" className="btn btn-outline" style={{ flexGrow: 1 }} onClick={onClose}>
            Não
          </button>
          <button 
            type="button" 
            className="btn btn-danger" 
            style={{ flexGrow: 1 }} 
            onClick={() => onSubmit(item.id)}
          >
            Sim, Excluir
          </button>
        </div>
      </div>
    </div>
  );
}
