import { v4 as uuidv4 } from 'uuid';

export interface FileItem {
  id: string;
  name: string;
  type: 'folder' | 'file';
  size?: number;
  content?: string;
  mimeType?: string;
  createdAt: string;
  updatedAt: string;
  path: string;
  userId: string;
}

export interface FileUploadResponse {
  success: boolean;
  file?: FileItem;
  error?: string;
}

// In-memory storage for files and folders
const fileStorage = new Map<string, Map<string, FileItem>>();

export class FileManagerService {
  private userId: string;
  private userFiles: Map<string, FileItem>;

  constructor(userId: string) {
    this.userId = userId;
    
    // Initialize user's file storage if it doesn't exist
    if (!fileStorage.has(userId)) {
      fileStorage.set(userId, new Map());
    }
    this.userFiles = fileStorage.get(userId)!;

    // Create root folder if it doesn't exist
    if (!this.userFiles.has('/')) {
      this.userFiles.set('/', {
        id: '/',
        name: 'Root',
        type: 'folder',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        path: '/',
        userId: this.userId
      });
    }
  }

  async listFiles(path: string = '/'): Promise<FileItem[]> {
    try {
      // Filter files by path
      return Array.from(this.userFiles.values())
        .filter(file => {
          const parentPath = file.path.split('/').slice(0, -1).join('/') || '/';
          return parentPath === path;
        })
        .sort((a, b) => {
          // Folders first, then files
          if (a.type === 'folder' && b.type !== 'folder') return -1;
          if (a.type !== 'folder' && b.type === 'folder') return 1;
          return a.name.localeCompare(b.name);
        });
    } catch (error) {
      console.error('Failed to list files:', error);
      return [];
    }
  }

  async createFolder(name: string, path: string = '/'): Promise<boolean> {
    try {
      const fullPath = path === '/' ? `/${name}` : `${path}/${name}`;
      
      // Check if folder already exists
      const exists = Array.from(this.userFiles.values())
        .some(file => file.path === fullPath);
      
      if (exists) {
        console.error('Folder already exists');
        return false;
      }

      const newFolder: FileItem = {
        id: uuidv4(),
        name,
        type: 'folder',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        path: fullPath,
        userId: this.userId
      };

      this.userFiles.set(newFolder.id, newFolder);
      return true;
    } catch (error) {
      console.error('Failed to create folder:', error);
      return false;
    }
  }

  async uploadFile(file: File, path: string = '/'): Promise<FileUploadResponse> {
    try {
      const fullPath = path === '/' ? `/${file.name}` : `${path}/${file.name}`;
      
      // Read file content
      const content = await this.readFileContent(file);
      
      const newFile: FileItem = {
        id: uuidv4(),
        name: file.name,
        type: 'file',
        size: file.size,
        content,
        mimeType: file.type,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        path: fullPath,
        userId: this.userId
      };

      this.userFiles.set(newFile.id, newFile);

      return {
        success: true,
        file: newFile
      };
    } catch (error) {
      return {
        success: false,
        error: 'Failed to upload file'
      };
    }
  }

  private async readFileContent(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = () => {
        resolve(reader.result as string);
      };
      
      reader.onerror = () => {
        reject(new Error('Failed to read file'));
      };

      if (file.type.startsWith('text/') || file.type === 'application/pdf') {
        reader.readAsText(file);
      } else {
        reader.readAsDataURL(file);
      }
    });
  }

  async getFileContent(fileId: string): Promise<string | null> {
    const file = this.userFiles.get(fileId);
    return file?.content || null;
  }

  async deleteFile(fileId: string): Promise<boolean> {
    try {
      const file = this.userFiles.get(fileId);
      if (!file) return false;

      // If it's a folder, delete all contents
      if (file.type === 'folder') {
        const filesToDelete = Array.from(this.userFiles.values())
          .filter(f => f.path.startsWith(file.path));
        
        filesToDelete.forEach(f => this.userFiles.delete(f.id));
      }

      this.userFiles.delete(fileId);
      return true;
    } catch (error) {
      console.error('Failed to delete file:', error);
      return false;
    }
  }

  async moveFile(fileId: string, newPath: string): Promise<boolean> {
    try {
      const file = this.userFiles.get(fileId);
      if (!file) return false;

      const newFullPath = newPath === '/' ? `/${file.name}` : `${newPath}/${file.name}`;
      
      const updatedFile: FileItem = {
        ...file,
        path: newFullPath,
        updatedAt: new Date().toISOString()
      };

      this.userFiles.set(fileId, updatedFile);
      return true;
    } catch (error) {
      console.error('Failed to move file:', error);
      return false;
    }
  }

  async renameFile(fileId: string, newName: string): Promise<boolean> {
    try {
      const file = this.userFiles.get(fileId);
      if (!file) return false;

      const parentPath = file.path.split('/').slice(0, -1).join('/') || '/';
      const newPath = parentPath === '/' ? `/${newName}` : `${parentPath}/${newName}`;

      const updatedFile: FileItem = {
        ...file,
        name: newName,
        path: newPath,
        updatedAt: new Date().toISOString()
      };

      this.userFiles.set(fileId, updatedFile);
      return true;
    } catch (error) {
      console.error('Failed to rename file:', error);
      return false;
    }
  }
}