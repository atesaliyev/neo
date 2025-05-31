import { useState } from 'react';
import { solveCaptcha, getTaskResult, fillForm } from '../services/antiCaptchaService';

interface UseAntiCaptchaParams {
  apiKey: string;
  websiteURL: string;
}

type CaptchaStatus = 'idle' | 'solving' | 'solved' | 'error' | 'filling' | 'success';

export const useAntiCaptcha = ({ apiKey, websiteURL }: UseAntiCaptchaParams) => {
  const [status, setStatus] = useState<CaptchaStatus>('idle');
  const [solution, setSolution] = useState<string | null>(null);
  const [taskId, setTaskId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const solve = async (captchaType: 'recaptcha2' | 'imageCaptcha' | 'textCaptcha', 
                       additionalParams?: { websiteKey?: string, imageBase64?: string, textContent?: string }) => {
    try {
      setStatus('solving');
      setError(null);
      
      const result = await solveCaptcha({
        apiKey,
        websiteURL,
        captchaType,
        ...additionalParams
      });
      
      if (result.status === 'ready') {
        setStatus('solved');
        setSolution(result.solution);
        setTaskId(result.taskId);
        return result.solution;
      } else {
        setStatus('error');
        setError(result.error || 'Failed to solve captcha');
        return null;
      }
    } catch (err) {
      setStatus('error');
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
      return null;
    }
  };
  
  const checkTaskStatus = async () => {
    if (!taskId) {
      setError('No task ID available');
      return null;
    }
    
    try {
      const result = await getTaskResult(taskId, apiKey);
      
      if (result.status === 'ready') {
        setStatus('solved');
        setSolution(result.solution);
        return result.solution;
      } else if (result.status === 'processing') {
        return null; // Still processing
      } else {
        setStatus('error');
        setError(result.error || 'Failed to get task result');
        return null;
      }
    } catch (err) {
      setStatus('error');
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
      return null;
    }
  };
  
  const submitForm = async (formData: Record<string, string>) => {
    try {
      setStatus('filling');
      setError(null);
      
      const result = await fillForm(websiteURL, formData, solution || undefined);
      
      if (result.success) {
        setStatus('success');
        return true;
      } else {
        setStatus('error');
        setError(result.message);
        return false;
      }
    } catch (err) {
      setStatus('error');
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
      return false;
    }
  };
  
  const reset = () => {
    setStatus('idle');
    setSolution(null);
    setTaskId(null);
    setError(null);
  };
  
  return {
    status,
    solution,
    error,
    solve,
    checkTaskStatus,
    submitForm,
    reset
  };
};