/**
 * Configuration Index
 * Exports all configuration modules
 */

import appConfig from './app.config';
import databaseConfig from './database.config';
import jwtConfig from './jwt.config';
import openaiConfig from './openai.config';

export default {
  ...appConfig(),
  ...databaseConfig(),
  ...jwtConfig(),
  ...openaiConfig(),
};

export { appConfig, databaseConfig, jwtConfig, openaiConfig };

