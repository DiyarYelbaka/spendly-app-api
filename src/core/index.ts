/**
 * Core Module Index (Barrel Exports)
 * 
 * Bu dosya, core modülündeki tüm bileşenleri dışarıya açan (export) bir "barrel" dosyasıdır.
 * 
 * Barrel Export Nedir?
 * Barrel export, bir klasördeki tüm dosyaları tek bir yerden export etmektir.
 * Bu sayede:
 * - Import'lar daha kısa olur (örneğin: import { X } from '../core' yerine import { X } from '../core/decorators/current-user.decorator')
 * - Kod daha okunabilir olur
 * - Dosya yapısı değişse bile import'lar aynı kalır
 * 
 * Bu Dosyanın Amacı:
 * 1. Core modülündeki tüm bileşenleri tek bir yerden export etmek
 * 2. Diğer modüllerin core bileşenlerine kolay erişmesini sağlamak
 * 3. Import'ları basitleştirmek
 * 
 * Kullanım:
 * import { PrismaService, CurrentUser, ErrorHandler } from '../core';
 * 
 * NOT: Bu dosya sadece export yapar, kod içermez.
 */

/**
 * Database (Veritabanı)
 * 
 * Prisma ve repository bileşenleri
 */
export * from './prisma/prisma.module';
export * from './prisma/prisma.service';
export * from './database/base.repository';
export * from './database/repositories';

/**
 * DTOs (Data Transfer Objects)
 * 
 * Veri transfer nesneleri
 */
export * from './dto/success-response.dto';
export * from './dto/paginated-response.dto';
export * from './dto/pagination-query.dto';

/**
 * Utils (Yardımcı Fonksiyonlar)
 * 
 * Ortak işlemler için yardımcı fonksiyonlar
 */
export * from './utils/pagination.util';
export * from './utils/entity-mapper.util';
export * from './utils/error-handler.util';

/**
 * Decorators (Süsleyiciler)
 * 
 * Özel decorator'lar
 */
export * from './decorators/current-user.decorator';

/**
 * Filters (Filtreler)
 * 
 * Exception filter'ları
 */
export * from './filters/http-exception.filter';

/**
 * Interceptors (Ara Katmanlar)
 * 
 * Response interceptor'ları
 */
export * from './interceptors/transform.interceptor';

/**
 * Exceptions (İstisnalar)
 * 
 * Özel exception sınıfları
 */
export * from './exceptions/error-codes.enum';
export * from './exceptions/base.exception';
export * from './exceptions/validation.exception';
export * from './exceptions/business.exception';

/**
 * Types (Tipler)
 * 
 * TypeScript tip tanımları
 */
export * from './types/user.types';

/**
 * Constants (Sabit Değerler)
 * 
 * Mesaj anahtarları ve diğer sabit değerler
 */
export * from './constants/message-keys.constant';
export * from './constants/category.constants';

/**
 * Middleware (Ara Katmanlar)
 * 
 * HTTP middleware'leri
 */
export * from './middleware/jwt-user.middleware';

