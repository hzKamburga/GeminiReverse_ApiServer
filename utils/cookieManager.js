/**
 * Cookie Manager Module
 * Puppeteer-real-browser kullanarak otomatik çerez alma ve yenileme
 */

import { connect } from 'puppeteer-real-browser';
import fs from 'fs/promises';
import path from 'path';

export class CookieManager {
  constructor() {
    this.cookiesPath = path.join(process.cwd(), 'data', 'cookies.json');
    this.apiKeyPath = path.join(process.cwd(), 'data', 'apikey.txt');
    this.deepAIUrl = 'https://deepai.org/chat';
  }

  /**
   * Ensure data directory exists
   */
  async ensureDataDirectory() {
    try {
      await fs.mkdir(path.join(process.cwd(), 'data'), { recursive: true });
    } catch (error) {
      // Directory already exists
    }
  }

  /**
   * Load cookies from file
   * @returns {Promise<Array>} Cookies array
   */
  async loadCookies() {
    try {
      const cookiesData = await fs.readFile(this.cookiesPath, 'utf-8');
      return JSON.parse(cookiesData);
    } catch (error) {
      console.log('⚠️  Çerez dosyası bulunamadı, yeni çerez alınacak...');
      return null;
    }
  }

  /**
   * Save cookies to file
   * @param {Array} cookies - Cookies array
   */
  async saveCookies(cookies) {
    await this.ensureDataDirectory();
    await fs.writeFile(this.cookiesPath, JSON.stringify(cookies, null, 2));
    console.log('✅ Çerezler kaydedildi:', this.cookiesPath);
  }

  /**
   * Load API key from file
   * @returns {Promise<string|null>} API key
   */
  async loadApiKey() {
    try {
      const apiKey = await fs.readFile(this.apiKeyPath, 'utf-8');
      return apiKey.trim();
    } catch (error) {
      console.log('⚠️  API key dosyası bulunamadı');
      return null;
    }
  }

  /**
   * Save API key to file
   * @param {string} apiKey - API key
   */
  async saveApiKey(apiKey) {
    await this.ensureDataDirectory();
    await fs.writeFile(this.apiKeyPath, apiKey);
    console.log('✅ API key kaydedildi:', this.apiKeyPath);
  }

  /**
   * Extract API key from cookies or page
   * @param {Object} page - Puppeteer page object
   * @returns {Promise<string|null>} API key
   */
  async extractApiKey(page) {
    try {
      // Wait for API key to be available in localStorage or cookies
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Try to extract from localStorage
      const apiKey = await page.evaluate(() => {
        return localStorage.getItem('apiKey') ||
               localStorage.getItem('deepai_api_key') ||
               window.apiKey;
      });

      if (apiKey) {
        console.log('✅ API key bulundu:', apiKey.substring(0, 20) + '...');
        return apiKey;
      }

      // Try to extract from network requests
      console.log('⚠️  API key localStorage\'da bulunamadı');
      return null;
    } catch (error) {
      console.error('❌ API key çıkarma hatası:', error.message);
      return null;
    }
  }

  /**
   * Refresh cookies by opening DeepAI website
   * @param {Object} options - Options
   * @returns {Promise<Object>} Result with cookies and API key
   */
  async refreshCookies(options = {}) {
    const {
      headless = false,
      waitTime = 10000,
      autoExtract = true
    } = options;

    console.log('🚀 Puppeteer başlatılıyor...');

    let browser, page;

    try {
      // Connect with puppeteer-real-browser
      const { browser: br, page: pg } = await connect({
        headless: headless ? 'auto' : false,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-web-security',
          '--disable-features=IsolateOrigins,site-per-process'
        ],
        turnstile: true,
        customConfig: {},
        connectOption: {},
        disableXvfb: false,
        ignoreAllFlags: false
      });

      browser = br;
      page = pg;

      console.log('🌐 DeepAI sitesine gidiliyor...');
      await page.goto(this.deepAIUrl, {
        waitUntil: 'networkidle2',
        timeout: 60000
      });

      console.log('⏳ Sayfa yükleniyor...');
      await new Promise(resolve => setTimeout(resolve, waitTime));

      // Get cookies
      const cookies = await page.cookies();
      console.log(`✅ ${cookies.length} çerez alındı`);

      // Extract API key if auto mode
      let apiKey = null;
      if (autoExtract) {
        apiKey = await this.extractApiKey(page);
      }

      // Save cookies and API key
      await this.saveCookies(cookies);
      if (apiKey) {
        await this.saveApiKey(apiKey);
      }

      console.log('✅ Çerez yenileme tamamlandı!');

      return {
        success: true,
        cookies,
        apiKey,
        cookieCount: cookies.length
      };

    } catch (error) {
      console.error('❌ Çerez yenileme hatası:', error.message);
      return {
        success: false,
        error: error.message
      };
    } finally {
      if (browser) {
        await browser.close();
        console.log('🔒 Tarayıcı kapatıldı');
      }
    }
  }

  /**
   * Get cookies (load from file or refresh if needed)
   * @param {Object} options - Options
   * @returns {Promise<Array>} Cookies array
   */
  async getCookies(options = {}) {
    const { forceRefresh = false } = options;

    if (!forceRefresh) {
      const cookies = await this.loadCookies();
      if (cookies && cookies.length > 0) {
        console.log(`✅ Mevcut çerezler yüklendi: ${cookies.length} adet`);
        return cookies;
      }
    }

    console.log('🔄 Yeni çerezler alınıyor...');
    const result = await this.refreshCookies(options);
    
    if (result.success) {
      return result.cookies;
    }

    throw new Error('Çerez alınamadı: ' + result.error);
  }

  /**
   * Get API key (load from file or extract if needed)
   * @param {Object} options - Options
   * @returns {Promise<string>} API key
   */
  async getApiKey(options = {}) {
    const { forceRefresh = false } = options;

    if (!forceRefresh) {
      const apiKey = await this.loadApiKey();
      if (apiKey) {
        console.log('✅ Mevcut API key yüklendi');
        return apiKey;
      }
    }

    console.log('🔄 Yeni API key alınıyor...');
    const result = await this.refreshCookies(options);
    
    if (result.success && result.apiKey) {
      return result.apiKey;
    }

    // Return default API key if extraction failed
    console.log('⚠️  API key çıkarılamadı, varsayılan kullanılıyor');
    return 'tryit-91420529091-3c49d726d8f63636c43edd3275dcec43';
  }

  /**
   * Check if cookies are valid (not expired)
   * @returns {Promise<boolean>} True if valid
   */
  async areCookiesValid() {
    const cookies = await this.loadCookies();
    if (!cookies || cookies.length === 0) {
      return false;
    }

    // Check expiration
    const now = Date.now() / 1000;
    const allValid = cookies.every(cookie => {
      return !cookie.expires || cookie.expires > now;
    });

    return allValid;
  }

  /**
   * Get cookies as header string
   * @returns {Promise<string>} Cookie header string
   */
  async getCookieHeader() {
    const cookies = await this.getCookies();
    return cookies.map(c => `${c.name}=${c.value}`).join('; ');
  }
}

export default CookieManager;