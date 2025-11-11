/**
 * Cookie Refresh Script
 * Standalone script to refresh DeepAI cookies using puppeteer-real-browser
 */

import CookieManager from './cookieManager.js';

async function main() {
  console.log('🔄 DeepAI Çerez Yenileme Başlatılıyor...\n');

  const cookieManager = new CookieManager();

  try {
    // Refresh cookies with browser visible
    const result = await cookieManager.refreshCookies({
      headless: false,      // Tarayıcıyı göster
      waitTime: 15000,      // 15 saniye bekle
      autoExtract: true     // API key'i otomatik çıkar
    });

    if (result.success) {
      console.log('\n✅ İşlem Başarılı!');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('📊 Sonuç:');
      console.log('  • Çerez sayısı:', result.cookieCount);
      console.log('  • API Key:', result.apiKey ? '✅ Alındı' : '❌ Alınamadı');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

      if (result.apiKey) {
        console.log('🔑 API Key:', result.apiKey);
      }
    } else {
      console.error('\n❌ İşlem Başarısız!');
      console.error('Hata:', result.error);
      process.exit(1);
    }
  } catch (error) {
    console.error('\n❌ Kritik Hata:', error.message);
    process.exit(1);
  }
}

main();