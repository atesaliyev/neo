import { useState } from 'react';
import { Plus, Search, Save, Trash2, FileText, Loader, AlertCircle } from 'lucide-react';
import FormField from '../components/form/FormField';

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

const Domains = () => {
  const [domains, setDomains] = useState<Domain[]>([]);
  const [newDomain, setNewDomain] = useState({
    domain: '',
    path: '',
    type: 'blacklist' as const,
    note: ''
  });
  const [isLoading, setIsLoading] = useState(false);
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

  const handleManualAdd = () => {
    if (!newDomain.domain.trim()) return;

    const domain: Domain = {
      id: Math.random().toString(36).substr(2, 9),
      ...newDomain,
      createdAt: new Date().toISOString(),
      source: 'manual'
    };

    setDomains(prev => [...prev, domain]);
    setNewDomain({ domain: '', path: '', type: 'blacklist', note: '' });
    addLog('success', `Manuel domain eklendi: ${domain.domain}${domain.path || ''}`);
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

          // Organik ve reklam sonuçlarından URL'leri çıkar
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

          // Organik sonuçları işle
          if (data.organic_results) {
            data.organic_results.forEach((result: any) => {
              processUrl(result.link);
            });
          }

          // Reklam sonuçlarını işle
          if (data.paid_results) {
            data.paid_results.forEach((ad: any) => {
              processUrl(ad.link);
            });
          }

          addLog('success', `"${keyword}" için ${foundUrls.size} domain bulundu`);
          
          // API rate limiting için kısa bekleme
          await new Promise(resolve => setTimeout(resolve, 2000));

        } catch (error) {
          addLog('error', `"${keyword}" taranırken hata: ${error instanceof Error ? error.message : 'Bilinmeyen hata'}`);
          continue;
        }
      }

      // Yeni domainleri ekle
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

      setDomains(prev => {
        const existingDomains = new Set(prev.map(d => `${d.domain}${d.path || ''}`));
        const filteredDomains = newDomains.filter(d => !existingDomains.has(`${d.domain}${d.path || ''}`));
        addLog('success', `${filteredDomains.length} yeni domain/path eklendi`);
        return [...prev, ...filteredDomains];
      });

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

      const whoisDomains = [];
      for (const keyword of keywords) {
        addLog('info', `"${keyword}" için WHOIS sorgusu yapılıyor...`);

        const response = await fetch('https://reverse-whois.whoisxmlapi.com/api/v2', {
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
          whoisDomains.push(...data.domainsList);
          addLog('success', `"${keyword}" için ${data.domainsList.length} domain bulundu`);
        } else {
          addLog('info', `"${keyword}" için domain bulunamadı`);
        }
      }

      // Add new domains
      const uniqueDomains = [...new Set(whoisDomains)];
      addLog('success', `Toplam ${uniqueDomains.length} benzersiz domain bulundu`);

      const newDomains = uniqueDomains.map(domain => ({
        id: Math.random().toString(36).substr(2, 9),
        domain,
        type: 'blacklist' as const,
        createdAt: new Date().toISOString(),
        source: 'whois' as const
      }));

      setDomains(prev => {
        const existingDomains = new Set(prev.map(d => d.domain));
        const filteredDomains = newDomains.filter(d => !existingDomains.has(d.domain));
        addLog('success', `${filteredDomains.length} yeni domain eklendi`);
        return [...prev, ...filteredDomains];
      });

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'WHOIS API taraması sırasında bir hata oluştu';
      addLog('error', errorMessage);
    } finally {
      setWhoisLoading(false);
    }
  };

  const handleDelete = (id: string) => {
    setDomains(prev => {
      const domain = prev.find(d => d.id === id);
      if (domain) {
        addLog('info', `Domain silindi: ${domain.domain}${domain.path || ''}`);
      }
      return prev.filter(d => d.id !== id);
    });
  };

  const handleSaveAll = async () => {
    setIsLoading(true);
    addLog('info', 'Domainler kaydediliyor...');
    
    try {
      // Simüle edilmiş kaydetme işlemi
      await new Promise(resolve => setTimeout(resolve, 1000));
      addLog('success', `${domains.length} domain başarıyla kaydedildi`);
    } catch (err) {
      addLog('error', 'Domainler kaydedilirken bir hata oluştu');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex flex-col md:flex-row md:items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Domain Yönetimi</h1>
          <p className="text-gray-600 dark:text-gray-300 mt-1">Domain ekleme ve yönetimi</p>
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

            <button
              onClick={handleManualAdd}
              disabled={!newDomain.domain.trim()}
              className="w-full px-4 py-2 bg-indigo-500 text-white rounded-md hover:bg-indigo-600 transition-colors flex items-center justify-center disabled:bg-indigo-300 dark:disabled:bg-indigo-700"
            >
              <Plus size={18} className="mr-2" />
              Domain Ekle
            </button>
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

          {/* Domain Listesi */}
          <div className="mt-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                Eklenen Domainler
              </h3>
              <button
                onClick={handleSaveAll}
                disabled={domains.length === 0 || isLoading}
                className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors flex items-center disabled:bg-green-300 dark:disabled:bg-green-700"
              >
                <Save size={18} className="mr-2" />
                {isLoading ? 'Kaydediliyor...' : 'Tümünü Kaydet'}
              </button>
            </div>

            <div className="overflow-y-auto max-h-[400px]">
              {domains.length === 0 ? (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400 flex flex-col items-center">
                  <FileText size={48} className="mb-2 opacity-50" />
                  <p>Henüz domain eklenmedi</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {domains.map((domain) => (
                    <div
                      key={domain.id}
                      className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-md"
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
                      <button
                        onClick={() => handleDelete(domain.id)}
                        className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Domains;