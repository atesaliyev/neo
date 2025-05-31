import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Save, ArrowLeft } from 'lucide-react';
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

const DomainEdit = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [domain, setDomain] = useState<Domain | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const savedDomains = localStorage.getItem('domains');
    const domains = savedDomains ? JSON.parse(savedDomains) : [];
    const foundDomain = domains.find((d: Domain) => d.id === id);
    
    if (foundDomain) {
      setDomain(foundDomain);
    } else {
      navigate('/domains');
    }
    
    setIsLoading(false);
  }, [id, navigate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!domain) return;

    const savedDomains = localStorage.getItem('domains');
    const domains = savedDomains ? JSON.parse(savedDomains) : [];
    const updatedDomains = domains.map((d: Domain) => 
      d.id === domain.id ? domain : d
    );
    
    localStorage.setItem('domains', JSON.stringify(updatedDomains));
    navigate('/domains');
  };

  if (isLoading || !domain) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex flex-col md:flex-row md:items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Domain Düzenle</h1>
          <p className="text-gray-600 dark:text-gray-300 mt-1">Domain bilgilerini güncelle</p>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <FormField
            label="Domain"
            name="domain"
            value={domain.domain}
            onChange={(e) => setDomain({ ...domain, domain: e.target.value })}
            placeholder="örn: example.com"
          />

          <FormField
            label="Path (Opsiyonel)"
            name="path"
            value={domain.path || ''}
            onChange={(e) => setDomain({ ...domain, path: e.target.value })}
            placeholder="örn: /path/to/page"
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Liste Türü
            </label>
            <select
              value={domain.type}
              onChange={(e) => setDomain({ ...domain, type: e.target.value as 'blacklist' | 'whitelist' })}
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
              value={domain.note || ''}
              onChange={(e) => setDomain({ ...domain, note: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="Domain hakkında not..."
            />
          </div>

          <div className="flex space-x-4 pt-4">
            <button
              type="button"
              onClick={() => navigate('/domains')}
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center justify-center"
            >
              <ArrowLeft size={18} className="mr-2" />
              Geri Dön
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-indigo-500 text-white rounded-md hover:bg-indigo-600 transition-colors flex items-center justify-center"
            >
              <Save size={18} className="mr-2" />
              Kaydet
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DomainEdit;