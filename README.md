<<<<<<< HEAD
# DeepAI API Server 🤖

Node.js HTTP REST API sunucusu - DeepAI API ile **Gemini 2.5 Flash** modeli kullanarak sohbet etmek için multipart form-data desteği ve **otomatik çerez yönetimi** ile gelişmiş API sunucusu.

## 🌟 Özellikler

- ✅ **HTTP REST API** sunucusu (Express.js)
- ✅ **CORS desteği** - Cross-origin requests
- ✅ **Helmet security** - Güvenlik headers
- ✅ **ES Module** desteği (modern JavaScript)
- ✅ **Multipart form-data** desteği
- ✅ **Otomatik çerez yönetimi** (puppeteer-real-browser)
- ✅ **Chat history** desteği
- ✅ **Gemini 2.5 Flash** AI modeli
- ✅ **Araç entegrasyonu** (image generator, web search)
- ✅ **Error handling** middleware
- ✅ **Health check** endpoints
- ✅ RFC 2046 uyumlu form-data formatı

## 🚀 Kurulum ve Çalıştırma

```bash
# Depoyu klonlayın
git clone <repo-url>
cd deepai-api-server

# Bağımlılıkları yükleyin
npm install

# Çerezleri yenileyin (ilk kullanımda önerilir)
npm run cookies:refresh

# Sunucuyu başlatın
npm start

# Development modu (auto-reload)
npm run dev
```

## 📦 Bağımlılıklar

```json
{
  "express": "^4.19.2",
  "cors": "^2.8.5",
  "helmet": "^7.1.0",
  "node-fetch": "^3.3.2",
  "puppeteer-real-browser": "^1.3.18"
}
```

## 🌐 API Endpoints

### Base URL: `http://localhost:3000`

### Health Check
```http
GET /health
```
**Response:**
```json
{
  "status": "OK",
  "timestamp": "2025-11-11T12:00:00.000Z",
  "version": "2.0.0",
  "service": "DeepAI API Server"
}
```

### Server Status
```http
GET /status
```
**Response:**
```json
{
  "initialized": true,
  "apiKeyLoaded": true,
  "cookiesLoaded": true,
  "cookieCount": 17,
  "availableModels": ["gemini-2.5-flash-lite"],
  "availableTools": ["image_generator", "web_search", "code_interpreter"],
  "timestamp": "2025-11-11T12:00:00.000Z"
}
```

### API Information
```http
GET /info
```
**Response:**
```json
{
  "models": ["gemini-2.5-flash-lite"],
  "tools": ["image_generator", "web_search", "code_interpreter"],
  "features": ["multipart-form-data", "automatic-cookie-management", "chat-history"],
  "version": "2.0.0",
  "timestamp": "2025-11-11T12:00:00.000Z"
}
```

### Chat Message
```http
POST /chat
Content-Type: application/json

{
  "message": "Merhaba! Kendini tanıt.",
  "chatHistory": [],
  "options": {
    "enabledTools": ["image_generator"]
  }
}
```
**Response:**
```json
{
  "success": true,
  "response": {
    "output": "Merhaba! Ben Gemini, Google tarafından geliştirilen..."
  },
  "timestamp": "2025-11-11T12:00:00.000Z"
}
```

### Simple Message
```http
POST /message
Content-Type: application/json

{
  "message": "JavaScript nedir?",
  "options": {
    "enabledTools": ["web_search"]
  }
}
```
**Response:**
```json
{
  "success": true,
  "response": {
    "output": "JavaScript, web geliştirme için kullanılan..."
  },
  "timestamp": "2025-11-11T12:00:00.000Z"
}
```

### Continue Chat
```http
POST /continue
Content-Type: application/json

{
  "message": "Daha detaylı anlat",
  "history": [
    {
      "role": "user",
      "content": "JavaScript nedir?"
    },
    {
      "role": "assistant",
      "content": "JavaScript, web geliştirme için kullanılan..."
    }
  ],
  "options": {}
}
```
**Response:**
```json
{
  "success": true,
  "response": {
    "output": "JavaScript'in detayları şöyle..."
  },
  "timestamp": "2025-11-11T12:00:00.000Z"
}
```

### Refresh Cookies
```http
POST /refresh-cookies
Content-Type: application/json

{
  "headless": true,
  "waitTime": 15000,
  "autoExtract": true
}
```
**Response:**
```json
{
  "success": true,
  "message": "Cookies refreshed successfully",
  "cookieCount": 17,
  "apiKeyFound": true,
  "timestamp": "2025-11-11T12:00:00.000Z"
}
```

## 🍪 Çerez Yönetimi

### Otomatik Çerez Yönetimi

Sunucu otomatik olarak çerez yönetimi yapar:

- ✅ **Başlatma sırasında** çerezler yüklenir
- ✅ **401/403/429 hatalarında** puppeteer açılmaz
- ✅ **Manuel yenileme** için `/refresh-cookies` endpoint'i
- ✅ **Komut satırından** `npm run cookies:refresh`

### Çerez Dosya Konumları

- **Çerezler**: `data/cookies.json`
- **API Key**: `data/apikey.txt`

## 💻 Kullanım Örnekleri

### cURL ile Test

