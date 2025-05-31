import { useState, useEffect } from 'react';
import { Plus, Save, Trash2, FileText } from 'lucide-react';

interface Keyword {
  id: string;
  keyword: string;
  createdAt: string;
}

const Keywords = () => {
  const [keywords, setKeywords] = useState<Keyword[]>(() => {
    // Load saved keywords from localStorage on component mount
    const savedKeywords = localStorage.getItem('savedKeywords');
    if (savedKeywords) {
      try {
        return JSON.parse(savedKeywords);
      } catch (e) {
        console.error('Error parsing saved keywords:', e);
        return [];
      }
    }
    return [];
  });
  
  const [bulkKeywords, setBulkKeywords] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success'>('idle');

  // Save keywords to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('savedKeywords', JSON.stringify(keywords));
    // Also save the keywords as strings for API scanning
    const keywordStrings = keywords.map(k => k.keyword);
    localStorage.setItem('keywords', keywordStrings.join('\n'));
  }, [keywords]);

  const handleBulkAdd = () => {
    if (!bulkKeywords.trim()) return;

    const newKeywords = bulkKeywords
      .split('\n')
      .filter(k => k.trim())
      .map(keyword => ({
        id: Math.random().toString(36).substr(2, 9),
        keyword: keyword.trim(),
        createdAt: new Date().toISOString()
      }));

    setKeywords(prevKeywords => [...prevKeywords, ...newKeywords]);
    setBulkKeywords('');
  };

  const handleDelete = (id: string) => {
    setKeywords(prevKeywords => prevKeywords.filter(k => k.id !== id));
  };

  const handleSaveAll = async () => {
    setIsLoading(true);
    setSaveStatus('saving');
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSaveStatus('success');
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch (error) {
      console.error('Error saving keywords:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex flex-col md:flex-row md:items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Anahtar Kelimeler</h1>
          <p className="text-gray-600 dark:text-gray-300 mt-1">Toplu anahtar kelime ekleme ve yönetimi</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Toplu Ekleme Alanı */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
            Toplu Anahtar Kelime Ekle
          </h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Anahtar Kelimeler (Her satıra bir tane)
              </label>
              <textarea
                value={bulkKeywords}
                onChange={(e) => setBulkKeywords(e.target.value)}
                rows={8}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Her satıra bir anahtar kelime yazın..."
              />
            </div>

            <button
              onClick={handleBulkAdd}
              disabled={!bulkKeywords.trim()}
              className="w-full px-4 py-2 bg-indigo-500 text-white rounded-md hover:bg-indigo-600 transition-colors flex items-center justify-center disabled:bg-indigo-300 dark:disabled:bg-indigo-700"
            >
              <Plus size={18} className="mr-2" />
              Toplu Ekle
            </button>
          </div>
        </div>

        {/* Eklenen Kelimeler Listesi */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
              Eklenen Kelimeler
            </h2>
            <button
              onClick={handleSaveAll}
              disabled={keywords.length === 0 || isLoading}
              className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors flex items-center disabled:bg-green-300 dark:disabled:bg-green-700"
            >
              <Save size={18} className="mr-2" />
              {saveStatus === 'saving' ? 'Kaydediliyor...' : 'Tümünü Kaydet'}
            </button>
          </div>

          <div className="overflow-y-auto max-h-[400px]">
            {keywords.length === 0 ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400 flex flex-col items-center">
                <FileText size={48} className="mb-2 opacity-50" />
                <p>Henüz anahtar kelime eklenmedi</p>
              </div>
            ) : (
              <div className="space-y-2">
                {keywords.map((keyword) => (
                  <div
                    key={keyword.id}
                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-md"
                  >
                    <div>
                      <p className="text-gray-900 dark:text-white font-medium">
                        {keyword.keyword}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {new Date(keyword.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <button
                      onClick={() => handleDelete(keyword.id)}
                      className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {saveStatus === 'success' && (
            <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-md text-sm">
              Anahtar kelimeler başarıyla kaydedildi!
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Keywords;