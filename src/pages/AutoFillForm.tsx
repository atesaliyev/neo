import { useState } from 'react';
import { Send, AlertCircle, CheckCircle, XCircle, Loader, Search, Globe } from 'lucide-react';
import FormSection from '../components/form/FormSection';
import FormField from '../components/form/FormField';
import CaptchaVerification from '../components/form/CaptchaVerification';
import { useAntiCaptcha } from '../hooks/useAntiCaptcha';

const AutoFillForm = () => {
  const [formData, setFormData] = useState({
    url: 'https://www.ihbarweb.org.tr/ihbar.php?subject=7',
    domain: '',
    description: '',
    apiKey: '',
    verificationRequired: true,
    // Yeni alanlar
    keyword: '',
    serpApiKey: '',
    whoisApiKey: ''
  });
  
  const { status, error, solve, submitForm } = useAntiCaptcha({
    apiKey: formData.apiKey,
    websiteURL: formData.url
  });

  const [formState, setFormState] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [apiResults, setApiResults] = useState<{
    serp?: { rank: number; url: string }[];
    whois?: { registrar: string; creationDate: string };
  }>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleApiSearch = async () => {
    if (!formData.keyword) {
      setErrorMessage('Keyword is required for API search');
      return;
    }

    setFormState('processing');
    setErrorMessage('');

    try {
      // SERP API araması simülasyonu
      const serpResults = [
        { rank: 1, url: `https://example1.com/${formData.keyword}` },
        { rank: 2, url: `https://example2.com/${formData.keyword}` }
      ];

      // WHOIS API araması simülasyonu
      const whoisResult = {
        registrar: "Example Registrar",
        creationDate: "2023-01-01"
      };

      setApiResults({
        serp: serpResults,
        whois: whoisResult
      });

      setFormState('idle');
    } catch (err) {
      setFormState('error');
      setErrorMessage(err instanceof Error ? err.message : 'API search failed');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.domain) {
      setErrorMessage('Domain is required');
      return;
    }
    
    if (!formData.apiKey) {
      setErrorMessage('AntiCaptcha API key is required');
      return;
    }
    
    setFormState('processing');
    setErrorMessage('');
    
    try {
      // First solve the captcha
      const captchaSolution = await solve('imageCaptcha', {
        websiteURL: formData.url
      });

      if (!captchaSolution) {
        throw new Error('Failed to solve captcha');
      }

      // Then submit the form
      const result = await submitForm({
        ihbar: '7',
        adres: formData.domain,
        detay: formData.description || `Reporting phishing domain: ${formData.domain}`,
        tar: new Date().toISOString().split('T')[0],
        suc: '2',
        ad: '',
        soyad: '',
        tckimlik: '',
        email: '',
        tel: '',
        security_code: captchaSolution
      });

      if (result.success) {
        setFormState('success');
      } else {
        throw new Error(result.message);
      }
    } catch (err) {
      setFormState('error');
      setErrorMessage(err instanceof Error ? err.message : 'An unknown error occurred');
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex flex-col md:flex-row md:items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Auto Fill Form</h1>
          <p className="text-gray-600 dark:text-gray-300 mt-1">Configure and run automated form filling with AntiCaptcha</p>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        {formState === 'success' ? (
          <div className="flex flex-col items-center justify-center py-8">
            <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center mb-4">
              <CheckCircle size={32} className="text-green-500 dark:text-green-400" />
            </div>
            <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-2">Form Successfully Processed</h2>
            <p className="text-gray-600 dark:text-gray-300 text-center max-w-md mb-6">
              The form for domain {formData.domain} has been successfully submitted.
            </p>
            <button 
              onClick={() => setFormState('idle')}
              className="px-4 py-2 bg-indigo-500 text-white rounded-md hover:bg-indigo-600 transition-colors"
            >
              Process Another Form
            </button>
          </div>
        ) : formState === 'error' ? (
          <div className="flex flex-col items-center justify-center py-8">
            <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900 flex items-center justify-center mb-4">
              <XCircle size={32} className="text-red-500 dark:text-red-400" />
            </div>
            <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-2">Form Processing Failed</h2>
            <p className="text-gray-600 dark:text-gray-300 text-center max-w-md mb-2">
              {errorMessage || "There was an error processing your request."}
            </p>
            <p className="text-gray-500 dark:text-gray-400 text-center max-w-md mb-6">
              Please check your settings and try again.
            </p>
            <button 
              onClick={() => setFormState('idle')}
              className="px-4 py-2 bg-indigo-500 text-white rounded-md hover:bg-indigo-600 transition-colors"
            >
              Try Again
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            {errorMessage && (
              <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-md flex items-start">
                <AlertCircle size={20} className="text-red-500 dark:text-red-400 mt-0.5 mr-3 flex-shrink-0" />
                <p className="text-red-700 dark:text-red-300 text-sm">{errorMessage}</p>
              </div>
            )}

            <FormSection title="API Search" description="Search domain information using SERP and WHOIS APIs">
              <div className="space-y-4">
                <FormField
                  label="Keyword"
                  name="keyword"
                  value={formData.keyword}
                  onChange={handleChange}
                  placeholder="Enter keyword to search"
                />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    label="SERP API Key"
                    name="serpApiKey"
                    value={formData.serpApiKey}
                    onChange={handleChange}
                    placeholder="Enter SERP API key"
                  />
                  
                  <FormField
                    label="WHOIS API Key"
                    name="whoisApiKey"
                    value={formData.whoisApiKey}
                    onChange={handleChange}
                    placeholder="Enter WHOIS API key"
                  />
                </div>

                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={handleApiSearch}
                    disabled={formState === 'processing'}
                    className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors flex items-center"
                  >
                    <Search size={18} className="mr-2" />
                    Search APIs
                  </button>
                </div>

                {apiResults.serp && (
                  <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-md">
                    <h3 className="text-sm font-semibold mb-2 flex items-center">
                      <Globe size={16} className="mr-2" />
                      Search Results
                    </h3>
                    <div className="space-y-2">
                      {apiResults.serp.map((result, index) => (
                        <div key={index} className="text-sm">
                          <span className="font-medium">#{result.rank}</span>
                          <a href={result.url} target="_blank" rel="noopener noreferrer" 
                             className="ml-2 text-indigo-600 dark:text-indigo-400 hover:underline">
                            {result.url}
                          </a>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {apiResults.whois && (
                  <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-md">
                    <h3 className="text-sm font-semibold mb-2">WHOIS Information</h3>
                    <div className="text-sm space-y-1">
                      <p>Registrar: {apiResults.whois.registrar}</p>
                      <p>Creation Date: {apiResults.whois.creationDate}</p>
                    </div>
                  </div>
                )}
              </div>
            </FormSection>
            
            <FormSection title="Target Details" description="Enter the domain and details for the form submission">
              <FormField
                label="Target Domain"
                name="domain"
                value={formData.domain}
                onChange={handleChange}
                placeholder="example.com"
                required
              />
              
              <FormField
                label="Description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Additional details about the report"
              />
            </FormSection>
            
            <FormSection title="AntiCaptcha Configuration" description="Set up your AntiCaptcha API credentials">
              <FormField
                label="AntiCaptcha API Key"
                name="apiKey"
                value={formData.apiKey}
                onChange={handleChange}
                placeholder="Enter your AntiCaptcha API key"
                required
              />
              
              <CaptchaVerification />
            </FormSection>
            
            <div className="mt-8 flex justify-end">
              <button
                type="submit"
                disabled={formState === 'processing'}
                className={`
                  flex items-center px-6 py-3 rounded-md text-white font-medium 
                  ${formState === 'processing' 
                    ? 'bg-indigo-400 dark:bg-indigo-600 cursor-not-allowed' 
                    : 'bg-indigo-500 hover:bg-indigo-600 dark:bg-indigo-600 dark:hover:bg-indigo-700'}
                  transition-colors shadow-sm
                `}
              >
                {formState === 'processing' ? (
                  <>
                    <Loader size={18} className="animate-spin mr-2" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Send size={18} className="mr-2" />
                    Submit Form
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default AutoFillForm;