```bash
# Health check
curl http://localhost:3000/health

# Status check
curl http://localhost:3000/status

# Chat message
curl -X POST http://localhost:3000/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Merhaba!", "chatHistory": []}'

# Refresh cookies
curl -X POST http://localhost:3000/refresh-cookies \
  -H "Content-Type: application/json" \
  -d '{"headless": true}'
```

### JavaScript ile Kullanım

```javascript
// Fetch API ile
const response = await fetch('http://localhost:3000/chat', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    message: 'Merhaba!',
    chatHistory: [],
    options: {
      enabledTools: ['image_generator']
    }
  })
});

const data = await response.json();
console.log(data.response.output);
```

### Python ile Kullanım

```python
import requests

response = requests.post('http://localhost:3000/chat', json={
  'message': 'Merhaba!',
  'chatHistory': [],
  'options': {
    'enabledTools': ['image_generator']
  }
})

data = response.json()
print(data['response']['output'])
```

## 🎯 Chat History Formatı

```json
[
  {
    "role": "user",
    "content": "Merhaba!"
  },
  {
    "role": "assistant",
    "content": "Merhaba! Size nasıl yardımcı olabilirim?"
  },
  {
    "role": "user",
    "content": "JavaScript nedir?"
  }
]
```

## 🤖 AI Modeli

**Gemini 2.5 Flash** - Google'ın en hızlı ve verimli AI modeli
- Hızlı yanıt süreleri
- Yüksek kaliteli çıktılar
- Multimodal yetenekler (metin, resim, kod)
- Chat history desteği

## 🛠️ Kullanılabilir Araçlar

1. **image_generator** - Resim oluşturma
2. **web_search** - Web araması
3. **code_interpreter** - Kod çalıştırma

## 📁 Proje Yapısı

```
deepai-api-server/
├── api/
│   └── deepai.js           # Ana API modülü (çerez yönetimli)
├── utils/
│   ├── cookieManager.js    # Çerez yönetim modülü
│   └── refreshCookies.js   # Çerez yenileme script'i
├── data/
│   ├── cookies.json        # Çerezler (otomatik oluşur)
│   └── apikey.txt          # API key (otomatik oluşur)
├── server.js               # HTTP sunucu (Express.js)
├── index.js                # CLI test uygulaması
├── package.json            # Proje konfigürasyonu
└── README.md               # Dokümantasyon
```

## 🔧 NPM Komutları

```bash
# Sunucuyu başlat
npm start

# Development modu (auto-reload)
npm run dev

# Çerezleri yenile
npm run cookies:refresh

# CLI test (eski)
node index.js
```

## 📝 Örnek Sunucu Çıktısı

```
🚀 DeepAI API Server running on port 3000
📊 Health check: http://localhost:3000/health
📋 API info: http://localhost:3000/info
💬 Chat endpoint: POST http://localhost:3000/chat

🚀 DeepAI API başlatılıyor...
✅ API başarıyla başlatıldı!
📊 Çerez sayısı: 17
🔑 API Key: ✅ Yüklendi
```

## ⚠️ Önemli Notlar

1. **İlk Kullanım**: İlk kullanımda `npm run cookies:refresh` komutu ile çerezleri yenileyin
2. **Çerez Geçerliliği**: Çerezler belirli bir süre sonra geçersiz olabilir
3. **Port**: Sunucu varsayılan olarak 3000 portunda çalışır (`PORT` environment variable ile değiştirilebilir)
4. **CORS**: Tüm origin'lerden gelen istekler kabul edilir
5. **Security**: Helmet middleware ile temel güvenlik headers eklenir
6. **Model**: Sadece **gemini-2.5-flash-lite** modeli kullanılır

##  Güvenlik

- Çerezler ve API key'ler `data/` klasöründe saklanır
- `.gitignore` ile `data/` klasörü git'ten hariç tutulur
- Hassas bilgiler kod içinde hardcoded edilmez
- Helmet ile güvenlik headers eklenir
- Rate limiting uygulanmamıştır (gerektiğinde eklenebilir)

## 🐛 Hata Giderme

### Sunucu başlamıyor
```bash
# Port kullanımını kontrol et
netstat -ano | findstr :3000

# Farklı port kullan
PORT=3001 npm start
```

### Çerezler yüklenmiyor
```bash
# Çerezleri manuel yenile
npm run cookies:refresh

# Veya API üzerinden
curl -X POST http://localhost:3000/refresh-cookies
```

### 401/403 Hatası
```bash
# Çerezleri yenile
npm run cookies:refresh
```

### CORS hatası
```javascript
// Frontend'den çağrı yaparken
const response = await fetch('http://localhost:3000/chat', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  // mode: 'cors' (varsayılan)
});
```

## 📄 Lisans

MIT

## 🤝 Katkıda Bulunma

Pull request'ler kabul edilir. Büyük değişiklikler için önce issue açın.

## 📞 Destek

Sorularınız için issue açabilirsiniz.

---

**Not**: Bu proje DeepAI API'sinin resmi olmayan bir istemcisidir. Sadece **Gemini 2.5 Flash** modeli kullanılır.
=======
# GeminiReverse_ApiServer
>>>>>>> 64485543dbae7670f776c47b9d4be1e884695b54
