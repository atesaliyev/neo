import axios from 'axios';

interface CaptchaSolution {
  solution: string;
  taskId: string;
  status: 'ready' | 'processing' | 'failed';
  error?: string;
}

interface AntiCaptchaParams {
  apiKey: string;
  websiteURL: string;
  websiteKey?: string;
  captchaType: 'recaptcha2' | 'imageCaptcha' | 'textCaptcha';
  imageBase64?: string;
  textContent?: string;
}

export const solveCaptcha = async (params: AntiCaptchaParams): Promise<CaptchaSolution> => {
  try {
    const { apiKey, websiteURL, captchaType, imageBase64 } = params;
    
    // Create task in anti-captcha
    const createTaskResponse = await axios.post('https://api.anti-captcha.com/createTask', {
      clientKey: apiKey,
      task: {
        type: captchaType === 'imageCaptcha' ? 'ImageToTextTask' : 'NoCaptchaTaskProxyless',
        body: imageBase64,
        websiteURL: websiteURL,
        websiteKey: params.websiteKey
      }
    });

    if (createTaskResponse.data.errorId > 0) {
      throw new Error(createTaskResponse.data.errorDescription);
    }

    const taskId = createTaskResponse.data.taskId;
    
    // Wait for solution
    let attempts = 0;
    while (attempts < 30) { // Max 30 attempts with 2s delay = 60s timeout
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const resultResponse = await axios.post('https://api.anti-captcha.com/getTaskResult', {
        clientKey: apiKey,
        taskId: taskId
      });

      if (resultResponse.data.errorId > 0) {
        throw new Error(resultResponse.data.errorDescription);
      }

      if (resultResponse.data.status === 'ready') {
        return {
          solution: resultResponse.data.solution.text || resultResponse.data.solution.gRecaptchaResponse,
          taskId: taskId.toString(),
          status: 'ready'
        };
      }

      attempts++;
    }

    throw new Error('Timeout waiting for captcha solution');
  } catch (error) {
    return {
      solution: '',
      taskId: '',
      status: 'failed',
      error: error instanceof Error ? error.message : 'Failed to solve captcha'
    };
  }
};

export const getTaskResult = async (taskId: string, apiKey: string): Promise<CaptchaSolution> => {
  try {
    const response = await axios.post('https://api.anti-captcha.com/getTaskResult', {
      clientKey: apiKey,
      taskId: taskId
    });

    if (response.data.errorId > 0) {
      throw new Error(response.data.errorDescription);
    }

    if (response.data.status === 'ready') {
      return {
        solution: response.data.solution.text || response.data.solution.gRecaptchaResponse,
        taskId,
        status: 'ready'
      };
    }

    return {
      solution: '',
      taskId,
      status: 'processing'
    };
  } catch (error) {
    return {
      solution: '',
      taskId,
      status: 'failed',
      error: error instanceof Error ? error.message : 'Failed to get task result'
    };
  }
};

export const fillForm = async (
  url: string,
  formData: Record<string, string>,
  captchaSolution?: string
): Promise<{ success: boolean; message: string }> => {
  try {
    // Get the form page first to extract any necessary tokens/fields
    const formPage = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });

    // Submit the form with all data
    const response = await axios.post(url, {
      ...formData,
      security_code: captchaSolution
    }, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Content-Type': 'application/x-www-form-urlencoded',
        'Origin': new URL(url).origin,
        'Referer': url
      }
    });

    // Check response for success indicators
    const success = response.status === 200 && 
                   (response.data.includes('success') || response.data.includes('thank you'));

    return {
      success,
      message: success ? 'Form successfully submitted' : 'Form submission failed'
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to submit form'
    };
  }
};