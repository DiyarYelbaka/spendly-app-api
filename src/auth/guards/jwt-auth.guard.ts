import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * JWT Auth Guard
 * Protects routes requiring authentication
 * If middleware already attached user, uses it (optimization)
 * Otherwise, uses Passport JWT Strategy
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    
    // If middleware already attached user, skip Passport validation (optimization)
    // This prevents duplicate token verification and database queries
    if (request.user) {
      return true;
    }

    // Otherwise, use Passport JWT Strategy
    return super.canActivate(context);
  }
}

