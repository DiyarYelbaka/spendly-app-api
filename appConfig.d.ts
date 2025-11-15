/**
 * Type definitions for appConfig.mjs
 */

declare const appConfig: {
  app: {
    port: number;
    env: string;
  };
  cors: {
    origin: string;
    credentials: boolean;
  };
  jwt: {
    expiresIn: string;
    refreshExpiresIn: string;
  };
  openai: {
    model: string;
    enabled: boolean;
    confidenceThreshold: number;
    timeout: number;
  };
  email: {
    fromName: string;
    smtp: {
      host: string;
      port: number;
      secure: boolean;
    };
  };
  swagger: {
    title: string;
    description: string;
    version: string;
    path: string;
  };
  passwordReset: {
    codeExpiresIn: string;
    maxAttempts: number;
    rateLimitMinutes: number;
  };
};

export default appConfig;

