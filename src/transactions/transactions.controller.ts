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
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

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
    @CurrentUser() user: any,
  ) {
    const result = await this.transactionsService.createIncome(dto, user.id);
    return {
      success: true,
      message_key: 'TRANSACTION_CREATED',
      message: 'Gelir başarıyla eklendi',
      data: result,
    };
  }

  @Post('expense')
  @ApiOperation({ summary: 'Gider ekle' })
  @ApiResponse({ status: 201, description: 'Gider başarıyla eklendi' })
  @ApiResponse({ status: 400, description: 'Validation hatası veya geçersiz kategori' })
  async createExpense(
    @Body() dto: CreateTransactionDto,
    @CurrentUser() user: any,
  ) {
    const result = await this.transactionsService.createExpense(dto, user.id);
    return {
      success: true,
      message_key: 'TRANSACTION_CREATED',
      message: 'Gider başarıyla eklendi',
      data: result,
    };
  }

  @Get()
  @ApiOperation({ summary: 'İşlemleri listele' })
  @ApiResponse({ status: 200, description: 'İşlemler listelendi' })
  async findAll(@Query() query: any, @CurrentUser() user: any) {
    const result = await this.transactionsService.findAll(user.id, query);
    return {
      success: true,
      data: {
        transactions: result.transactions,
        pagination: result.pagination,
      },
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Tek işlem detayı' })
  @ApiResponse({ status: 200, description: 'İşlem detayı' })
  @ApiResponse({ status: 404, description: 'İşlem bulunamadı' })
  async findOne(@Param('id') id: string, @CurrentUser() user: any) {
    const result = await this.transactionsService.findOne(id, user.id);
    return {
      success: true,
      data: result,
    };
  }

  @Put(':id')
  @ApiOperation({ summary: 'İşlem güncelle' })
  @ApiResponse({ status: 200, description: 'İşlem başarıyla güncellendi' })
  @ApiResponse({ status: 404, description: 'İşlem bulunamadı' })
  @ApiResponse({ status: 400, description: 'Validation hatası' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateTransactionDto,
    @CurrentUser() user: any,
  ) {
    const result = await this.transactionsService.update(id, dto, user.id);
    return {
      success: true,
      message_key: 'TRANSACTION_UPDATED',
      message: 'İşlem başarıyla güncellendi',
      data: result,
    };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'İşlem sil' })
  @ApiResponse({ status: 200, description: 'İşlem başarıyla silindi' })
  @ApiResponse({ status: 404, description: 'İşlem bulunamadı' })
  async remove(@Param('id') id: string, @CurrentUser() user: any) {
    await this.transactionsService.remove(id, user.id);
    return {
      success: true,
      message_key: 'TRANSACTION_DELETED',
      message: 'İşlem başarıyla silindi',
      data: null,
    };
  }
}

