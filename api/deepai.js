/**
 * DeepAI API Client Module
 * ES Module for making API requests to DeepAI with automatic cookie management
 */

import CookieManager from '../utils/cookieManager.js';

export class DeepAIAPI {
  constructor(apiKey = null, options = {}) {
    this.baseURL = 'https://api.deepai.org';
    this.apiKey = apiKey;
    this.cookieManager = new CookieManager();
    this.useCookies = options.useCookies !== false; // Default: true
    this.autoRefreshCookies = options.autoRefreshCookies !== false; // Default: true
    this.headers = {
      'accept': '*/*',
      'accept-language': 'tr-TR,tr;q=0.9,en-US;q=0.8,en;q=0.7',
      'sec-ch-ua': '"Google Chrome";v="141", "Not?A_Brand";v="8", "Chromium";v="141"',
      'sec-ch-ua-mobile': '?0',
      'sec-ch-ua-platform': '"Windows"',
      'sec-fetch-dest': 'empty',
      'sec-fetch-mode': 'cors',
      'sec-fetch-site': 'same-site',
      'priority': 'u=1, i'
    };
  }

  /**
   * Initialize API (load or refresh cookies and API key)
   * @param {Object} options - Initialization options
   */
  async initialize(options = {}) {
    const { forceRefresh = false } = options;

    try {
      // Get API key from cookie manager if not provided
      if (!this.apiKey && this.useCookies) {
        console.log('🔑 API key alınıyor...');
        this.apiKey = await this.cookieManager.getApiKey({ forceRefresh });
      }

      // Set API key in headers
      if (this.apiKey) {
        this.headers['api-key'] = this.apiKey;
        console.log('✅ API key yüklendi:', this.apiKey.substring(0, 20) + '...');
      }

      // Get cookies if enabled (forceRefresh olmadan - sadece 1 kez al)
      if (this.useCookies) {
        const cookies = await this.cookieManager.loadCookies(); // loadCookies kullan, getCookies değil
        if (cookies && cookies.length > 0) {
          this.cookies = cookies;
          console.log(`✅ ${cookies.length} çerez yüklendi`);
        } else {
          console.log('⚠️  Çerez bulunamadı, manuel yenileyin: npm run cookies:refresh');
        }
      }

      return {
        success: true,
        apiKey: this.apiKey,
        cookieCount: this.cookies?.length || 0
      };
    } catch (error) {
      console.error('❌ Initialization error:', error.message);

      // Use default API key as fallback
      if (!this.apiKey) {
        this.apiKey = 'tryit-91420529091-3c49d726d8f63636c43edd3275dcec43';
        this.headers['api-key'] = this.apiKey;
        console.log('⚠️  Varsayılan API key kullanılıyor');
      }

      return {
        success: false,
        error: error.message,
        apiKey: this.apiKey
      };
    }
  }

  /**
   * Create multipart form data boundary
   * @returns {string} Random boundary string
   */
  createBoundary() {
    return '----WebKitFormBoundary' + Math.random().toString(36).substring(2, 15);
  }

  /**
   * Build multipart form data body (RFC 2046 compliant)
   * @param {Object} fields - Form fields
   * @param {string} boundary - Boundary string
   * @returns {string} Form data body
   */
  buildFormData(fields, boundary) {
    let formData = '';
    
    for (const [key, value] of Object.entries(fields)) {
      formData += `--${boundary}\r\n`;
      formData += `Content-Disposition: form-data; name="${key}"\r\n\r\n`;
      
      if (typeof value === 'object') {
        formData += JSON.stringify(value);
      } else {
        formData += value;
      }
      
      formData += '\r\n';
    }
    
    formData += `--${boundary}--\r\n`;
    return formData;
  }

  /**
   * Get cookie header string
   * @returns {string} Cookie header
   */
  getCookieHeader() {
    if (!this.cookies || this.cookies.length === 0) {
      return '';
    }
    return this.cookies.map(c => `${c.name}=${c.value}`).join('; ');
  }

