/**
 * DeepAI API Client - Example Usage with Cookie Management
 * ES Module implementation with puppeteer-real-browser integration
 */

import DeepAIAPI from './api/deepai.js';

async function main() {
  console.log('🚀 DeepAI API Client başlatılıyor...\n');

  // Create API instance with cookie management enabled
  const api = new DeepAIAPI(null, {
    useCookies: true,           // Çerez yönetimini etkinleştir
    autoRefreshCookies: true    // Otomatik çerez yenilemeyi etkinleştir
  });

  try {
    // Initialize API (load cookies and API key)
    console.log('🔧 API başlatılıyor...');
    const initResult = await api.initialize();
    
    if (initResult.success) {
      console.log('✅ API başarıyla başlatıldı!');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('📊 Bilgiler:');
      console.log('  • API Key:', initResult.apiKey ? '✅ Yüklendi' : '❌ Bulunamadı');
      console.log('  • Çerez Sayısı:', initResult.cookieCount);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    } else {
      console.log('⚠️  API kısmi başlatıldı (varsayılan değerler kullanılıyor)\n');
    }

    // Example 1: Send a simple message
    console.log('💬 Basit mesaj gönderiliyor...');
    const response1 = await api.sendMessage('Merhaba! Kendini tanıt.', {
      model: 'gemini-2.5-flash-lite'
    });

    console.log('✅ Yanıt alındı!');
    console.log('📝 Yanıt:', response1.output);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    // Example 2: Continue chat with history
    const chatHistory = [
      { role: 'user', content: 'Merhaba! Kendini tanıt.' },
      { role: 'assistant', content: response1.output }
    ];

    console.log('💬 Chat history ile devam ediliyor...');
    const response2 = await api.continueChat('JavaScript hakkında ne biliyorsun?', chatHistory, {
      model: 'gemini-2.5-flash-lite'
    });

    console.log('✅ İkinci yanıt alındı!');
    console.log('📝 Yanıt:', response2.output);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    // Example 3: Try different model
    console.log('💬 Farklı model deneniyor...');
    const response3 = await api.sendMessage('En sevdiğin programlama dili nedir?', {
      model: 'gpt-4o'
    });

    console.log('✅ GPT-4o yanıt verdi!');
    console.log('📝 Yanıt:', response3.output);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    console.log('🎉 Tüm işlemler başarıyla tamamlandı!\n');

    // Display available options
    console.log('📚 Kullanılabilir Modeller:');
    api.getAvailableModels().forEach((model, i) => {
      console.log(`  ${i + 1}. ${model}`);
    });

    console.log('\n🛠️  Kullanılabilir Araçlar:');
    api.getAvailableTools().forEach((tool, i) => {
      console.log(`  ${i + 1}. ${tool}`);
    });

    console.log('\n💡 İpuçları:');
    console.log('  • Çerezleri yenilemek için: npm run cookies:refresh');
    console.log('  • Manuel çerez yenileme: await api.refreshCookies({ headless: false })');
    console.log('  • Cookie kullanmadan: new DeepAIAPI(apiKey, { useCookies: false })');

  } catch (error) {
    console.error('\n❌ Hata oluştu:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
}

// Run main function
main();
