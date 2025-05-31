import { useState, useEffect } from 'react';
import { FileManagerService, FileItem } from '../../services/fileManagerService';
import { Folder, File, Upload, FolderPlus, Trash2, Edit2, MoveUp, Eye, X } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const FileManager = () => {
  const { user } = useAuth();
  const [files, setFiles] = useState<FileItem[]>([]);
  const [currentPath, setCurrentPath] = useState('/');
  const [selectedFile, setSelectedFile] = useState<FileItem | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [showNewFolderDialog, setShowNewFolderDialog] = useState(false);
  const [showFilePreview, setShowFilePreview] = useState(false);
  const [fileContent, setFileContent] = useState<string | null>(null);

  const fileManager = new FileManagerService(user?.id || '');

  useEffect(() => {
    loadFiles();
  }, [currentPath]);

  const loadFiles = async () => {
    const fileList = await fileManager.listFiles(currentPath);
    setFiles(fileList);
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const result = await fileManager.uploadFile(file, currentPath);
      if (result.success) {
        loadFiles();
      }
    } finally {
      setIsUploading(false);
    }
  };

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) return;

    const success = await fileManager.createFolder(newFolderName, currentPath);
    if (success) {
      setNewFolderName('');
      setShowNewFolderDialog(false);
      loadFiles();
    }
  };

  const handleDeleteFile = async (file: FileItem) => {
    if (confirm(`"${file.name}" silinecek. Emin misiniz?`)) {
      const success = await fileManager.deleteFile(file.id);
      if (success) {
        loadFiles();
      }
    }
  };

  const navigateToFolder = (folder: FileItem) => {
    setCurrentPath(folder.path);
  };

  const navigateUp = () => {
    const parentPath = currentPath.split('/').slice(0, -1).join('/') || '/';
    setCurrentPath(parentPath);
  };

  const handleViewFile = async (file: FileItem) => {
    const content = await fileManager.getFileContent(file.id);
    setFileContent(content);
    setShowFilePreview(true);
  };

  const renderFilePreview = () => {
    if (!selectedFile || !fileContent) return null;

    if (selectedFile.mimeType?.startsWith('text/')) {
      return (
        <pre className="whitespace-pre-wrap font-mono text-sm">
          {fileContent}
        </pre>
      );
    }

    if (selectedFile.mimeType === 'application/pdf') {
      return (
        <iframe
          src={fileContent}
          className="w-full h-full"
          title={selectedFile.name}
        />
      );
    }

    return (
      <div className="text-center text-gray-500">
        Bu dosya türü önizlenemez
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <h2 className="text-xl font-semibold">Dosyalarım</h2>
          <span className="text-gray-500">({currentPath})</span>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowNewFolderDialog(true)}
            className="px-3 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 flex items-center"
          >
            <FolderPlus size={18} className="mr-2" />
            Yeni Klasör
          </button>
          <label className="px-3 py-2 bg-indigo-500 text-white rounded-md hover:bg-indigo-600 flex items-center cursor-pointer">
            <Upload size={18} className="mr-2" />
            Dosya Yükle
            <input
              type="file"
              className="hidden"
              onChange={handleFileUpload}
              disabled={isUploading}
            />
          </label>
        </div>
      </div>

      {currentPath !== '/' && (
        <button
          onClick={navigateUp}
          className="flex items-center text-gray-600 hover:text-gray-900"
        >
          <MoveUp size={18} className="mr-1" />
          Üst Klasör
        </button>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {files.map((file) => (
          <div
            key={file.id}
            className={`p-4 border rounded-lg flex items-center justify-between ${
              selectedFile?.id === file.id ? 'border-indigo-500' : 'border-gray-200'
            }`}
            onClick={() => setSelectedFile(file)}
          >
            <div className="flex items-center space-x-3">
              {file.type === 'folder' ? (
                <Folder size={24} className="text-indigo-500" />
              ) : (
                <File size={24} className="text-gray-500" />
              )}
              <div>
                <p className="font-medium">{file.name}</p>
                <p className="text-sm text-gray-500">
                  {new Date(file.updatedAt).toLocaleDateString()}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {file.type === 'folder' ? (
                <button
                  onClick={() => navigateToFolder(file)}
                  className="p-2 text-gray-500 hover:text-gray-700"
                >
                  <Folder size={18} />
                </button>
              ) : (
                <>
                  <button
                    onClick={() => handleViewFile(file)}
                    className="p-2 text-gray-500 hover:text-gray-700"
                  >
                    <Eye size={18} />
                  </button>
                  <button className="p-2 text-gray-500 hover:text-gray-700">
                    <Edit2 size={18} />
                  </button>
                </>
              )}
              <button
                onClick={() => handleDeleteFile(file)}
                className="p-2 text-red-500 hover:text-red-700"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {showNewFolderDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-96">
            <h3 className="text-lg font-semibold mb-4">Yeni Klasör Oluştur</h3>
            <input
              type="text"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              className="w-full px-3 py-2 border rounded-md mb-4"
              placeholder="Klasör adı"
            />
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setShowNewFolderDialog(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                İptal
              </button>
              <button
                onClick={handleCreateFolder}
                className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
              >
                Oluştur
              </button>
            </div>
          </div>
        </div>
      )}

      {showFilePreview && selectedFile && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-3/4 h-3/4 flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">{selectedFile.name}</h3>
              <button
                onClick={() => setShowFilePreview(false)}
                className="p-2 text-gray-500 hover:text-gray-700"
              >
                <X size={18} />
              </button>
            </div>
            <div className="flex-1 overflow-auto">
              {renderFilePreview()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FileManager;