  /**
   * Send chat message to DeepAI
   * @param {string} message - User message
   * @param {Array} chatHistory - Previous chat history
   * @param {Object} options - Additional options
   * @returns {Promise<Object>} API response
   */
  async chat(message, chatHistory = [], options = {}) {
    const boundary = this.createBoundary();
    
    // Add new message to chat history
    const fullHistory = [
      ...chatHistory,
      { role: 'user', content: message }
    ];

    const fields = {
      chat_style: options.chatStyle || 'chat',
      chatHistory: JSON.stringify(fullHistory),
      model: options.model || 'gemini-2.5-flash-lite',
      hacker_is_stinky: 'very_stinky',
      enabled_tools: JSON.stringify(options.enabledTools || ['image_generator'])
    };

    const body = this.buildFormData(fields, boundary);

    // Prepare headers with cookies
    const requestHeaders = { ...this.headers };
    requestHeaders['content-type'] = `multipart/form-data; boundary=${boundary}`;
    
    // Add cookie header if cookies are available
    if (this.useCookies) {
      const cookieHeader = this.getCookieHeader();
      if (cookieHeader) {
        requestHeaders['cookie'] = cookieHeader;
      }
    }

    try {
      const response = await fetch(`${this.baseURL}/hacking_is_a_serious_crime`, {
        method: 'POST',
        headers: requestHeaders,
        body: body
      });

      if (!response.ok) {
        const errorText = await response.text();

        // 401/403/429 hatalarında puppeteer açma, sadece hata döndür
        if (response.status === 401 || response.status === 403 || response.status === 429) {
          throw new Error(`Authentication error! status: ${response.status}. Çerezleri manuel yenileyin: npm run cookies:refresh`);
        }

        throw new Error(`HTTP error! status: ${response.status}, body: ${errorText}`);
      }

      // Get response as text first
      const responseText = await response.text();
      
      // Try to parse as JSON, if fails return as text
      try {
        const data = JSON.parse(responseText);
        return data;
      } catch (parseError) {
        // If response is not JSON, return it as plain text in a structured format
        return {
          output: responseText,
          isPlainText: true
        };
      }
    } catch (error) {
      console.error('Error sending chat message:', error);
      throw error;
    }
  }

  /**
   * Send a simple message without chat history
   * @param {string} message - User message
   * @param {Object} options - Additional options
   * @returns {Promise<Object>} API response
   */
  async sendMessage(message, options = {}) {
    return await this.chat(message, [], options);
  }

  /**
   * Continue conversation with history
   * @param {string} message - New user message
   * @param {Array} history - Previous chat history
   * @param {Object} options - Additional options
   * @returns {Promise<Object>} API response
   */
  async continueChat(message, history, options = {}) {
    return await this.chat(message, history, options);
  }

  /**
   * Set custom API key
   * @param {string} apiKey - New API key
   */
  setApiKey(apiKey) {
    this.apiKey = apiKey;
    this.headers['api-key'] = apiKey;
  }

  /**
   * Manually refresh cookies
   * @param {Object} options - Refresh options
   * @returns {Promise<Object>} Refresh result
   */
  async refreshCookies(options = {}) {
    if (!this.useCookies) {
      throw new Error('Cookie management is disabled');
    }
    
    const result = await this.cookieManager.refreshCookies(options);
    
    if (result.success) {
      this.cookies = result.cookies;
      if (result.apiKey) {
        this.setApiKey(result.apiKey);
      }
    }
    
    return result;
  }

  /**
   * Get available models
   * @returns {Array<string>} Available models
   */
  getAvailableModels() {
    return [
      'gemini-2.5-flash-lite',
      'gpt-4o',
      'claude-3-opus-20240229',
      'meta-llama/Meta-Llama-3-70B-Instruct'
    ];
  }

  /**
   * Get available tools
   * @returns {Array<string>} Available tools
   */
  getAvailableTools() {
    return [
      'image_generator',
      'web_search',
      'code_interpreter'
    ];
  }
}

export default DeepAIAPI;