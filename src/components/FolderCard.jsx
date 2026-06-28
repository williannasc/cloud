// src/components/FolderCard.jsx
import React from 'react';
import { Folder, MoreVertical } from 'lucide-react';

export default function FolderCard({ 
  folder, 
  onClick, 
  isSelected, 
  onSelect, 
  onContextMenu, 
  onThreeDotsClick,
  onFolderDrop 
}) {
  const handleCardClick = (e) => {
    onSelect(folder);
  };

  const handleCardDoubleClick = (e) => {
    e.stopPropagation();
    onClick(folder.id);
  };

  const handleThreeDotsClick = (e) => {
    e.stopPropagation();
    onThreeDotsClick(e);
  };

  // Drag and Drop handlers
  const handleDragStart = (e) => {
    // Serializa os dados do item arrastado
    e.dataTransfer.setData('application/json', JSON.stringify({ id: folder.id, tipo: 'pasta' }));
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.classList.add('drag-over');
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.classList.remove('drag-over');
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.classList.remove('drag-over');
    try {
      const dataStr = e.dataTransfer.getData('application/json');
      if (dataStr) {
        const dragged = JSON.parse(dataStr);
        // Evita loops e arrastar para si mesmo
        if (dragged.id !== folder.id || dragged.tipo !== 'pasta') {
          onFolderDrop(dragged, folder);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div 
      className={`folder-chip ${isSelected ? 'selected' : ''}`} 
      onClick={handleCardClick}
      onDoubleClick={handleCardDoubleClick}
      onContextMenu={onContextMenu}
      draggable
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <Folder className="folder-icon" fill="var(--folder-color)" size={24} />
      <span className="folder-name" title={folder.nome_real}>
        {folder.nome_real}
      </span>

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
  );
}
