import FileManager from '../components/fileManager/FileManager';

const FileManagerPage = () => {
  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex flex-col md:flex-row md:items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Dosya Yönetimi</h1>
          <p className="text-gray-600 dark:text-gray-300 mt-1">Dosyalarınızı yönetin ve organize edin</p>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <FileManager />
      </div>
    </div>
  );
};

export default FileManagerPage;