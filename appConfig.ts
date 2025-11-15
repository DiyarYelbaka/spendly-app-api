/**
 * Application Configuration
 * 
 * Bu dosya, hassas olmayan uygulama yapılandırma değerlerini içerir.
 * Hassas bilgiler (şifreler, API key'ler, vb.) .env dosyasında tutulmalıdır.
 * 
 * Bu dosya git'e commit edilebilir çünkü hassas bilgi içermez.
 */

export default {
  // Application Settings
  app: {
    port: 3001,
    env: 'development',
  },

  // CORS Configuration
  cors: {
    origin: 'http://localhost:3000',
    credentials: true,
  },

  // JWT Configuration (non-sensitive)
  jwt: {
    expiresIn: '7d',
    refreshExpiresIn: '30d',
  },

  // OpenAI Configuration (non-sensitive)
  openai: {
    model: 'gpt-4o-mini',
    enabled: true,
    confidenceThreshold: 0.7,
    timeout: 5000, // milliseconds
  },

  // Email Configuration (non-sensitive)
  email: {
    fromName: 'Spendly',
    smtp: {
      host: 'smtp.gmail.com',
      port: 465, // SSL port - Railway'da daha güvenilir
      secure: true, // true for 465, false for other ports
    },
  },

  // Swagger Configuration
  swagger: {
    title: 'Spendly API',
    description: 'Gelir-Gider Takip API',
    version: '1.0',
    path: 'api/docs',
  },

  // Password Reset Configuration
  passwordReset: {
    codeExpiresIn: '15m', // 15 dakika
    maxAttempts: 5, // Maksimum deneme sayısı
    rateLimitMinutes: 5, // Rate limiting (5 dakikada 1 istek)
  },
};

