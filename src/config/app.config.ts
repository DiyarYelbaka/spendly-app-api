/**
 * Application Configuration
 * Centralized configuration for the application
 */

export default () => ({
  app: {
    name: 'Spendly API',
    version: '1.0.0',
    port: parseInt(process.env.PORT || '3001', 10),
    env: process.env.NODE_ENV || 'development',
  },
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true,
  },
  swagger: {
    title: 'Spendly API',
    description: 'Gelir-Gider Takip API',
    version: '1.0',
    path: 'api/docs',
  },
});

