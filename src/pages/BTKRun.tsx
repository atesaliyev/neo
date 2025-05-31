import { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Shield } from 'lucide-react';
import { useAntiCaptcha } from '../hooks/useAntiCaptcha';

interface ProcessStatus {
  domain: string;
  status: 'success' | 'error';
  message: string;
  timestamp: string;
}

const BTKRun = () => {
  const [processStatuses, setProcessStatuses] = useState<ProcessStatus[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [domains, setDomains] = useState<string[]>([]);
  const [apiKey, setApiKey] = useState('');

  useEffect(() => {
    const savedDomains = localStorage.getItem('domains');
    const savedApiKey = localStorage.getItem('antiCaptchaKey');

    if (savedDomains) {
      const domainList = JSON.parse(savedDomains);
      const blacklistedDomains = domainList
        .filter((d: any) => d.type === 'blacklist')
        .map((d: any) => d.domain);
      setDomains(blacklistedDomains);
    }
    if (savedApiKey) {
      setApiKey(savedApiKey);
    }
  }, []);

  const addLog = (domain: string, status: 'success' | 'error', message: string) => {
    setProcessStatuses(prev => [{
      domain,
      status,
      message,
      timestamp: new Date().toLocaleTimeString()
    }, ...prev]);
  };

  const processDomain = async (domain: string) => {
    try {
      // Form gönderimi simülasyonu
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Başarılı senaryo
      if (Math.random() > 0.2) { // %80 başarı oranı
        addLog(domain, 'success', 'Form başarıyla gönderildi');
      } else {
        throw new Error('Form gönderimi başarısız');
      }
    } catch (error) {
      addLog(domain, 'error', error instanceof Error ? error.message : 'Bilinmeyen hata');
    }
  };

  // Sayfa yüklendiğinde otomatik başlat
  useEffect(() => {
    if (domains.length > 0 && apiKey && !isRunning) {
      setIsRunning(true);
      domains.forEach(processDomain);
    }
  }, [domains, apiKey]);

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="space-y-4">
          {processStatuses.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <Shield size={48} className="mx-auto mb-4 opacity-50" />
              <p>Henüz log kaydı yok</p>
            </div>
          ) : (
            processStatuses.map((status, index) => (
              <div
                key={index}
                className={`flex items-center justify-between p-4 rounded-lg ${
                  status.status === 'success' ? 'bg-green-50 dark:bg-green-900/30' : 'bg-red-50 dark:bg-red-900/30'
                }`}
              >
                <div className="flex items-center">
                  {status.status === 'success' ? (
                    <CheckCircle size={20} className="text-green-500 mr-3" />
                  ) : (
                    <XCircle size={20} className="text-red-500 mr-3" />
                  )}
                  <div>
                    <div className="flex items-center space-x-2">
                      <p className="font-medium text-gray-900 dark:text-white">{status.domain}</p>
                      <span className="text-sm text-gray-500 dark:text-gray-400">{status.timestamp}</span>
                    </div>
                    <p className={`text-sm ${
                      status.status === 'success' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                    }`}>
                      {status.message}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default BTKRun;