import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { TransactionsService } from './transactions.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { TransactionQueryDto } from './dto/transaction-query.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser, UserPayload } from '../core';

@ApiTags('transactions')
@Controller('transactions')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Post('income')
  @ApiOperation({ summary: 'Gelir ekle' })
  @ApiResponse({ status: 201, description: 'Gelir başarıyla eklendi' })
  @ApiResponse({ status: 400, description: 'Validation hatası veya geçersiz kategori' })
  async createIncome(
    @Body() dto: CreateTransactionDto,
    @CurrentUser() user: UserPayload,
  ) {
    return await this.transactionsService.createIncome(dto, user.id);
  }

  @Post('expense')
  @ApiOperation({ summary: 'Gider ekle' })
  @ApiResponse({ status: 201, description: 'Gider başarıyla eklendi' })
  @ApiResponse({ status: 400, description: 'Validation hatası veya geçersiz kategori' })
  async createExpense(
    @Body() dto: CreateTransactionDto,
    @CurrentUser() user: UserPayload,
  ) {
    return await this.transactionsService.createExpense(dto, user.id);
  }

  @Get()
  @ApiOperation({ summary: 'İşlemleri listele' })
  @ApiResponse({ status: 200, description: 'İşlemler listelendi' })
  async findAll(
    @Query() query: TransactionQueryDto,
    @CurrentUser() user: UserPayload,
  ) {
    return await this.transactionsService.findAll(user.id, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Tek işlem detayı' })
  @ApiResponse({ status: 200, description: 'İşlem detayı' })
  @ApiResponse({ status: 404, description: 'İşlem bulunamadı' })
  async findOne(@Param('id') id: string, @CurrentUser() user: UserPayload) {
    return await this.transactionsService.findOne(id, user.id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'İşlem güncelle' })
  @ApiResponse({ status: 200, description: 'İşlem başarıyla güncellendi' })
  @ApiResponse({ status: 404, description: 'İşlem bulunamadı' })
  @ApiResponse({ status: 400, description: 'Validation hatası' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateTransactionDto,
    @CurrentUser() user: UserPayload,
  ) {
    return await this.transactionsService.update(id, dto, user.id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'İşlem sil' })
  @ApiResponse({ status: 200, description: 'İşlem başarıyla silindi' })
  @ApiResponse({ status: 404, description: 'İşlem bulunamadı' })
  async remove(@Param('id') id: string, @CurrentUser() user: UserPayload) {
    return await this.transactionsService.remove(id, user.id);
  }
}

