/**
 * Configuration Index
 * Exports all configuration modules
 */

import appConfig from './app.config';
import databaseConfig from './database.config';
import jwtConfig from './jwt.config';

export default {
  ...appConfig(),
  ...databaseConfig(),
  ...jwtConfig(),
};

export { appConfig, databaseConfig, jwtConfig };

