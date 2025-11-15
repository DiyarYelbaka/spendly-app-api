/**
 * OpenAI Configuration
 * 
 * OpenAI API yapılandırması için config dosyası.
 * 
 * Hassas olmayan değerler (model, enabled, confidenceThreshold, timeout) appConfig.js'den alınır.
 * Hassas değer (apiKey) .env dosyasından alınır.
 */

import { registerAs } from '@nestjs/config';
import appConfig from '../../appConfig';

export default registerAs('openai', () => ({
  /**
   * apiKey: OpenAI API anahtarı
   * 
   * OpenAI API'ye erişmek için gereken API key.
   * Environment variable'dan alınır: OPENAI_API_KEY
   * 
   * ÖNEMLİ: Bu key'i güvenli tutun, asla commit etmeyin!
   */
  apiKey: process.env.OPENAI_API_KEY || '',

  /**
   * model: Kullanılacak OpenAI modeli
   * 
   * GPT-4o-mini kullanıyoruz (en ucuz ve yeterli performans).
   * Environment variable'dan alınır: OPENAI_MODEL
   * Yoksa appConfig.js'den alınır.
   * 
   * Varsayılan: gpt-4o-mini
   */
  model: process.env.OPENAI_MODEL || appConfig.openai.model,

  /**
   * enabled: AI parsing aktif mi?
   * 
   * Environment variable'dan alınır: AI_PARSING_ENABLED
   * Yoksa appConfig.js'den alınır.
   * 
   * Varsayılan: true
   */
  enabled: process.env.AI_PARSING_ENABLED !== undefined 
    ? process.env.AI_PARSING_ENABLED !== 'false'
    : appConfig.openai.enabled,

  /**
   * confidenceThreshold: Güven skoru eşiği
   * 
   * Bu değerin altındaki confidence skorlarında kullanıcıya onay sorulur.
   * Environment variable'dan alınır: AI_CONFIDENCE_THRESHOLD
   * Yoksa appConfig.js'den alınır.
   * 
   * Varsayılan: 0.7
   */
  confidenceThreshold: process.env.AI_CONFIDENCE_THRESHOLD
    ? parseFloat(process.env.AI_CONFIDENCE_THRESHOLD)
    : appConfig.openai.confidenceThreshold,

  /**
   * timeout: API çağrısı timeout süresi (milisaniye)
   * 
   * OpenAI API çağrısının maksimum süresi.
   * Environment variable'dan alınır: OPENAI_TIMEOUT
   * Yoksa appConfig.js'den alınır.
   * 
   * Varsayılan: 5000ms (5 saniye)
   */
  timeout: process.env.OPENAI_TIMEOUT
    ? parseInt(process.env.OPENAI_TIMEOUT, 10)
    : appConfig.openai.timeout,
}));

