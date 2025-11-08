import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule, JwtUserMiddleware } from './core';
import { AuthModule } from './auth/auth.module';
import { CategoriesModule } from './categories/categories.module';
import { TransactionsModule } from './transactions/transactions.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { JwtModule } from '@nestjs/jwt';
import jwtConfig from './config/jwt.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    PrismaModule,
    AuthModule,
    CategoriesModule,
    TransactionsModule,
    AnalyticsModule,
    // JWT Module for middleware
    JwtModule.register({
      secret: jwtConfig().jwt.secret,
    }),
    // Modüller buraya eklenecek
  ],
  controllers: [AppController],
  providers: [AppService, JwtUserMiddleware],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    // Apply JWT User Middleware to all routes
    // This middleware extracts user info from JWT token and attaches to request
    consumer.apply(JwtUserMiddleware).forRoutes('*');
  }
}

