import { createClient } from 'npm:@supabase/supabase-js@2.39.3'
import { JSDOM } from 'npm:jsdom@24.0.0'
import axios from 'npm:axios@1.6.7'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS'
}

async function checkBTKSiteAccessibility(userAgent: string, proxy?: { host: string; port: number; protocol: string }) {
  try {
    const instance = axios.create({
      timeout: 30000,
      maxRedirects: 5,
      validateStatus: () => true,
      headers: {
        'User-Agent': userAgent,
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'tr,en-US;q=0.7,en;q=0.3',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1'
      }
    });

    if (proxy) {
      instance.defaults.proxy = proxy;
    }

    const formUrl = 'https://www.ihbarweb.org.tr/ihbar.php?subject=7';
    const response = await instance.get(formUrl);

    if (response.status === 200) {
      const dom = new JSDOM(response.data);
      const form = dom.window.document.querySelector('form');
      
      if (!form) {
        return {
          success: false,
          message: 'BTK ihbar formu sayfada bulunamadı. Site yapısı değişmiş olabilir.'
        };
      }

      return {
        success: true,
        message: 'BTK ihbar formu erişilebilir durumda'
      };
    }

    if (response.status === 403) {
      return {
        success: false,
        message: 'BTK ihbar formuna erişim engellendi (403 Forbidden). IP adresiniz engellenmiş olabilir.'
      };
    }

    if (response.status === 404) {
      return {
        success: false,
        message: 'BTK ihbar formu bulunamadı (404 Not Found). Form adresi değişmiş olabilir.'
      };
    }

    if (response.status >= 500) {
      return {
        success: false,
        message: `BTK sunucusu şu anda hizmet veremiyor (${response.status}). Lütfen daha sonra tekrar deneyin.`
      };
    }

    return {
      success: false,
      message: `BTK ihbar formuna erişilemedi: HTTP ${response.status}`
    };

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Bilinmeyen hata';
    return {
      success: false,
      message: `BTK ihbar formuna erişilemedi: ${errorMessage}`
    };
  }
}

async function processBTKForm(domain: string, antiCaptchaKey: string, retryCount: number = 3) {
  let attempts = 0;
  
  const axiosInstance = axios.create({
    validateStatus: () => true,
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    }
  });

  while (attempts < retryCount) {
    try {
      const formUrl = 'https://www.ihbarweb.org.tr/ihbar.php?subject=7';
      const formResponse = await axiosInstance.get(formUrl);

      if (formResponse.status !== 200) {
        throw new Error(`Form sayfası yüklenemedi: HTTP ${formResponse.status}`);
      }

      const dom = new JSDOM(formResponse.data);
      const captchaImg = dom.window.document.getElementById('captcha');
      if (!captchaImg) {
        throw new Error('CAPTCHA resmi bulunamadı');
      }

      const captchaUrl = new URL(
        captchaImg.getAttribute('src') || '',
        'https://www.ihbarweb.org.tr'
      ).href;

      const now = new Date();
      const formData = {
        ihbar: '7',
        adres: domain,
        detay: `Phishing domain report: ${domain}`,
        tar: `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`,
        suc: '2',
        ad: '',
        soyad: '',
        tckimlik: '',
        email: '',
        tel: '',
        security_code: ''
      };

      const captchaResponse = await axiosInstance.get(captchaUrl, {
        responseType: 'arraybuffer',
        headers: {
          'Referer': formUrl
        }
      });

      if (captchaResponse.status !== 200) {
        throw new Error(`CAPTCHA resmi alınamadı: HTTP ${captchaResponse.status}`);
      }

      const captchaBase64 = Buffer.from(captchaResponse.data).toString('base64');
      const anticaptchaResponse = await axios.post('https://api.anti-captcha.com/createTask', {
        clientKey: antiCaptchaKey,
        task: {
          type: 'ImageToTextTask',
          body: captchaBase64,
          phrase: false,
          case: true,
          numeric: 0,
          math: false,
          minLength: 6,
          maxLength: 6
        }
      });

      if (anticaptchaResponse.data.errorId > 0) {
        throw new Error(`Anti-Captcha hatası: ${anticaptchaResponse.data.errorDescription}`);
      }

      const taskId = anticaptchaResponse.data.taskId;

      let captchaSolution = '';
      let maxWait = 30;

      while (maxWait > 0) {
        const resultResponse = await axios.post('https://api.anti-captcha.com/getTaskResult', {
          clientKey: antiCaptchaKey,
          taskId: taskId
        });

        if (resultResponse.data.status === 'ready') {
          captchaSolution = resultResponse.data.solution.text;
          break;
        }

        await new Promise(resolve => setTimeout(resolve, 1000));
        maxWait--;
      }

      if (!captchaSolution) {
        throw new Error('CAPTCHA çözülemedi: Zaman aşımı');
      }

      formData.security_code = captchaSolution;

      const submitResponse = await axiosInstance.post(
        formUrl, 
        new URLSearchParams(formData as any).toString(),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Origin': 'https://www.ihbarweb.org.tr',
            'Referer': formUrl
          },
          maxRedirects: 0
        }
      );

      const responseText = submitResponse.data.toString().toLowerCase();
      if (submitResponse.status === 302 || 
          responseText.includes('ihbarsonrasi.html') ||
          responseText.includes('teşekkür') ||
          responseText.includes('ihbarınız alınmıştır')) {
        return {
          success: true,
          message: 'Form başarıyla gönderildi'
        };
      }

      throw new Error('Form gönderimi başarısız');

    } catch (error) {
      attempts++;
      const errorMessage = error instanceof Error ? error.message : 'Bilinmeyen hata';
      
      if (attempts >= retryCount) {
        return {
          success: false,
          message: `Form gönderimi başarısız (${attempts} deneme): ${errorMessage}`
        };
      }

      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }

  return {
    success: false,
    message: 'Maximum deneme sayısına ulaşıldı'
  };
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const url = new URL(req.url)
    const service = url.pathname.split('/').pop()

    if (service === 'check-accessibility') {
      const { userAgent, proxy } = await req.json()
      const result = await checkBTKSiteAccessibility(userAgent, proxy)
      return new Response(JSON.stringify(result), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    if (service === 'serp') {
      const params = url.searchParams
      const apiKey = params.get('api_key')
      
      if (!apiKey) {
        throw new Error('SERP API key is required')
      }

      const serpUrl = new URL('https://serpapi.com/search')
      params.forEach((value, key) => serpUrl.searchParams.append(key, value))

      const response = await fetch(serpUrl.toString())
      const data = await response.json()

      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    if (service === 'whois') {
      const body = await req.json()
      const { apiKey, ...params } = body

      if (!apiKey) {
        throw new Error('WHOIS API key is required')
      }

      const whoisUrl = 'https://www.whoisxmlapi.com/whoisserver/WhoisService'
      const response = await fetch(whoisUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify(params)
      })

      const data = await response.json()
      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    if (service === 'btk') {
      const { domain, antiCaptchaKey, retryCount } = await req.json()
      
      if (!domain || !antiCaptchaKey) {
        throw new Error('Domain and Anti-Captcha key are required')
      }

      const result = await processBTKForm(domain, antiCaptchaKey, retryCount)
      return new Response(JSON.stringify(result), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    throw new Error('Invalid service specified')
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})