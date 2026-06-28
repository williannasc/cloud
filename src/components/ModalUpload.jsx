// src/components/ModalUpload.jsx
import React, { useState } from 'react';
import { X, Upload } from 'lucide-react';

export default function ModalUpload({ isOpen, onClose, onSubmit, uploadProgress, isUploading }) {
  const [file, setFile] = useState(null);
  const [nomeCustom, setNomeCustom] = useState('');

  if (!isOpen) return null;

  const handleFileChange = (e) => {
    if (e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!file) return;

    const formData = new FormData();
    formData.append('arquivo', file);
    formData.append('nome_custom', nomeCustom.trim());

    onSubmit(formData);
  };

  const handleClose = () => {
    if (isUploading) return; // Prevent closing mid-upload
    setFile(null);
    setNomeCustom('');
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h5 className="modal-title d-flex align-items-center gap-2">
            <Upload size={18} className="text-info" />
            Enviar Arquivo
          </h5>
          <button className="modal-close" onClick={handleClose} disabled={isUploading}>
            <X size={18} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="input-container">
              <label className="input-label">Arquivo</label>
              <input 
                type="file" 
                className="form-input" 
                style={{ paddingLeft: '1rem' }}
                onChange={handleFileChange}
                required
                disabled={isUploading}
              />
            </div>
            
            <div className="input-container">
              <label className="input-label">Nome no Sistema (Opcional)</label>
              <input 
                type="text" 
                className="form-input" 
                style={{ paddingLeft: '1rem' }}
                placeholder="Ex: Foto_Festa" 
                value={nomeCustom}
                onChange={(e) => setNomeCustom(e.target.value)}
                disabled={isUploading}
                autoComplete="off"
              />
            </div>

            {isUploading && (
              <div className="mt-3">
                <div className="d-flex justify-content-between mb-1" style={{ fontSize: '0.75rem' }}>
                  <span className="text-secondary">Enviando arquivo...</span>
                  <span className="text-info font-weight-bold">{uploadProgress}%</span>
                </div>
                <div className="progress-bar-container">
                  <div 
                    className="progress-bar-fill" 
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
              </div>
            )}
          </div>
          
          <div className="modal-footer">
            <button 
              type="button" 
              className="btn btn-outline" 
              onClick={handleClose} 
              disabled={isUploading}
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              className="btn btn-primary" 
              disabled={!file || isUploading}
            >
              Iniciar Upload
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
