import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Save, Loader } from 'lucide-react';
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

interface LogEntry {
  timestamp: string;
  type: 'info' | 'error' | 'success';
  message: string;
}

const DomainAdd = () => {
  const navigate = useNavigate();
  const [newDomain, setNewDomain] = useState({
    domain: '',
    path: '',
    type: 'blacklist' as const,
    note: ''
  });
  const [serpLoading, setSerpLoading] = useState(false);
  const [whoisLoading, setWhoisLoading] = useState(false);
  const [logs, setLogs] = useState<LogEntry[]>([]);

  const addLog = (type: 'info' | 'error' | 'success', message: string) => {
    setLogs(prev => [{
      timestamp: new Date().toISOString(),
      type,
      message
    }, ...prev]);
  };

  const saveDomains = (newDomains: Domain[]) => {
    const savedDomains = localStorage.getItem('domains');
    const existingDomains = savedDomains ? JSON.parse(savedDomains) : [];
    
    // Filter out duplicates based on domain + path combination
    const uniqueDomains = newDomains.filter(newDomain => {
      return !existingDomains.some((existingDomain: Domain) => 
        existingDomain.domain === newDomain.domain && 
        existingDomain.path === newDomain.path
      );
    });

    if (uniqueDomains.length > 0) {
      const updatedDomains = [...existingDomains, ...uniqueDomains];
      localStorage.setItem('domains', JSON.stringify(updatedDomains));
      addLog('success', `${uniqueDomains.length} yeni domain eklendi`);
    } else {
      addLog('info', 'Yeni domain bulunamadı veya hepsi zaten mevcut');
    }
  };

  const handleManualAdd = () => {
    if (!newDomain.domain.trim()) return;

    const domain: Domain = {
      id: Math.random().toString(36).substr(2, 9),
      ...newDomain,
      createdAt: new Date().toISOString(),
      source: 'manual'
    };

    saveDomains([domain]);
    addLog('success', `Manuel domain eklendi: ${domain.domain}${domain.path || ''}`);
    navigate('/domains');
  };

  const handleSerpApiScan = async () => {
    setSerpLoading(true);
    addLog('info', 'SERP API taraması başlatıldı');

    try {
      const keywords = localStorage.getItem('keywords')?.split('\n').filter(k => k.trim()) || [];
      if (keywords.length === 0) {
        throw new Error('Lütfen önce anahtar kelime ekleyin.');
      }

      const serpApiKey = localStorage.getItem('serpApiKey');
      if (!serpApiKey) {
        throw new Error('SERP API anahtarı eksik. Lütfen API Ayarları sayfasından ekleyin.');
      }

      addLog('info', `${keywords.length} anahtar kelime taranacak`);
      const foundUrls = new Map<string, Set<string>>();

      for (const keyword of keywords) {
        addLog('info', `"${keyword}" için SERP API sorgusu yapılıyor...`);
        
        try {
          const params = new URLSearchParams({
            api_key: serpApiKey,
            q: keyword,
            num: '100',
            gl: 'tr',
            hl: 'tr'
          });

          const response = await fetch(`/api/serp?${params}`);
          
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }

          const data = await response.json();

          if (data.error) {
            throw new Error(data.error);
          }

          // Process URLs from organic and paid results
          const processUrl = (url: string) => {
            try {
              const urlObj = new URL(url);
              const domain = urlObj.hostname.replace('www.', '');
              const path = urlObj.pathname !== '/' ? urlObj.pathname : '';
              
              if (!foundUrls.has(domain)) {
                foundUrls.set(domain, new Set());
              }
              if (path) {
                foundUrls.get(domain)?.add(path);
              }
            } catch (e) {
              console.error('URL parse error:', e);
            }
          };

          // Process organic results
          if (data.organic_results) {
            data.organic_results.forEach((result: any) => {
              processUrl(result.link);
            });
          }

          // Process paid results
          if (data.paid_results) {
            data.paid_results.forEach((ad: any) => {
              processUrl(ad.link);
            });
          }

          addLog('success', `"${keyword}" için sonuçlar işlendi`);
          
          // API rate limiting için kısa bekleme
          await new Promise(resolve => setTimeout(resolve, 2000));

        } catch (error) {
          addLog('error', `"${keyword}" taranırken hata: ${error instanceof Error ? error.message : 'Bilinmeyen hata'}`);
          continue;
        }
      }

      // Convert found URLs to domains
      const newDomains: Domain[] = [];
      foundUrls.forEach((paths, domain) => {
        if (paths.size === 0) {
          // Domain'in kendisi
          newDomains.push({
            id: Math.random().toString(36).substr(2, 9),
            domain,
            type: 'blacklist',
            createdAt: new Date().toISOString(),
            source: 'serp'
          });
        } else {
          // Domain + path kombinasyonları
          paths.forEach(path => {
            newDomains.push({
              id: Math.random().toString(36).substr(2, 9),
              domain,
              path,
              type: 'blacklist',
              createdAt: new Date().toISOString(),
              source: 'serp'
            });
          });
        }
      });

      saveDomains(newDomains);
      navigate('/domains');

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'SERP API taraması sırasında bir hata oluştu';
      addLog('error', errorMessage);
    } finally {
      setSerpLoading(false);
    }
  };

  const handleWhoisApiScan = async () => {
    setWhoisLoading(true);
    addLog('info', 'WHOIS API taraması başlatıldı');

    try {
      const keywords = localStorage.getItem('keywords')?.split('\n').filter(k => k.trim()) || [];
      if (keywords.length === 0) {
        throw new Error('Lütfen önce anahtar kelime ekleyin.');
      }

      const whoisApiKey = localStorage.getItem('whoisApiKey');
      if (!whoisApiKey) {
        throw new Error('WHOIS API anahtarı eksik. Lütfen API Ayarları sayfasından ekleyin.');
      }

      addLog('info', `${keywords.length} anahtar kelime için WHOIS sorgusu yapılacak`);

      const whoisDomains = new Set<string>();
      for (const keyword of keywords) {
        addLog('info', `"${keyword}" için WHOIS sorgusu yapılıyor...`);

        try {
          const response = await fetch('/api/whois', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              apiKey: whoisApiKey,
              searchType: 'current',
              mode: 'purchase',
              basicSearchTerms: {
                include: [keyword]
              }
            })
          });

          if (!response.ok) {
            throw new Error(`WHOIS API isteği başarısız: ${response.statusText}`);
          }

          const data = await response.json();
          
          if (data.domainsList && data.domainsList.length > 0) {
            data.domainsList.forEach((domain: string) => whoisDomains.add(domain));
            addLog('success', `"${keyword}" için ${data.domainsList.length} domain bulundu`);
          } else {
            addLog('info', `"${keyword}" için domain bulunamadı`);
          }

          // API rate limiting için kısa bekleme
          await new Promise(resolve => setTimeout(resolve, 1000));

        } catch (error) {
          addLog('error', `"${keyword}" için WHOIS sorgusu başarısız: ${error instanceof Error ? error.message : 'Bilinmeyen hata'}`);
          continue;
        }
      }

      const newDomains = Array.from(whoisDomains).map(domain => ({
        id: Math.random().toString(36).substr(2, 9),
        domain,
        type: 'blacklist' as const,
        createdAt: new Date().toISOString(),
        source: 'whois' as const
      }));

      saveDomains(newDomains);
      navigate('/domains');

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'WHOIS API taraması sırasında bir hata oluştu';
      addLog('error', errorMessage);
    } finally {
      setWhoisLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex flex-col md:flex-row md:items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Domain Ekle</h1>
          <p className="text-gray-600 dark:text-gray-300 mt-1">Manuel veya API ile domain ekleme</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Manuel Domain Ekleme */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
            Manuel Domain Ekle
          </h2>
          
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

            <div className="flex space-x-4">
              <button
                onClick={() => navigate('/domains')}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                İptal
              </button>
              <button
                onClick={handleManualAdd}
                disabled={!newDomain.domain.trim()}
                className="flex-1 px-4 py-2 bg-indigo-500 text-white rounded-md hover:bg-indigo-600 transition-colors flex items-center justify-center disabled:bg-indigo-300 dark:disabled:bg-indigo-700"
              >
                <Plus size={18} className="mr-2" />
                Domain Ekle
              </button>
            </div>
          </div>
        </div>

        {/* API ile Tarama */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
            API ile Domain Tara
          </h2>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={handleSerpApiScan}
                disabled={serpLoading}
                className="w-full px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors flex items-center justify-center disabled:bg-green-300 dark:disabled:bg-green-700"
              >
                {serpLoading ? (
                  <>
                    <Loader size={18} className="mr-2 animate-spin" />
                    SERP Taranıyor...
                  </>
                ) : (
                  <>
                    <Search size={18} className="mr-2" />
                    SERP API ile Tara
                  </>
                )}
              </button>

              <button
                onClick={handleWhoisApiScan}
                disabled={whoisLoading}
                className="w-full px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors flex items-center justify-center disabled:bg-blue-300 dark:disabled:bg-blue-700"
              >
                {whoisLoading ? (
                  <>
                    <Loader size={18} className="mr-2 animate-spin" />
                    WHOIS Taranıyor...
                  </>
                ) : (
                  <>
                    <Search size={18} className="mr-2" />
                    WHOIS API ile Tara
                  </>
                )}
              </button>
            </div>

            {/* Log Görüntüleyici */}
            <div className="mt-4">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                İşlem Logları
              </h3>
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-md p-2 h-32 overflow-y-auto">
                {logs.length === 0 ? (
                  <div className="text-center text-gray-500 dark:text-gray-400 py-4">
                    Henüz log kaydı yok
                  </div>
                ) : (
                  <div className="space-y-1">
                    {logs.map((log, index) => (
                      <div
                        key={index}
                        className={`text-xs py-1 px-2 rounded ${
                          log.type === 'error'
                            ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                            : log.type === 'success'
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                            : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
                        }`}
                      >
                        <span className="font-medium">
                          {new Date(log.timestamp).toLocaleTimeString()}: 
                        </span>{' '}
                        {log.message}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DomainAdd;