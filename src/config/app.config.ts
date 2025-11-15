/**
 * Application Configuration
 * Centralized configuration for the application
 * 
 * Hassas olmayan değerler appConfig.js'den alınır.
 * Hassas değerler (şifreler, API key'ler) .env dosyasından alınır.
 */

import appConfig from '../../appConfig.mjs';

export default () => ({
  app: {
    name: 'Spendly API',
    version: '1.0.0',
    port: parseInt(process.env.PORT || String(appConfig.app.port), 10),
    env: process.env.NODE_ENV || appConfig.app.env,
  },
  cors: {
    origin: process.env.CORS_ORIGIN || appConfig.cors.origin,
    credentials: appConfig.cors.credentials,
  },
  swagger: {
    title: appConfig.swagger.title,
    description: appConfig.swagger.description,
    version: appConfig.swagger.version,
    path: appConfig.swagger.path,
  },
});

