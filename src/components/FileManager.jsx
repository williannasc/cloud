// src/components/FileManager.jsx
import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  Grid, 
  List, 
  Info, 
  ChevronLeft, 
  Menu, 
  HardDrive, 
  FolderOpen, 
  Loader2, 
  Folder, 
  FileText, 
  FileImage, 
  FileArchive, 
  FileSpreadsheet, 
  File, 
  FileVideo,
  FileAudio,
  FileCode,
  MoreVertical, 
  Download, 
  Eye, 
  Edit, 
  Trash2, 
  Share2, 
  Check, 
  UploadCloud,
  FileCheck2,
  X,
  AlertTriangle,
  Clock,
  Users,
  FolderPlus,
  Upload
} from 'lucide-react';
import { api } from '../services/api';
import FolderCard from './FolderCard';
import FileCard from './FileCard';
import ModalFolder from './ModalFolder';
import ModalUpload from './ModalUpload';
import ModalEdit from './ModalEdit';
import ModalDelete from './ModalDelete';
import ModalPreview from './ModalPreview';
import ModalMove from './ModalMove';

export default function FileManager({ 
  activeDirId, 
  setActiveDirId, 
  onToggleSidebar, 
  onSessionExpired,
  isFolderOpen,
  setIsFolderOpen,
  isUploadOpen,
  setIsUploadOpen,
  setStorageUsed,
  setStorageUsedFormat,
  setStorageLimit,
  setStorageLimitFormat
}) {
  const [data, setData] = useState({
    nome_atual: 'Inicio',
    id_voltar: 0,
    breadcrumb: [],
    pastas: [],
    arquivos: []
  });
  const [loading, setLoading] = useState(true);

  // Layout Preference
  const [viewMode, setViewMode] = useState(() => localStorage.getItem('viewMode') || 'grid');
  const [infoPanelOpen, setInfoPanelOpen] = useState(() => localStorage.getItem('infoPanelOpen') === 'true');
  const [selectedItems, setSelectedItems] = useState([]);
  // Computed: last selected item for the details panel
  const selectedItem = selectedItems.length > 0 ? selectedItems[selectedItems.length - 1] : null;

  // Multi-select handler: Ctrl/Cmd+Click toggles, normal click replaces
  const handleSelectItem = (item, e) => {
    if (e && (e.ctrlKey || e.metaKey)) {
      setSelectedItems(prev => {
        const exists = prev.find(i => i.id === item.id && i.tipo === item.tipo);
        if (exists) {
          return prev.filter(i => !(i.id === item.id && i.tipo === item.tipo));
        }
        return [...prev, item];
      });
    } else {
      setSelectedItems([item]);
    }
  };

  const isItemSelected = (item) => {
    return selectedItems.some(i => i.id === item.id && i.tipo === item.tipo);
  };
  
  // Search state
  const [searchQuery, setSearchQuery] = useState('');

  // Context Menu state
  const [contextMenu, setContextMenu] = useState({ x: 0, y: 0, visible: false, item: null });

  // Upload Progress List (Google Drive style popup)
  const [activeUploads, setActiveUploads] = useState([]);

  // Modals
  const [editItem, setEditItem] = useState(null);
  const [isEditOpen, setIsEditOpen] = useState(false);

  const [deleteItem, setDeleteItem] = useState(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const [previewItem, setPreviewItem] = useState(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [moveItem, setMoveItem] = useState(null);
  const [isMoveOpen, setIsMoveOpen] = useState(false);
  const [bgContextMenu, setBgContextMenu] = useState({ x: 0, y: 0, visible: false });

  // Drag and drop overlay visibility
  const [dragActive, setDragActive] = useState(false);

  // Context menu rows (for three-dots trigger)
  const [activeMenuRowId, setActiveMenuRowId] = useState(null);
  const [copiedRowId, setCopiedRowId] = useState(null);
  const rowMenuRef = useRef(null);
  const folderInputRef = useRef(null);

  // Close context menus on window clicks
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (e.target.closest('.context-menu')) {
        return;
      }
      setContextMenu(prev => ({ ...prev, visible: false }));
      setBgContextMenu(prev => ({ ...prev, visible: false }));
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  // Save layout choices
  useEffect(() => {
    localStorage.setItem('viewMode', viewMode);
  }, [viewMode]);

  useEffect(() => {
    localStorage.setItem('infoPanelOpen', infoPanelOpen.toString());
  }, [infoPanelOpen]);

  // Load files/folders
  const loadDirectory = async (id) => {
    setLoading(true);
    const res = await api.get(`arquivos.php?pai_id=${id}`);
    
    if (res.unauthorized) {
      onSessionExpired();
      return;
    }
    
    if (res.status === 'success') {
      setData(res);
      setStorageUsed(res.tamanho_total_usado || 0);
      setStorageUsedFormat(res.tamanho_total_usado_formatado || '0 bytes');
      if (setStorageLimit && res.limite_total) {
        setStorageLimit(res.limite_total);
      }
      if (setStorageLimitFormat && res.limite_total_formatado) {
        setStorageLimitFormat(res.limite_total_formatado);
      }
      setSelectedItems([]);
    } else {
      alert(res.message || 'Erro ao carregar arquivos.');
    }
    setLoading(false);
  };

  useEffect(() => {
    loadDirectory(activeDirId);
  }, [activeDirId]);

  // Folder APIs
  const handleCreateFolder = async (nome) => {
    setIsFolderOpen(false);
    setLoading(true);
    const res = await api.post('criar_pasta.php', { nome_pasta: nome, pai_id: activeDirId });
    if (res.unauthorized) {
      onSessionExpired();
      return;
    }
    if (res.status === 'success') {
      loadDirectory(activeDirId);
    } else {
      alert(res.message || 'Erro ao criar pasta.');
      setLoading(false);
    }
  };

  // Google Drive Style Floating upload handler
  const handleUploadCustom = async (formData, file, customName = null) => {
    const uploadId = Date.now().toString() + Math.random().toString(36).slice(2, 5);
    const fileName = customName || file.name;
    
    setActiveUploads(prev => [...prev, { id: uploadId, name: fileName, progress: 0, status: 'uploading' }]);

    try {
      const res = await api.upload('upload.php', formData, (progress) => {
        setActiveUploads(prev => prev.map(u => u.id === uploadId ? { ...u, progress } : u));
      });

      if (res.unauthorized) {
        onSessionExpired();
        return;
      }

      if (res.status === 'success') {
        setActiveUploads(prev => prev.map(u => u.id === uploadId ? { ...u, status: 'success', progress: 100 } : u));
        loadDirectory(activeDirId);
      } else {
        setActiveUploads(prev => prev.map(u => u.id === uploadId ? { ...u, status: 'error' } : u));
        alert(res.message || 'Erro ao enviar arquivo.');
      }
    } catch (e) {
      setActiveUploads(prev => prev.map(u => u.id === uploadId ? { ...u, status: 'error' } : u));
      alert('Erro na conexão ao enviar arquivo.');
    }
  };

  const handleUploadSubmit = (formData) => {
    setIsUploadOpen(false);
    const file = formData.get('arquivo');
    handleUploadCustom(formData, file);
  };

  useEffect(() => {
    const handleTrigger = () => {
      if (folderInputRef.current) {
        folderInputRef.current.click();
      }
    };
    window.addEventListener('triggerFolderUpload', handleTrigger);
    return () => window.removeEventListener('triggerFolderUpload', handleTrigger);
  }, []);

  const handleFolderInputChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      Array.from(e.target.files).forEach(file => {
        const formData = new FormData();
        formData.append('arquivo', file);
        formData.append('diretorio_id', activeDirId);
        if (file.webkitRelativePath) {
          formData.append('relative_path', file.webkitRelativePath);
        }
        handleUploadCustom(formData, file, file.webkitRelativePath || null);
      });
    }
  };

  const handleRename = async (id, novoNome) => {
    setIsEditOpen(false);
    setLoading(true);
    const res = await api.post('editar.php', { id, novo_nome: novoNome });
    if (res.unauthorized) {
      onSessionExpired();
      return;
    }
    if (res.status === 'success') {
      loadDirectory(activeDirId);
    } else {
      alert(res.message || 'Erro ao renomear item.');
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    setIsDeleteOpen(false);
    setLoading(true);
    const res = await api.get(`excluir.php?id=${id}`);
    if (res.unauthorized) {
      onSessionExpired();
      return;
    }
    if (res.status === 'success') {
      loadDirectory(activeDirId);
    } else {
      alert(res.message || 'Erro ao excluir item.');
      setLoading(false);
    }
  };

  // Modals Helpers
  const openRenameModal = (item) => {
    setEditItem(item);
    setIsEditOpen(true);
  };

  const openDeleteModal = (item) => {
    setDeleteItem(item);
    setIsDeleteOpen(true);
  };

  const openPreviewModal = (file) => {
    setPreviewItem(file);
    setIsPreviewOpen(true);
  };

  const handleContextMenu = (e, item) => {
    e.preventDefault();
    e.stopPropagation();
    const isAlreadySelected = selectedItems.some(i => i.id === item.id && i.tipo === item.tipo);
    if (!isAlreadySelected) {
      setSelectedItems([item]);
    }
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      visible: true,
      item
    });
  };

  const handleThreeDotsClick = (e, item) => {
    e.preventDefault();
    e.stopPropagation();
    const isAlreadySelected = selectedItems.some(i => i.id === item.id && i.tipo === item.tipo);
    if (!isAlreadySelected) {
      setSelectedItems([item]);
    }
    
    const rect = e.currentTarget.getBoundingClientRect();
    setContextMenu({
      x: rect.left,
      y: rect.bottom,
      visible: true,
      item
    });
  };

  const handleMoveSubmit = async (itemIds, destinoId) => {
    setIsMoveOpen(false);
    setSelectedItems([]);
    setLoading(true);
    const res = await api.post('mover.php', { ids: itemIds, destino_id: destinoId });
    if (res.unauthorized) {
      onSessionExpired();
      return;
    }
    if (res.status === 'success') {
      loadDirectory(activeDirId);
    } else {
      alert(res.message || 'Erro ao mover item.');
      setLoading(false);
    }
  };

  const handleFolderDrop = async (draggedItem, targetFolder) => {
    if (draggedItem.id === targetFolder.id && draggedItem.tipo === 'pasta') {
      return;
    }
    setLoading(true);
    const res = await api.post('mover.php', { id: draggedItem.id, destino_id: targetFolder.id });
    if (res.unauthorized) {
      onSessionExpired();
      return;
    }
    if (res.status === 'success') {
      loadDirectory(activeDirId);
    } else {
      alert(res.message || 'Erro ao mover item.');
      setLoading(false);
    }
  };

  const handleRowFolderDrop = (e, targetFolder) => {
    e.preventDefault();
    e.currentTarget.classList.remove('drag-over');
    try {
      const dataStr = e.dataTransfer.getData('application/json');
      if (dataStr) {
        const dragged = JSON.parse(dataStr);
        handleFolderDrop(dragged, targetFolder);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Drag and Drop implementation
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Apenas ativa se forem arquivos reais arrastados de fora do navegador
    const isFile = e.dataTransfer.types.includes('Files');
    if (!isFile) return;

    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleBgContextMenu = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setBgContextMenu({
      x: e.clientX,
      y: e.clientY,
      visible: true
    });
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const items = e.dataTransfer.items;
    if (items && items.length > 0) {
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (item.kind === 'file') {
          const entry = item.webkitGetAsEntry();
          if (entry) {
            traverseFileEntry(entry, "");
          }
        }
      }
    }
  };

  const traverseFileEntry = (entry, path = "") => {
    if (entry.isFile) {
      entry.file((file) => {
        const formData = new FormData();
        formData.append('arquivo', file);
        formData.append('diretorio_id', activeDirId);
        
        const fullRelativePath = path ? `${path}${file.name}` : "";
        if (fullRelativePath) {
          formData.append('relative_path', fullRelativePath);
        }
        handleUploadCustom(formData, file, fullRelativePath || null);
      });
    } else if (entry.isDirectory) {
      const dirReader = entry.createReader();
      const readAllEntries = () => {
        dirReader.readEntries((entries) => {
          if (entries.length > 0) {
            for (const subEntry of entries) {
              traverseFileEntry(subEntry, `${path}${entry.name}/`);
            }
            readAllEntries();
          }
        });
      };
      readAllEntries();
    }
  };

  // Formatting dates beautifully
  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    try {
      const d = new Date(dateStr.replace(' ', 'T'));
      return d.toLocaleDateString('pt-BR', { 
        day: '2-digit', 
        month: 'short', 
        year: 'numeric' 
      }) + ' ' + d.toLocaleTimeString('pt-BR', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } catch (e) {
      return dateStr;
    }
  };

  const getFileIcon = (ext, size = 18) => {
    const format = ext?.toLowerCase() || '';
    if (format === 'pdf') return <FileText size={size} style={{ color: '#ffb4ab' }} />;
    if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(format)) return <FileImage size={size} style={{ color: '#c2e7ff' }} />;
    if (['zip', 'rar', '7z', 'tar', 'gz'].includes(format)) return <FileArchive size={size} style={{ color: '#d8b4fe' }} />;
    if (['xls', 'xlsx', 'csv', 'ods'].includes(format)) return <FileSpreadsheet size={size} style={{ color: '#c7f7d4' }} />;
    if (['mp4', 'webm', 'avi', 'mkv', 'mov', 'flv', 'wmv'].includes(format)) return <FileVideo size={size} style={{ color: '#ffe0b2' }} />;
    if (['mp3', 'wav', 'ogg', 'm4a', 'flac', 'aac'].includes(format)) return <FileAudio size={size} style={{ color: '#b2ebf2' }} />;
    if (['txt', 'md', 'rtf', 'doc', 'docx'].includes(format)) return <FileText size={size} style={{ color: '#c5cae9' }} />;
    if (['exe', 'msi', 'apk', 'app', 'dmg', 'bat', 'sh', 'js', 'html', 'css', 'json', 'php', 'py', 'cpp', 'c', 'h'].includes(format)) return <FileCode size={size} style={{ color: '#e1bee7' }} />;
    return <File size={size} style={{ color: '#e3e3e3' }} />;
  };

  const getFileTypeLabel = (item) => {
    if (item.tipo === 'pasta') return 'Pasta de arquivos';
    const ext = item.extensao?.toLowerCase() || '';
    if (ext === 'pdf') return 'Documento PDF';
    if (['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg'].includes(ext)) return `Imagem ${ext.toUpperCase()}`;
    if (['zip', 'rar', '7z'].includes(ext)) return `Arquivo Compactado (${ext.toUpperCase()})`;
    if (['xls', 'xlsx', 'csv'].includes(ext)) return 'Planilha Excel/CSV';
    return `Arquivo ${ext.toUpperCase()}`;
  };

  // Row dropdown menus for list view
  const handleRowMenuClick = (e, item) => {
    e.stopPropagation();
    setActiveMenuRowId(activeMenuRowId === item.id ? null : item.id);
  };

  const handleRowShare = (e, item) => {
    e.stopPropagation();
    const hash = btoa(item.id.toString());
    const origin = window.location.origin;
    let path = window.location.pathname;
    
    if (path.endsWith('index.html')) {
      path = path.substring(0, path.lastIndexOf('/') + 1);
    } else if (!path.endsWith('/')) {
      path += '/';
    }
    const publicUrl = `${origin}${path}s.php?h=${hash}`;

    navigator.clipboard.writeText(publicUrl).then(() => {
      setCopiedRowId(item.id);
      setTimeout(() => {
        setCopiedRowId(null);
        setActiveMenuRowId(null);
        setContextMenu(prev => ({ ...prev, visible: false }));
      }, 1500);
    });
  };

  // Filtering lists by search query
  const filteredPastas = data.pastas.filter(p => 
    p.nome_real.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const filteredArquivos = data.arquivos.filter(a => 
    a.nome_real.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div 
      className="main-dashboard"
      onDragEnter={handleDrag}
      onDragOver={handleDrag}
      onDragLeave={handleDrag}
      onDrop={handleDrop}
    >
      {/* Mobile top header */}
      <div className="mobile-header d-md-none">
        <h5 className="fw-bold mb-0 text-info">Private Drive</h5>
        <button className="icon-btn" onClick={onToggleSidebar}>
          <Menu size={20} />
        </button>
      </div>

      {/* Header bar: Search and View Layout controls */}
      <div className="header-bar">
        <div className="search-container">
          <Search size={18} className="search-icon" />
          <input 
            type="text" 
            className="search-input" 
            placeholder="Pesquisar no Drive" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="header-actions">
          <button 
            className={`icon-btn ${viewMode === 'grid' ? 'active' : ''}`}
            onClick={() => setViewMode('grid')}
            title="Visualização em grade"
          >
            <Grid size={18} />
          </button>
          
          <button 
            className={`icon-btn ${viewMode === 'list' ? 'active' : ''}`}
            onClick={() => setViewMode('list')}
            title="Visualização em lista"
          >
            <List size={18} />
          </button>

          <button 
            className={`icon-btn ${infoPanelOpen ? 'active' : ''}`}
            onClick={() => setInfoPanelOpen(!infoPanelOpen)}
            title="Ver detalhes"
          >
            <Info size={18} />
          </button>
        </div>
      </div>

      {/* Subheader bar for Path / Breadcrumbs */}
      <div className="subheader-bar">
        <div className="breadcrumb-container">
          <span 
            className={`breadcrumb-item ${activeDirId === 0 ? 'current' : ''}`}
            onClick={() => activeDirId !== 0 && setActiveDirId(0)}
          >
            Meu Drive
          </span>
          {data.breadcrumb.map((b, i) => {
            const isLast = i === data.breadcrumb.length - 1;
            return (
              <React.Fragment key={b.id}>
                <span className="breadcrumb-separator">/</span>
                <span 
                  className={`breadcrumb-item ${isLast ? 'current' : ''}`}
                  onClick={() => !isLast && setActiveDirId(b.id)}
                >
                  {b.nome_real}
                </span>
              </React.Fragment>
            );
          })}
        </div>
      </div>

      <div className="dashboard-body-wrapper" style={{ flexGrow: 1, height: 'auto', overflow: 'hidden', display: 'flex', width: '100%' }}>
        <div className="dashboard-content" onContextMenu={handleBgContextMenu}>
          {/* File Drag and Drop Visual overlay */}
          {dragActive && (
            <div className="drag-drop-overlay">
              <UploadCloud size={64} className="animate-bounce" />
              <div className="drag-drop-title">Solte os arquivos para fazer o upload no Drive</div>
            </div>
          )}

          {loading ? (
            <div className="empty-state">
              <Loader2 size={36} className="animate-spin text-info" />
              <p className="mt-3">Carregando itens...</p>
            </div>
          ) : filteredPastas.length === 0 && filteredArquivos.length === 0 ? (
            <div className="empty-state">
              <FolderOpen size={48} className="empty-state-icon" />
              <p>Nenhum item encontrado nesta pasta.</p>
            </div>
          ) : viewMode === 'grid' ? (
            // GRID VIEW
            <>
              {filteredPastas.length > 0 && (
                <>
                  <p className="section-title">Pastas</p>
                  <div className="folders-grid">
                    {filteredPastas.map((folder) => (
                      <div 
                        key={folder.id} 
                        onContextMenu={(e) => handleContextMenu(e, folder)}
                        style={{ display: 'contents' }}
                      >
                        <FolderCard
                          folder={folder}
                          onClick={setActiveDirId}
                          isSelected={isItemSelected(folder)}
                          onSelect={handleSelectItem}
                          onThreeDotsClick={(e) => handleThreeDotsClick(e, folder)}
                          onFolderDrop={handleFolderDrop}
                        />
                      </div>
                    ))}
                  </div>
                </>
              )}

              {filteredArquivos.length > 0 && (
                <>
                  <p className="section-title">Arquivos</p>
                  <div className="files-grid">
                    {filteredArquivos.map((file) => (
                      <div 
                        key={file.id} 
                        onContextMenu={(e) => handleContextMenu(e, file)}
                        style={{ display: 'contents' }}
                      >
                        <FileCard
                          file={file}
                          onPreview={openPreviewModal}
                          isSelected={isItemSelected(file)}
                          onSelect={handleSelectItem}
                          onThreeDotsClick={(e) => handleThreeDotsClick(e, file)}
                        />
                      </div>
                    ))}
                  </div>
                </>
              )}
            </>
          ) : (
            // LIST VIEW (Table layout)
            <div style={{ overflowX: 'auto' }}>
              <table className="list-view-table">
                <thead>
                  <tr>
                    <th>Nome</th>
                    <th>Proprietário</th>
                    <th>Última modificação</th>
                    <th>Tamanho</th>
                    <th style={{ width: '40px' }}></th>
                  </tr>
                </thead>
                <tbody>
                  {/* Folders in table */}
                  {filteredPastas.map((folder) => (
                    <tr 
                      key={folder.id} 
                      className={`list-row ${isItemSelected(folder) ? 'selected' : ''}`}
                      onClick={(e) => handleSelectItem(folder, e)}
                      onDoubleClick={() => setActiveDirId(folder.id)}
                      onContextMenu={(e) => handleContextMenu(e, folder)}
                      draggable
                      onDragStart={(e) => e.dataTransfer.setData('application/json', JSON.stringify({ id: folder.id, tipo: 'pasta' }))}
                      onDragOver={(e) => { e.preventDefault(); e.currentTarget.classList.add('drag-over'); }}
                      onDragLeave={(e) => e.currentTarget.classList.remove('drag-over')}
                      onDrop={(e) => handleRowFolderDrop(e, folder)}
                    >
                      <td>
                        <div className="list-item-name-cell">
                          <Folder size={18} style={{ color: 'var(--folder-color)', fill: 'var(--folder-color)' }} />
                          <span className="list-item-name-text" title={folder.nome_real}>{folder.nome_real}</span>
                        </div>
                      </td>
                      <td className="text-secondary" style={{ fontSize: '0.8rem' }}>Eu</td>
                      <td className="text-secondary" style={{ fontSize: '0.8rem' }}>{formatDate(folder.criado_em)}</td>
                      <td className="text-secondary" style={{ fontSize: '0.8rem' }}>—</td>
                      <td>
                        <div className="list-three-dots-container">
                          <button 
                            className="three-dots-btn" 
                            onClick={(e) => handleThreeDotsClick(e, folder)}
                          >
                            <MoreVertical size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}

                  {/* Files in table */}
                  {filteredArquivos.map((file) => (
                    <tr 
                      key={file.id} 
                      className={`list-row ${isItemSelected(file) ? 'selected' : ''}`}
                      onClick={(e) => handleSelectItem(file, e)}
                      onDoubleClick={() => openPreviewModal(file)}
                      onContextMenu={(e) => handleContextMenu(e, file)}
                      draggable
                      onDragStart={(e) => e.dataTransfer.setData('application/json', JSON.stringify({ id: file.id, tipo: 'arquivo' }))}
                    >
                      <td>
                        <div className="list-item-name-cell">
                          {getFileIcon(file.extensao)}
                          <span className="list-item-name-text" title={file.nome_real}>{file.nome_real}</span>
                        </div>
                      </td>
                      <td className="text-secondary" style={{ fontSize: '0.8rem' }}>Eu</td>
                      <td className="text-secondary" style={{ fontSize: '0.8rem' }}>{formatDate(file.criado_em)}</td>
                      <td className="text-secondary" style={{ fontSize: '0.8rem' }}>{file.tamanho_formatado}</td>
                      <td>
                        <div className="list-three-dots-container">
                          <button 
                            className="three-dots-btn" 
                            onClick={(e) => handleThreeDotsClick(e, file)}
                          >
                            <MoreVertical size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* DETAILS SIDE PANEL (Right panel metadata bar) */}
        {infoPanelOpen && (
          <div className="details-panel">
            <div className="details-header">
              <span className="details-title">Detalhes</span>
              <button 
                className="icon-btn" 
                onClick={() => setInfoPanelOpen(false)}
                title="Fechar"
              >
                <ChevronLeft size={16} style={{ transform: 'rotate(180deg)' }} />
              </button>
            </div>

            <div className="details-body">
              {selectedItem ? (
                <>
                  <div className="details-preview-card">
                    {selectedItem.tipo === 'pasta' ? (
                      <Folder size={48} style={{ color: 'var(--folder-color)', fill: 'var(--folder-color)' }} />
                    ) : ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(selectedItem.extensao?.toLowerCase()) ? (
                      <img src={api.getDownloadUrl(selectedItem.id)} alt={selectedItem.nome_real} />
                    ) : (
                      getFileIcon(selectedItem.extensao, 48)
                    )}
                  </div>

                  <h6 className="fw-bold text-center text-truncate" title={selectedItem.nome_real} style={{ margin: '0 8px' }}>
                    {selectedItem.nome_real}
                  </h6>

                  <div>
                    <h6 className="text-secondary font-weight-bold d-block mb-2" style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Propriedades do item</h6>
                    <table className="details-meta-table">
                      <tbody>
                        <tr className="details-meta-row">
                          <th>Tipo</th>
                          <td>{getFileTypeLabel(selectedItem)}</td>
                        </tr>
                        {selectedItem.tipo === 'arquivo' && (
                          <tr className="details-meta-row">
                            <th>Tamanho</th>
                            <td>{selectedItem.tamanho_formatado}</td>
                          </tr>
                        )}
                        <tr className="details-meta-row">
                          <th>Local</th>
                          <td>{data.nome_atual === 'Inicio' ? 'Meu Drive' : data.nome_atual}</td>
                        </tr>
                        <tr className="details-meta-row">
                          <th>Criado em</th>
                          <td>{formatDate(selectedItem.criado_em)}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </>
              ) : (
                <div className="text-center text-secondary py-5 small">
                  <HardDrive size={36} className="opacity-30 mb-2" />
                  <p>Selecione um arquivo ou pasta para ver suas propriedades.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Floating Bottom-Right Upload Status Panel (Google Drive style) */}
      {activeUploads.length > 0 && (
        <div className="upload-status-widget">
          <div className="upload-status-header">
            <span className="upload-status-title">
              {activeUploads.some(u => u.status === 'uploading') 
                ? `Carregando ${activeUploads.filter(u => u.status === 'uploading').length} item(ns)` 
                : `${activeUploads.length} carregamento(s) concluído(s)`}
            </span>
            <button 
              className="icon-btn" 
              onClick={() => setActiveUploads([])} 
              style={{ width: '24px', height: '24px', color: 'var(--primary-text)', opacity: 0.8 }}
              title="Limpar tudo"
            >
              <X size={14} />
            </button>
          </div>
          <div className="upload-status-body">
            {activeUploads.map(upload => (
              <div key={upload.id} className="upload-status-item">
                <span className="upload-item-name" title={upload.name}>{upload.name}</span>
                <div className="upload-item-progress">
                  {upload.status === 'uploading' ? (
                    <>
                      <span className="small text-info fw-bold" style={{ fontSize: '0.75rem' }}>{upload.progress}%</span>
                      <div className="upload-progress-circle"></div>
                    </>
                  ) : upload.status === 'success' ? (
                    <FileCheck2 size={16} className="upload-success-icon" />
                  ) : (
                    <AlertTriangle size={16} className="upload-error-icon" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Floating Desktop Right-Click Context Menu */}
      {contextMenu.visible && (
        <div 
          className="context-menu" 
          style={{ 
            position: 'fixed', 
            top: `${contextMenu.y}px`, 
            left: `${contextMenu.x}px`, 
            marginTop: 0,
            display: 'block' 
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {contextMenu.item.tipo === 'arquivo' && (
            <div className="context-item" onClick={(e) => { e.stopPropagation(); setContextMenu(prev => ({ ...prev, visible: false })); openPreviewModal(contextMenu.item); }}>
              <Eye size={14} className="text-secondary" />
              <span>Visualizar</span>
            </div>
          )}
          {contextMenu.item.tipo === 'arquivo' && (
            <div className="context-item" onClick={(e) => { e.stopPropagation(); setContextMenu(prev => ({ ...prev, visible: false })); window.location.href = api.getDownloadUrl(contextMenu.item.id); }}>
              <Download size={14} className="text-secondary" />
              <span>Download</span>
            </div>
          )}
          <div className="context-item" onClick={(e) => { e.stopPropagation(); setContextMenu(prev => ({ ...prev, visible: false })); openRenameModal(contextMenu.item); }}>
            <Edit size={14} className="text-secondary" />
            <span>Renomear</span>
          </div>
          <div className="context-item" onClick={(e) => { 
            e.stopPropagation(); 
            setContextMenu(prev => ({ ...prev, visible: false })); 
            // Se o item clicado faz parte da seleção múltipla, mover todos os selecionados
            const clickedItem = contextMenu.item;
            const isInSelection = selectedItems.some(i => i.id === clickedItem.id && i.tipo === clickedItem.tipo);
            const itemsToMove = isInSelection && selectedItems.length > 1 ? selectedItems : [clickedItem];
            setMoveItem(itemsToMove);
            setIsMoveOpen(true); 
          }}>
            <FolderOpen size={14} className="text-secondary" />
            <span>{selectedItems.length > 1 && selectedItems.some(i => i.id === contextMenu.item.id && i.tipo === contextMenu.item.tipo) ? `Mover ${selectedItems.length} itens` : 'Mover'}</span>
          </div>
          <div className="context-item" onClick={(e) => handleRowShare(e, contextMenu.item)}>
            {copiedRowId === contextMenu.item.id ? (
              <>
                <Check size={14} className="text-success" />
                <span className="text-success">Copiado!</span>
              </>
            ) : (
              <>
                <Share2 size={14} className="text-secondary" />
                <span>Compartilhar</span>
              </>
            )}
          </div>
          <div className="context-item delete" onClick={(e) => { e.stopPropagation(); setContextMenu(prev => ({ ...prev, visible: false })); openDeleteModal(contextMenu.item); }}>
            <Trash2 size={14} className="text-danger" />
            <span className="text-danger">Excluir</span>
          </div>
        </div>
      )}

      {/* Floating Desktop Right-Click Context Menu for Empty Background Area */}
      {bgContextMenu.visible && (
        <div 
          className="context-menu" 
          style={{ 
            position: 'fixed', 
            top: `${bgContextMenu.y}px`, 
            left: `${bgContextMenu.x}px`, 
            marginTop: 0,
            display: 'block' 
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="context-item" onClick={(e) => { e.stopPropagation(); setBgContextMenu(prev => ({ ...prev, visible: false })); setIsFolderOpen(true); }}>
            <FolderPlus size={14} className="text-warning" />
            <span>Nova pasta</span>
          </div>
          <div className="context-item" onClick={(e) => { e.stopPropagation(); setBgContextMenu(prev => ({ ...prev, visible: false })); setIsUploadOpen(true); }}>
            <Upload size={14} className="text-info" />
            <span>Fazer upload de arquivo</span>
          </div>
          <div className="context-item" onClick={(e) => { e.stopPropagation(); setBgContextMenu(prev => ({ ...prev, visible: false })); folderInputRef.current?.click(); }}>
            <Folder size={14} className="text-success" />
            <span>Fazer upload de pasta</span>
          </div>
        </div>
      )}

      {/* Modals */}
      <ModalFolder
        isOpen={isFolderOpen}
        onClose={() => setIsFolderOpen(false)}
        onSubmit={handleCreateFolder}
      />

      <ModalUpload
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onSubmit={handleUploadSubmit}
        uploadProgress={0}
        isUploading={false}
      />

      <ModalEdit
        isOpen={isEditOpen}
        item={editItem}
        onClose={() => setIsEditOpen(false)}
        onSubmit={handleRename}
      />

      <ModalDelete
        isOpen={isDeleteOpen}
        item={deleteItem}
        onClose={() => setIsDeleteOpen(false)}
        onSubmit={handleDelete}
      />

      <ModalPreview
        isOpen={isPreviewOpen}
        file={previewItem}
        files={filteredArquivos}
        onClose={() => setIsPreviewOpen(false)}
      />

      <ModalMove
        isOpen={isMoveOpen}
        onClose={() => setIsMoveOpen(false)}
        items={Array.isArray(moveItem) ? moveItem : (moveItem ? [moveItem] : [])}
        onSubmit={handleMoveSubmit}
      />

      <input 
        type="file" 
        ref={folderInputRef} 
        style={{ display: 'none' }} 
        webkitdirectory="" 
        directory="" 
        multiple 
        onChange={handleFolderInputChange} 
      />
    </div>
  );
}
