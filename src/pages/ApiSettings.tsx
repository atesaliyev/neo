import { useState, useEffect } from 'react';
import { Save, RefreshCw, AlertTriangle } from 'lucide-react';
import FormField from '../components/form/FormField';

interface BTKText {
  id: string;
  text: string;
}

interface BTKUserAgent {
  id: string;
  userAgent: string;
}

const ApiSettings = () => {
  const [apiKeys, setApiKeys] = useState({
    serpApi: localStorage.getItem('serpApiKey') || '',
    whoisApi: localStorage.getItem('whoisApiKey') || '',
    antiCaptcha: localStorage.getItem('antiCaptchaKey') || ''
  });

  const [btkSettings, setBtkSettings] = useState({
    texts: JSON.parse(localStorage.getItem('btkTexts') || '[]') as BTKText[],
    userAgents: JSON.parse(localStorage.getItem('btkUserAgents') || '[]') as BTKUserAgent[],
    proxyList: localStorage.getItem('proxyList') || ''
  });

  const [newText, setNewText] = useState('');
  const [newUserAgent, setNewUserAgent] = useState('');
  const [status, setStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    localStorage.setItem('btkTexts', JSON.stringify(btkSettings.texts));
    localStorage.setItem('btkUserAgents', JSON.stringify(btkSettings.userAgents));
    localStorage.setItem('proxyList', btkSettings.proxyList);
  }, [btkSettings]);

  const validateProxyList = (proxyList: string): boolean => {
    const lines = proxyList.split('\n').map(line => line.trim()).filter(line => line);
    for (const line of lines) {
      // Match either "host:port" or "protocol host:port"
      const proxyPattern = /^(?:(?:https?:\/\/)?[\w.-]+:\d+|https?\s+[\w.-]+:\d+)$/;
      if (!proxyPattern.test(line)) {
        setErrorMessage(`Geçersiz proxy formatı: ${line}`);
        return false;
      }
    }
    return true;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setApiKeys(prev => ({ ...prev, [name]: value }));
  };

  const handleProxyListChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setBtkSettings(prev => ({ ...prev, proxyList: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('saving');
    setErrorMessage('');
    
    try {
      if (!validateProxyList(btkSettings.proxyList)) {
        setStatus('error');
        return;
      }

      // API anahtarlarını localStorage'a kaydet
      localStorage.setItem('serpApiKey', apiKeys.serpApi);
      localStorage.setItem('whoisApiKey', apiKeys.whoisApi);
      localStorage.setItem('antiCaptchaKey', apiKeys.antiCaptcha);
      
      // Simüle edilmiş kaydetme işlemi
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setStatus('success');
      setTimeout(() => setStatus('idle'), 2000);
    } catch (error) {
      setStatus('error');
      setErrorMessage('Ayarlar kaydedilirken bir hata oluştu');
    }
  };

  const addText = () => {
    if (!newText.trim()) return;
    setBtkSettings(prev => ({
      ...prev,
      texts: [...prev.texts, { id: Math.random().toString(), text: newText }]
    }));
    setNewText('');
  };

  const removeText = (id: string) => {
    setBtkSettings(prev => ({
      ...prev,
      texts: prev.texts.filter(t => t.id !== id)
    }));
  };

  const addUserAgent = () => {
    if (!newUserAgent.trim()) return;
    setBtkSettings(prev => ({
      ...prev,
      userAgents: [...prev.userAgents, { id: Math.random().toString(), userAgent: newUserAgent }]
    }));
    setNewUserAgent('');
  };

  const removeUserAgent = (id: string) => {
    setBtkSettings(prev => ({
      ...prev,
      userAgents: prev.userAgents.filter(ua => ua.id !== id)
    }));
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex flex-col md:flex-row md:items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">API Ayarları</h1>
          <p className="text-gray-600 dark:text-gray-300 mt-1">API anahtarlarını ve BTK ayarlarını yönetin</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* API Anahtarları */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-6">API Anahtarları</h2>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <FormField
              label="SERP API Anahtarı"
              name="serpApi"
              value={apiKeys.serpApi}
              onChange={handleChange}
              placeholder="SERP API anahtarınızı girin"
            />
            
            <FormField
              label="WHOIS API Anahtarı"
              name="whoisApi"
              value={apiKeys.whoisApi}
              onChange={handleChange}
              placeholder="WHOIS API anahtarınızı girin"
            />

            <FormField
              label="Anti-Captcha API Anahtarı"
              name="antiCaptcha"
              value={apiKeys.antiCaptcha}
              onChange={handleChange}
              placeholder="Anti-Captcha API anahtarınızı girin"
            />
            
            <div className="flex items-center space-x-4">
              <button
                type="submit"
                disabled={status === 'saving'}
                className={`
                  px-4 py-2 rounded-md text-white font-medium flex items-center
                  ${status === 'saving' 
                    ? 'bg-indigo-400 cursor-not-allowed' 
                    : 'bg-indigo-500 hover:bg-indigo-600'}
                `}
              >
                {status === 'saving' ? (
                  <>
                    <RefreshCw size={18} className="mr-2 animate-spin" />
                    Kaydediliyor...
                  </>
                ) : (
                  <>
                    <Save size={18} className="mr-2" />
                    Ayarları Kaydet
                  </>
                )}
              </button>
              
              {status === 'success' && (
                <span className="text-green-500 dark:text-green-400">
                  Ayarlar başarıyla kaydedildi!
                </span>
              )}

              {status === 'error' && (
                <span className="text-red-500 dark:text-red-400 flex items-center">
                  <AlertTriangle size={18} className="mr-2" />
                  {errorMessage}
                </span>
              )}
            </div>
          </form>
        </div>

        {/* BTK Ayarları */}
        <div className="space-y-6">
          {/* Form Metinleri */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-6">BTK Form Metinleri</h2>
            
            <div className="space-y-4">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={newText}
                  onChange={(e) => setNewText(e.target.value)}
                  placeholder="Yeni metin girin"
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                />
                <button
                  onClick={addText}
                  disabled={!newText.trim()}
                  className="px-4 py-2 bg-indigo-500 text-white rounded-md hover:bg-indigo-600 disabled:bg-indigo-300"
                >
                  Ekle
                </button>
              </div>

              <div className="space-y-2">
                {btkSettings.texts.map((text) => (
                  <div key={text.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-md">
                    <span className="text-gray-700 dark:text-gray-300">{text.text}</span>
                    <button
                      onClick={() => removeText(text.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      Sil
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Proxy Listesi */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-6">Proxy Listesi</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Her satıra bir proxy yazın (örn: host:port veya http host:port)
                </label>
                <textarea
                  value={btkSettings.proxyList}
                  onChange={handleProxyListChange}
                  rows={8}
                  placeholder="Örnek:
4.175.200.138:8080
http 154.90.48.76:80
58.246.58.150:9002"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md font-mono text-sm dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>
          </div>

          {/* User Agent'lar */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-6">User Agent Ayarları</h2>
            
            <div className="space-y-4">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={newUserAgent}
                  onChange={(e) => setNewUserAgent(e.target.value)}
                  placeholder="Yeni User Agent girin"
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                />
                <button
                  onClick={addUserAgent}
                  disabled={!newUserAgent.trim()}
                  className="px-4 py-2 bg-indigo-500 text-white rounded-md hover:bg-indigo-600 disabled:bg-indigo-300"
                >
                  Ekle
                </button>
              </div>

              <div className="space-y-2">
                {btkSettings.userAgents.map((ua) => (
                  <div key={ua.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-md">
                    <span className="text-gray-700 dark:text-gray-300 font-mono text-sm">{ua.userAgent}</span>
                    <button
                      onClick={() => removeUserAgent(ua.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      Sil
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApiSettings;