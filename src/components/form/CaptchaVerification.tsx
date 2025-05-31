import { useState } from 'react';
import { RefreshCw } from 'lucide-react';

const CaptchaVerification = () => {
  const [captchaLoading, setCaptchaLoading] = useState(false);
  
  const refreshCaptcha = () => {
    setCaptchaLoading(true);
    // Simulate loading
    setTimeout(() => {
      setCaptchaLoading(false);
    }, 1000);
  };

  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-md p-4 bg-gray-50 dark:bg-gray-800/50">
      <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Captcha Preview</p>
      
      <div className="bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md p-4 mb-4 h-32 flex items-center justify-center">
        {captchaLoading ? (
          <div className="animate-pulse flex flex-col items-center">
            <div className="h-8 w-32 bg-gray-200 dark:bg-gray-600 rounded mb-2"></div>
            <div className="h-4 w-24 bg-gray-200 dark:bg-gray-600 rounded"></div>
          </div>
        ) : (
          <div className="text-center">
            <p className="text-gray-500 dark:text-gray-400 text-sm mb-2">Captcha will appear here</p>
            <p className="text-xs text-gray-400 dark:text-gray-500">
              Captchas from the target site will be processed automatically
            </p>
          </div>
        )}
      </div>
      
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            AntiCaptcha will solve this automatically
          </p>
        </div>
        <button
          type="button"
          onClick={refreshCaptcha}
          className="text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 text-sm font-medium flex items-center"
        >
          <RefreshCw size={14} className="mr-1" />
          Refresh
        </button>
      </div>
    </div>
  );
};

export default CaptchaVerification;