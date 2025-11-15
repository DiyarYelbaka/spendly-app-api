/**
 * JWT Configuration
 * JWT authentication configuration
 * 
 * Hassas olmayan değerler (expiresIn, refreshExpiresIn) appConfig.js'den alınır.
 * Hassas değer (secret) .env dosyasından alınır.
 */

// eslint-disable-next-line @typescript-eslint/no-var-requires
const appConfig = require('../../appConfig.js');

export default () => ({
  jwt: {
    secret: process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production',
    expiresIn: process.env.JWT_EXPIRES_IN || appConfig.jwt.expiresIn,
    refreshExpiresIn: appConfig.jwt.refreshExpiresIn,
  },
});

