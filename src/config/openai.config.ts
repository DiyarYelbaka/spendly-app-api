/**
 * OpenAI Configuration
 * 
 * OpenAI API yapılandırması için config dosyası.
 * Environment variable'lardan OpenAI API key ve model bilgilerini alır.
 */

import { registerAs } from '@nestjs/config';

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
   * 
   * Varsayılan: gpt-4o-mini
   */
  model: process.env.OPENAI_MODEL || 'gpt-4o-mini',

  /**
   * enabled: AI parsing aktif mi?
   * 
   * Environment variable'dan alınır: AI_PARSING_ENABLED
   * 
   * Varsayılan: true
   */
  enabled: process.env.AI_PARSING_ENABLED !== 'false',

  /**
   * confidenceThreshold: Güven skoru eşiği
   * 
   * Bu değerin altındaki confidence skorlarında kullanıcıya onay sorulur.
   * Environment variable'dan alınır: AI_CONFIDENCE_THRESHOLD
   * 
   * Varsayılan: 0.7
   */
  confidenceThreshold: parseFloat(process.env.AI_CONFIDENCE_THRESHOLD || '0.7'),

  /**
   * timeout: API çağrısı timeout süresi (milisaniye)
   * 
   * OpenAI API çağrısının maksimum süresi.
   * 
   * Varsayılan: 5000ms (5 saniye)
   */
  timeout: parseInt(process.env.OPENAI_TIMEOUT || '5000', 10),
}));

