// src/components/ModalPreview.jsx
import React, { useState, useEffect } from 'react';
import { X, Share2, Download, FileText, Check, ChevronLeft, ChevronRight, FileAudio, FileVideo } from 'lucide-react';
import { api } from '../services/api';

export default function ModalPreview({ isOpen, file, files = [], onClose }) {
  const [currentFile, setCurrentFile] = useState(file);
  const [copied, setCopied] = useState(false);

  // Sync state with file prop changes
  useEffect(() => {
    if (file) {
      setCurrentFile(file);
    }
  }, [file]);

  // Indexing helpers
  const currentIndex = files.findIndex(f => f.id === currentFile?.id);
  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex < files.length - 1;

  const handlePrev = () => {
    if (hasPrev) {
      setCurrentFile(files[currentIndex - 1]);
    }
  };

  const handleNext = () => {
    if (hasNext) {
      setCurrentFile(files[currentIndex + 1]);
    }
  };

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'ArrowLeft' || e.key === 'Left') {
        handlePrev();
      } else if (e.key === 'ArrowRight' || e.key === 'Right') {
        handleNext();
      } else if (e.key === 'Escape' || e.key === 'Esc') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentIndex, files]);

  if (!isOpen || !currentFile) return null;

  const ext = currentFile.extensao?.toLowerCase() || '';
  const isImage = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext);
  const isPdf = ext === 'pdf';
  const isVideo = ['mp4', 'webm', 'ogg', 'mov', 'mkv'].includes(ext);
  const isAudio = ['mp3', 'wav', 'm4a', 'flac'].includes(ext);
  const downloadUrl = api.getDownloadUrl(currentFile.id);

  const handleShare = () => {
    const hash = btoa(currentFile.id.toString());
    const origin = window.location.origin;
    let path = window.location.pathname;
    
    if (path.endsWith('index.html')) {
      path = path.substring(0, path.lastIndexOf('/') + 1);
    } else if (!path.endsWith('/')) {
      path += '/';
    }
    
    const publicUrl = `${origin}${path}s.php?h=${hash}`;

    navigator.clipboard.writeText(publicUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="gdrive-preview-overlay" onClick={onClose}>
      {/* Top Header */}
      <div className="gdrive-preview-header" onClick={(e) => e.stopPropagation()}>
        <div className="gdrive-preview-header-left">
          <button className="gdrive-preview-btn-back" onClick={onClose} title="Voltar">
            <ChevronLeft size={20} />
          </button>
          <span className="gdrive-preview-filename" title={currentFile.nome_real}>
            {currentFile.nome_real}
          </span>
        </div>
        <div className="gdrive-preview-header-right">
          <button 
            type="button" 
            className="gdrive-preview-btn-icon" 
            onClick={handleShare}
            title="Compartilhar"
          >
            {copied ? <Check size={18} className="text-success" /> : <Share2 size={18} />}
          </button>
          
          <a href={downloadUrl} className="gdrive-preview-btn-icon" download title="Fazer download">
            <Download size={18} />
          </a>

          <button className="gdrive-preview-btn-icon close-btn" onClick={onClose} title="Fechar">
            <X size={18} />
          </button>
        </div>
      </div>

      {/* Main Container */}
      <div className="gdrive-preview-container" onClick={(e) => e.stopPropagation()}>
        {/* Left Arrow */}
        {hasPrev ? (
          <button className="gdrive-preview-arrow left" onClick={handlePrev} title="Anterior (Seta Esquerda)">
            <ChevronLeft size={36} />
          </button>
        ) : (
          <div style={{ width: '56px' }}></div>
        )}

        {/* Preview content */}
        <div className="gdrive-preview-content">
          {isImage ? (
            <img src={downloadUrl} alt={currentFile.nome_real} className="gdrive-preview-image" />
          ) : isPdf ? (
            <iframe src={downloadUrl} title={currentFile.nome_real} className="gdrive-preview-iframe"></iframe>
          ) : isVideo ? (
            <video src={downloadUrl} controls autoPlay className="gdrive-preview-video" style={{ maxWidth: '100%', maxHeight: 'calc(100vh - 120px)', borderRadius: '8px', boxShadow: '0 12px 36px rgba(0, 0, 0, 0.5)' }} />
          ) : isAudio ? (
            <div className="gdrive-preview-audio-container" style={{ padding: '32px', background: 'rgba(30, 31, 32, 0.85)', borderRadius: '24px', boxShadow: '0 12px 36px rgba(0,0,0,0.5)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', minWidth: '320px' }}>
              <FileAudio size={64} className="text-info" />
              <span className="small text-white text-center fw-medium" style={{ wordBreak: 'break-all' }}>{currentFile.nome_real}</span>
              <audio src={downloadUrl} controls autoPlay style={{ width: '100%' }} />
            </div>
          ) : (
            <div className="gdrive-preview-fallback">
              <FileText size={64} className="gdrive-preview-fallback-icon" />
              <p className="gdrive-preview-fallback-text">Pré-visualização não disponível para arquivos .{ext}</p>
            </div>
          )}
        </div>

        {/* Right Arrow */}
        {hasNext ? (
          <button className="gdrive-preview-arrow right" onClick={handleNext} title="Próximo (Seta Direita)">
            <ChevronRight size={36} />
          </button>
        ) : (
          <div style={{ width: '56px' }}></div>
        )}
      </div>
    </div>
  );
}
