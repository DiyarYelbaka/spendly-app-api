import { Controller, Get, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AnalyticsService } from './analytics.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser, UserPayload } from '../core';

@ApiTags('analytics')
@Controller('analytics')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('dashboard')
  @ApiOperation({ summary: 'Dashboard verileri' })
  @ApiResponse({ status: 200, description: 'Dashboard verileri alındı' })
  async getDashboard(@CurrentUser() user: UserPayload) {
    return await this.analyticsService.getDashboard(user.id);
  }

  @Get('summary')
  @ApiOperation({ summary: 'Finansal özet' })
  @ApiResponse({ status: 200, description: 'Finansal özet alındı' })
  async getSummary(@CurrentUser() user: UserPayload) {
    return await this.analyticsService.getSummary(user.id);
  }
}

