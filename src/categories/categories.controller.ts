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
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { CategoryQueryDto } from './dto/category-query.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser, UserPayload } from '../core';

@ApiTags('categories')
@Controller('categories')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Post()
  @ApiOperation({ summary: 'Yeni kategori oluştur' })
  @ApiResponse({ status: 201, description: 'Kategori başarıyla oluşturuldu' })
  @ApiResponse({ status: 400, description: 'Validation hatası' })
  @ApiResponse({ status: 409, description: 'Kategori adı zaten mevcut' })
  async create(
    @Body() dto: CreateCategoryDto,
    @CurrentUser() user: UserPayload,
  ) {
    return await this.categoriesService.create(dto, user.id);
  }

  @Get()
  @ApiOperation({ summary: 'Kategorileri listele' })
  @ApiResponse({ status: 200, description: 'Kategoriler listelendi' })
  async findAll(
    @Query() query: CategoryQueryDto,
    @CurrentUser() user: UserPayload,
  ) {
    return await this.categoriesService.findAll(user.id, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Tek kategori detayı' })
  @ApiResponse({ status: 200, description: 'Kategori detayı' })
  @ApiResponse({ status: 404, description: 'Kategori bulunamadı' })
  async findOne(
    @Param('id') id: string,
    @Query('include_stats') includeStats: string,
    @CurrentUser() user: UserPayload,
  ) {
    return await this.categoriesService.findOne(
      id,
      user.id,
      includeStats === 'true',
    );
  }

  @Put(':id')
  @ApiOperation({ summary: 'Kategori güncelle' })
  @ApiResponse({ status: 200, description: 'Kategori başarıyla güncellendi' })
  @ApiResponse({ status: 404, description: 'Kategori bulunamadı' })
  @ApiResponse({ status: 400, description: 'Validation hatası' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateCategoryDto,
    @CurrentUser() user: UserPayload,
  ) {
    return await this.categoriesService.update(id, dto, user.id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Kategori sil' })
  @ApiResponse({ status: 200, description: 'Kategori başarıyla silindi' })
  @ApiResponse({ status: 404, description: 'Kategori bulunamadı' })
  @ApiResponse({ status: 403, description: 'Kategori silinemez' })
  async remove(@Param('id') id: string, @CurrentUser() user: UserPayload) {
    return await this.categoriesService.remove(id, user.id);
  }
}

