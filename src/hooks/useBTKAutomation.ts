import { useState } from 'react';
import axios from 'axios';

interface AutomationStatus {
  isRunning: boolean;
  totalProcessed: number;
  successCount: number;
  errorCount: number;
  startTime?: Date;
  currentDomain?: string;
}

interface ProcessLog {
  domain: string;
  status: 'success' | 'error';
  message: string;
  timestamp: string;
  duration: number;
}

interface AutomationSettings {
  delay: number;
  retryCount: number;
  parallelCount: number;
}

export const useBTKAutomation = () => {
  const [status, setStatus] = useState<AutomationStatus>({
    isRunning: false,
    totalProcessed: 0,
    successCount: 0,
    errorCount: 0
  });

  const [logs, setLogs] = useState<ProcessLog[]>([]);
  const [settings, setSettings] = useState<AutomationSettings>({
    delay: 2000,
    retryCount: 3,
    parallelCount: 1
  });

  const addLog = (log: ProcessLog) => {
    setLogs(prev => [log, ...prev]);
    const savedLogs = localStorage.getItem('btkLogs');
    const existingLogs = savedLogs ? JSON.parse(savedLogs) : [];
    localStorage.setItem('btkLogs', JSON.stringify([log, ...existingLogs]));
  };

  const processQueue = async (domains: string[], antiCaptchaKey: string) => {
    const queue = [...domains];
    const processing = new Set<string>();

    while (queue.length > 0 || processing.size > 0) {
      if (!status.isRunning) break;

      while (processing.size < settings.parallelCount && queue.length > 0) {
        const domain = queue.shift();
        if (domain) {
          processing.add(domain);
          setStatus(prev => ({ ...prev, currentDomain: domain }));

          const startTime = new Date();
          try {
            const response = await axios.post(
              `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/api-proxy/btk`,
              {
                domain,
                antiCaptchaKey,
                retryCount: settings.retryCount
              },
              {
                headers: {
                  'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
                  'Content-Type': 'application/json'
                }
              }
            );

            const endTime = new Date();
            const duration = endTime.getTime() - startTime.getTime();

            if (response.data.success) {
              setStatus(prev => ({
                ...prev,
                successCount: prev.successCount + 1,
                totalProcessed: prev.totalProcessed + 1
              }));

              addLog({
                domain,
                status: 'success',
                message: response.data.message,
                timestamp: endTime.toLocaleTimeString(),
                duration
              });
            } else {
              setStatus(prev => ({
                ...prev,
                errorCount: prev.errorCount + 1,
                totalProcessed: prev.totalProcessed + 1
              }));

              addLog({
                domain,
                status: 'error',
                message: response.data.message,
                timestamp: endTime.toLocaleTimeString(),
                duration
              });
            }
          } catch (error) {
            const endTime = new Date();
            const duration = endTime.getTime() - startTime.getTime();
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';

            setStatus(prev => ({
              ...prev,
              errorCount: prev.errorCount + 1,
              totalProcessed: prev.totalProcessed + 1
            }));

            addLog({
              domain,
              status: 'error',
              message: `API Error: ${errorMessage}`,
              timestamp: endTime.toLocaleTimeString(),
              duration
            });
          } finally {
            processing.delete(domain);
          }
        }
      }

      await new Promise(resolve => setTimeout(resolve, settings.delay));
    }

    setStatus(prev => ({ ...prev, isRunning: false, currentDomain: undefined }));
  };

  const startAutomation = async (domains: string[]) => {
    const antiCaptchaKey = localStorage.getItem('antiCaptchaKey');
    if (!antiCaptchaKey) {
      addLog({
        domain: 'System',
        status: 'error',
        message: 'Anti-Captcha API anahtarı bulunamadı',
        timestamp: new Date().toLocaleTimeString(),
        duration: 0
      });
      return;
    }

    setStatus(prev => ({ 
      ...prev, 
      isRunning: true, 
      startTime: new Date(),
      totalProcessed: 0,
      successCount: 0,
      errorCount: 0
    }));

    processQueue(domains, antiCaptchaKey);
  };

  const stopAutomation = () => {
    setStatus(prev => ({ ...prev, isRunning: false }));
  };

  return {
    status,
    logs,
    settings,
    setSettings,
    startAutomation,
    stopAutomation
  };
};