// src/components/FileCard.jsx
import React from 'react';
import { api } from '../services/api';
import { 
  FileText, 
  FileImage, 
  FileArchive, 
  FileSpreadsheet, 
  File, 
  MoreVertical,
  FileVideo,
  FileAudio,
  FileCode
} from 'lucide-react';

export default function FileCard({ file, onPreview, isSelected, onSelect, onContextMenu, onThreeDotsClick }) {
  const getIconAndColor = (ext) => {
    const format = ext?.toLowerCase() || '';
    if (format === 'pdf') {
      return { Icon: FileText, color: '#ffb4ab' }; // Red Accent
    }
    if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(format)) {
      return { Icon: FileImage, color: '#c2e7ff' }; // Blue Accent
    }
    if (['zip', 'rar', '7z', 'tar', 'gz'].includes(format)) {
      return { Icon: FileArchive, color: '#d8b4fe' }; // Purple Accent
    }
    if (['xls', 'xlsx', 'csv', 'ods'].includes(format)) {
      return { Icon: FileSpreadsheet, color: '#c7f7d4' }; // Green Accent
    }
    if (['mp4', 'webm', 'avi', 'mkv', 'mov', 'flv', 'wmv'].includes(format)) {
      return { Icon: FileVideo, color: '#ffe0b2' }; // Orange Accent for Video
    }
    if (['mp3', 'wav', 'ogg', 'm4a', 'flac', 'aac'].includes(format)) {
      return { Icon: FileAudio, color: '#b2ebf2' }; // Teal Accent for Audio
    }
    if (['txt', 'md', 'rtf', 'doc', 'docx'].includes(format)) {
      return { Icon: FileText, color: '#c5cae9' }; // Indigo Accent for Text Docs
    }
    if (['exe', 'msi', 'apk', 'app', 'dmg', 'bat', 'sh', 'js', 'html', 'css', 'json', 'php', 'py', 'cpp', 'c', 'h'].includes(format)) {
      return { Icon: FileCode, color: '#e1bee7' }; // Lavender Accent for Code/Executables
    }
    return { Icon: File, color: '#e3e3e3' }; // Default
  };

  const { Icon, color } = getIconAndColor(file.extensao);
  const downloadUrl = api.getDownloadUrl(file.id);
  const isImage = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(file.extensao?.toLowerCase());

  const handleCardClick = (e) => {
    onSelect(file, e);
  };

  const handleCardDoubleClick = (e) => {
    e.stopPropagation();
    onPreview(file);
  };

  const handleThreeDotsClick = (e) => {
    e.stopPropagation();
    onThreeDotsClick(e);
  };

  // Drag handler
  const handleDragStart = (e) => {
    e.dataTransfer.setData('application/json', JSON.stringify({ id: file.id, tipo: 'arquivo' }));
  };

  return (
    <div 
      className={`file-card ${isSelected ? 'selected' : ''}`}
      onClick={handleCardClick}
      onDoubleClick={handleCardDoubleClick}
      onContextMenu={onContextMenu}
      draggable
      onDragStart={handleDragStart}
    >
      {/* File Preview Area */}
      <div className="file-preview-area">
        {isImage ? (
          <img src={downloadUrl} alt={file.nome_real} loading="lazy" />
        ) : (
          <Icon size={44} style={{ color }} />
        )}
      </div>

      {/* Details Area */}
      <div className="file-card-details">
        <Icon size={16} style={{ color, flexShrink: 0 }} />
        <div className="file-info-text">
          <span className="file-title" title={file.nome_real}>
            {file.nome_real}
          </span>
          <span className="file-meta-sub">
            {file.tamanho_formatado}
          </span>
        </div>

        {/* Three-dots contextual menu */}
        <div className="context-menu-container">
          <button 
            className="three-dots-btn" 
            onClick={handleThreeDotsClick}
            title="Mais ações"
          >
            <MoreVertical size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
