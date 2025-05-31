<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

require_once 'vendor/autoload.php';

class BTKAutomation {
    private $formUrl = 'https://www.ihbarweb.org.tr/ihbar.php?subject=7';
    private $antiCaptchaKey;
    
    public function __construct($antiCaptchaKey) {
        $this->antiCaptchaKey = $antiCaptchaKey;
    }
    
    public function processForm($domain) {
        try {
            // Form sayfasını al
            $ch = curl_init();
            curl_setopt($ch, CURLOPT_URL, $this->formUrl);
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
            curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
            curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
            
            $response = curl_exec($ch);
            
            if (curl_errno($ch)) {
                throw new Exception('Form sayfası alınamadı: ' . curl_error($ch));
            }
            
            // CAPTCHA resmini al
            $dom = new DOMDocument();
            @$dom->loadHTML($response);
            $xpath = new DOMXPath($dom);
            $captchaImg = $xpath->query("//img[@id='captcha']")->item(0);
            
            if (!$captchaImg) {
                throw new Exception('CAPTCHA resmi bulunamadı');
            }
            
            $captchaUrl = 'https://www.ihbarweb.org.tr/' . $captchaImg->getAttribute('src');
            
            // CAPTCHA resmini indir
            curl_setopt($ch, CURLOPT_URL, $captchaUrl);
            $captchaImage = curl_exec($ch);
            
            if (curl_errno($ch)) {
                throw new Exception('CAPTCHA resmi indirilemedi: ' . curl_error($ch));
            }
            
            // Anti-CAPTCHA API'yi kullan
            $ac = new \AntiCaptcha\Client($this->antiCaptchaKey);
            $task = $ac->createImageToTextTask([
                'body' => base64_encode($captchaImage),
                'phrase' => false,
                'case' => true,
                'numeric' => 0,
                'math' => false,
                'minLength' => 6,
                'maxLength' => 6
            ]);
            
            $taskId = $task->taskId;
            $maxAttempts = 30;
            $captchaSolution = '';
            
            while ($maxAttempts > 0) {
                $taskResult = $ac->getTaskResult($taskId);
                if ($taskResult->status === 'ready') {
                    $captchaSolution = $taskResult->solution->text;
                    break;
                }
                sleep(1);
                $maxAttempts--;
            }
            
            if (!$captchaSolution) {
                throw new Exception('CAPTCHA çözülemedi');
            }
            
            // Form verilerini hazırla
            $formData = [
                'ihbar' => '7',
                'adres' => $domain,
                'detay' => "Phishing domain report: {$domain}",
                'tar' => date('Y-m-d H:i:s'),
                'suc' => '2',
                'ad' => '',
                'soyad' => '',
                'tckimlik' => '',
                'email' => '',
                'tel' => '',
                'security_code' => $captchaSolution
            ];
            
            // Formu gönder
            curl_setopt($ch, CURLOPT_URL, $this->formUrl);
            curl_setopt($ch, CURLOPT_POST, true);
            curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($formData));
            curl_setopt($ch, CURLOPT_REFERER, $this->formUrl);
            
            $submitResponse = curl_exec($ch);
            $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
            
            curl_close($ch);
            
            if ($httpCode === 302 || 
                stripos($submitResponse, 'ihbarsonrasi.html') !== false ||
                stripos($submitResponse, 'teşekkür') !== false ||
                stripos($submitResponse, 'ihbarınız alınmıştır') !== false) {
                return [
                    'success' => true,
                    'message' => 'Form başarıyla gönderildi'
                ];
            }
            
            throw new Exception('Form gönderilemedi');
            
        } catch (Exception $e) {
            return [
                'success' => false,
                'message' => $e->getMessage()
            ];
        }
    }
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    
    if (!isset($data['domain']) || !isset($data['antiCaptchaKey'])) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'message' => 'Domain ve Anti-Captcha anahtarı gerekli'
        ]);
        exit;
    }
    
    $automation = new BTKAutomation($data['antiCaptchaKey']);
    $result = $automation->processForm($data['domain']);
    
    echo json_encode($result);
}