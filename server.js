/**
 * DeepAI API Server
 * HTTP REST API server for Gemini 2.5 Flash with automatic cookie management
 */

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import DeepAIAPI from './api/deepai.js';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet()); // Security headers
app.use(cors()); // CORS support
app.use(express.json({ limit: '10mb' })); // JSON parsing
app.use(express.urlencoded({ extended: true, limit: '10mb' })); // URL encoding

// Global API instance
let apiInstance = null;

/**
 * Initialize API instance
 */
async function initializeAPI() {
  if (!apiInstance) {
    console.log('🚀 DeepAI API başlatılıyor...');
    apiInstance = new DeepAIAPI(null, {
      useCookies: true,
      autoRefreshCookies: false
    });

    const result = await apiInstance.initialize();
    if (result.success) {
      console.log('✅ API başarıyla başlatıldı!');
      console.log(`📊 Çerez sayısı: ${result.cookieCount}`);
      console.log(`🔑 API Key: ${result.apiKey ? '✅ Yüklendi' : '❌ Bulunamadı'}`);
    } else {
      console.log('⚠️  API kısmi başlatıldı:', result.error);
    }
  }
  return apiInstance;
}

// Routes

/**
 * Health check endpoint
 */
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    version: '2.0.0',
    service: 'DeepAI API Server'
  });
});

/**
 * Get server status
 */
app.get('/status', async (req, res) => {
  try {
    const api = await initializeAPI();
    const cookieManager = api.cookieManager;

    const status = {
      initialized: apiInstance !== null,
      apiKeyLoaded: !!api.apiKey,
      cookiesLoaded: !!(api.cookies && api.cookies.length > 0),
      cookieCount: api.cookies?.length || 0,
      availableModels: api.getAvailableModels(),
      availableTools: api.getAvailableTools(),
      timestamp: new Date().toISOString()
    };

    res.json(status);
  } catch (error) {
    res.status(500).json({
      error: 'Status check failed',
      message: error.message
    });
  }
});

/**
 * Send chat message
 * POST /chat
 */
app.post('/chat', async (req, res) => {
  try {
    const { message, chatHistory = [], options = {} } = req.body;

    if (!message) {
      return res.status(400).json({
        error: 'Message is required',
        usage: 'POST /chat { "message": "Hello", "chatHistory": [], "options": {} }'
      });
    }

    const api = await initializeAPI();
    const response = await api.chat(message, chatHistory, options);

    res.json({
      success: true,
      response,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Chat error:', error.message);

    // Handle authentication errors
    if (error.message.includes('Authentication error') ||
        error.message.includes('status: 401') ||
        error.message.includes('status: 403') ||
        error.message.includes('status: 429')) {
      return res.status(401).json({
        error: 'Authentication failed',
        message: error.message,
        suggestion: 'Run: npm run cookies:refresh'
      });
    }

    res.status(500).json({
      error: 'Chat failed',
      message: error.message
    });
  }
});

/**
 * Send simple message (no history)
 * POST /message
 */
app.post('/message', async (req, res) => {
  try {
    const { message, options = {} } = req.body;

    if (!message) {
      return res.status(400).json({
        error: 'Message is required',
        usage: 'POST /message { "message": "Hello", "options": {} }'
      });
    }

    const api = await initializeAPI();
    const response = await api.sendMessage(message, options);

    res.json({
      success: true,
      response,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Message error:', error.message);

    if (error.message.includes('Authentication error') ||
        error.message.includes('status: 401') ||
        error.message.includes('status: 403') ||
        error.message.includes('status: 429')) {
      return res.status(401).json({
        error: 'Authentication failed',
        message: error.message,
        suggestion: 'Run: npm run cookies:refresh'
      });
    }

    res.status(500).json({
      error: 'Message failed',
      message: error.message
    });
  }
});

/**
 * Continue chat with history
 * POST /continue
 */
app.post('/continue', async (req, res) => {
  try {
    const { message, history, options = {} } = req.body;

    if (!message || !history) {
      return res.status(400).json({
        error: 'Message and history are required',
        usage: 'POST /continue { "message": "Hello", "history": [...], "options": {} }'
      });
    }

    const api = await initializeAPI();
    const response = await api.continueChat(message, history, options);

    res.json({
      success: true,
      response,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Continue chat error:', error.message);

    if (error.message.includes('Authentication error') ||
        error.message.includes('status: 401') ||
        error.message.includes('status: 403') ||
        error.message.includes('status: 429')) {
      return res.status(401).json({
        error: 'Authentication failed',
        message: error.message,
        suggestion: 'Run: npm run cookies:refresh'
      });
    }

    res.status(500).json({
      error: 'Continue chat failed',
      message: error.message
    });
  }
});

/**
 * Refresh cookies manually
 * POST /refresh-cookies
 */
app.post('/refresh-cookies', async (req, res) => {
  try {
    const api = await initializeAPI();
    const result = await api.refreshCookies({
      headless: req.body.headless !== false, // Default: true (headless)
      waitTime: req.body.waitTime || 15000,
      autoExtract: req.body.autoExtract !== false
    });

    if (result.success) {
      // Reinitialize API with new cookies
      apiInstance = null;
      await initializeAPI();

      res.json({
        success: true,
        message: 'Cookies refreshed successfully',
        cookieCount: result.cookieCount,
        apiKeyFound: !!result.apiKey,
        timestamp: new Date().toISOString()
      });
    } else {
      res.status(500).json({
        error: 'Cookie refresh failed',
        message: result.error
      });
    }

  } catch (error) {
    console.error('Cookie refresh error:', error.message);
    res.status(500).json({
      error: 'Cookie refresh failed',
      message: error.message
    });
  }
});

/**
 * Get available models and tools
 * GET /info
 */
app.get('/info', async (req, res) => {
  try {
    const api = await initializeAPI();

    res.json({
      models: api.getAvailableModels(),
      tools: api.getAvailableTools(),
      features: [
        'multipart-form-data',
        'automatic-cookie-management',
        'chat-history',
        'tool-integration',
        'gemini-2.5-flash'
      ],
      version: '2.0.0',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    res.status(500).json({
      error: 'Info retrieval failed',
      message: error.message
    });
  }
});

/**
 * Error handling middleware
 */
app.use((error, req, res, next) => {
  console.error('Unhandled error:', error);
  res.status(500).json({
    error: 'Internal server error',
    message: error.message
  });
});

/**
 * 404 handler
 */
app.use((req, res) => {
  res.status(404).json({
    error: 'Endpoint not found',
    availableEndpoints: [
      'GET /health',
      'GET /status',
      'GET /info',
      'POST /chat',
      'POST /message',
      'POST /continue',
      'POST /refresh-cookies'
    ]
  });
});

// Start server
app.listen(PORT, async () => {
  console.log(`🚀 DeepAI API Server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`📋 API info: http://localhost:${PORT}/info`);
  console.log(`💬 Chat endpoint: POST http://localhost:${PORT}/chat`);
  console.log('');

  // Initialize API on startup
  try {
    await initializeAPI();
  } catch (error) {
    console.error('❌ API initialization failed:', error.message);
    console.log('⚠️  Server will continue running, API calls may fail');
  }
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('🛑 SIGINT received, shutting down gracefully');
  process.exit(0);
});

export default app;