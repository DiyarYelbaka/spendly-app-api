import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma.service';

/**
 * JWT User Middleware
 * Extracts user information from JWT token and attaches it to request
 * Works as optional authentication - if token exists, user is attached
 * If token doesn't exist or invalid, request continues without user
 */
@Injectable()
export class JwtUserMiddleware implements NestMiddleware {
  private readonly logger = new Logger(JwtUserMiddleware.name);

  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {}

  async use(req: Request, res: Response, next: NextFunction) {
    try {
      // Extract token from Authorization header
      const authHeader = req.headers.authorization;
      
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        // No token provided - continue without user
        return next();
      }

      const token = authHeader.substring(7); // Remove 'Bearer ' prefix

      // Verify and decode token
      const payload = this.jwtService.verify(token, {
        secret: this.configService.get<string>('JWT_SECRET') || 'your-super-secret-jwt-key-change-this-in-production',
      });

      // Fetch user from database
      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
        select: {
          id: true,
          email: true,
          name: true,
          createdAt: true,
        },
      });

      if (user) {
        // Attach user to request object
        (req as any).user = user;
        
        // Optional: Add user ID to request headers for logging
        req.headers['x-user-id'] = user.id;
      }
    } catch (error) {
      // Token invalid or expired - continue without user
      // Don't throw error, let guards handle authentication
      this.logger.debug(`JWT token validation failed: ${error.message}`);
    }

    next();
  }
}

