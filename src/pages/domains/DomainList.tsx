import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash2, FileText, Filter, Edit2, Download, Search, Globe } from 'lucide-react';
import FormField from '../../components/form/FormField';

interface Domain {
  id: string;
  domain: string;
  path?: string;
  type: 'blacklist' | 'whitelist';
  note?: string;
  createdAt: string;
  source: 'manual' | 'serp' | 'whois';
}

interface Filters {
  search: string;
  type: 'all' | 'blacklist' | 'whitelist';
  source: 'all' | 'manual' | 'serp' | 'whois';
  sortBy: 'newest' | 'oldest' | 'domain';
}

const DomainList = () => {
  const navigate = useNavigate();
  const [domains, setDomains] = useState<Domain[]>(() => {
    const savedDomains = localStorage.getItem('domains');
    return savedDomains ? JSON.parse(savedDomains) : [];
  });

  const [filters, setFilters] = useState<Filters>({
    search: '',
    type: 'all',
    source: 'all',
    sortBy: 'newest'
  });

  const [showFilters, setShowFilters] = useState(true);
  const [newDomain, setNewDomain] = useState({
    domain: '',
    path: '',
    type: 'blacklist' as const,
    note: ''
  });

  useEffect(() => {
    localStorage.setItem('domains', JSON.stringify(domains));
  }, [domains]);

  const handleDelete = (id: string) => {
    if (confirm('Bu domaini silmek istediğinizden emin misiniz?')) {
      setDomains(prev => prev.filter(d => d.id !== id));
    }
  };

  const handleEdit = (id: string) => {
    navigate(`/domains/edit/${id}`);
  };

  const handleAddDomain = () => {
    if (!newDomain.domain.trim()) return;

    const domain: Domain = {
      id: Math.random().toString(36).substr(2, 9),
      ...newDomain,
      createdAt: new Date().toISOString(),
      source: 'manual'
    };

    setDomains(prev => [...prev, domain]);
    setNewDomain({ domain: '', path: '', type: 'blacklist', note: '' });
  };

  const exportDomains = () => {
    const csv = [
      ['Domain', 'Path', 'Type', 'Source', 'Note', 'Created At'].join(','),
      ...filteredDomains.map(d => [
        d.domain,
        d.path || '',
        d.type,
        d.source,
        d.note || '',
        new Date(d.createdAt).toLocaleString()
      ].join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'domains.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const filteredDomains = domains
    .filter(domain => {
      const searchTerm = filters.search.toLowerCase();
      const matchesSearch = domain.domain.toLowerCase().includes(searchTerm) ||
                          domain.path?.toLowerCase().includes(searchTerm) ||
                          domain.note?.toLowerCase().includes(searchTerm);
      
      const matchesType = filters.type === 'all' || domain.type === filters.type;
      const matchesSource = filters.source === 'all' || domain.source === filters.source;
      
      return matchesSearch && matchesType && matchesSource;
    })
    .sort((a, b) => {
      switch (filters.sortBy) {
        case 'newest':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'oldest':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case 'domain':
          return a.domain.localeCompare(b.domain);
        default:
          return 0;
      }
    });

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex flex-col md:flex-row md:items-center justify-between bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Domainler</h1>
          <p className="text-gray-600 dark:text-gray-300 mt-1">Domain listesi ve yönetimi</p>
        </div>
        <div className="flex items-center space-x-3 mt-4 md:mt-0">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`px-4 py-2 text-gray-700 dark:text-gray-300 rounded-md transition-colors flex items-center ${
              showFilters 
                ? 'bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300' 
                : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            <Filter size={18} className="mr-2" />
            Filtreler
          </button>
          <button
            onClick={exportDomains}
            className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors flex items-center"
          >
            <Download size={18} className="mr-2" />
            CSV İndir
          </button>
          <button
            onClick={() => navigate('/domains/add')}
            className="px-4 py-2 bg-indigo-500 text-white rounded-md hover:bg-indigo-600 transition-colors flex items-center"
          >
            <Plus size={18} className="mr-2" />
            Toplu Ekle
          </button>
        </div>
      </div>

      <div className="flex gap-6">
        <div className="flex-1">
          {showFilters && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <FormField
                  label="Arama"
                  name="search"
                  value={filters.search}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                  placeholder="Domain, path veya not ara..."
                />

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Liste Türü
                  </label>
                  <select
                    value={filters.type}
                    onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value as Filters['type'] }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="all">Tümü</option>
                    <option value="blacklist">Blacklist</option>
                    <option value="whitelist">Whitelist</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Kaynak
                  </label>
                  <select
                    value={filters.source}
                    onChange={(e) => setFilters(prev => ({ ...prev, source: e.target.value as Filters['source'] }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="all">Tümü</option>
                    <option value="manual">Manuel</option>
                    <option value="serp">SERP API</option>
                    <option value="whois">WHOIS API</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Sıralama
                  </label>
                  <select
                    value={filters.sortBy}
                    onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value as Filters['sortBy'] }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="newest">En Yeni</option>
                    <option value="oldest">En Eski</option>
                    <option value="domain">Domain (A-Z)</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            {domains.length === 0 ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400 flex flex-col items-center">
                <FileText size={48} className="mb-2 opacity-50" />
                <p>Henüz domain eklenmedi</p>
                <button
                  onClick={() => navigate('/domains/add')}
                  className="mt-4 px-4 py-2 bg-indigo-500 text-white rounded-md hover:bg-indigo-600 transition-colors flex items-center"
                >
                  <Plus size={18} className="mr-2" />
                  Domain Ekle
                </button>
              </div>
            ) : filteredDomains.length === 0 ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <p>Arama kriterlerine uygun domain bulunamadı</p>
              </div>
            ) : (
              <div className="space-y-2">
                {filteredDomains.map((domain) => (
                  <div
                    key={domain.id}
                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    <div>
                      <p className="text-gray-900 dark:text-white font-medium">
                        {domain.domain}
                        {domain.path && (
                          <span className="text-gray-500 dark:text-gray-400">
                            {domain.path}
                          </span>
                        )}
                      </p>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className={`text-xs px-2 py-1 rounded ${
                          domain.type === 'blacklist' 
                            ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                            : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        }`}>
                          {domain.type === 'blacklist' ? 'Blacklist' : 'Whitelist'}
                        </span>
                        <span className={`text-xs px-2 py-1 rounded ${
                          domain.source === 'serp'
                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                            : domain.source === 'whois'
                            ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
                            : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                        }`}>
                          {domain.source === 'serp' ? 'SERP' : domain.source === 'whois' ? 'WHOIS' : 'Manuel'}
                        </span>
                        {domain.note && (
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {domain.note}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleEdit(domain.id)}
                        className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(domain.id)}
                        className="p-2 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Yan Panel - Domain Ekleme */}
        <div className="w-80 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 h-fit">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Hızlı Domain Ekle</h2>
          
          <div className="space-y-4">
            <FormField
              label="Domain"
              name="domain"
              value={newDomain.domain}
              onChange={(e) => setNewDomain({ ...newDomain, domain: e.target.value })}
              placeholder="örn: example.com"
            />

            <FormField
              label="Path (Opsiyonel)"
              name="path"
              value={newDomain.path}
              onChange={(e) => setNewDomain({ ...newDomain, path: e.target.value })}
              placeholder="örn: /path/to/page"
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Liste Türü
              </label>
              <select
                value={newDomain.type}
                onChange={(e) => setNewDomain({ ...newDomain, type: e.target.value as 'blacklist' | 'whitelist' })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="blacklist">Blacklist</option>
                <option value="whitelist">Whitelist</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Not (Opsiyonel)
              </label>
              <textarea
                value={newDomain.note}
                onChange={(e) => setNewDomain({ ...newDomain, note: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Domain hakkında not..."
              />
            </div>

            <button
              onClick={handleAddDomain}
              disabled={!newDomain.domain.trim()}
              className="w-full px-4 py-2 bg-indigo-500 text-white rounded-md hover:bg-indigo-600 transition-colors flex items-center justify-center disabled:bg-indigo-300 dark:disabled:bg-indigo-700"
            >
              <Plus size={18} className="mr-2" />
              Domain Ekle
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DomainList;