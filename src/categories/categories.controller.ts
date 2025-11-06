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
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

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
  async create(
    @Body() dto: CreateCategoryDto,
    @CurrentUser() user: any,
  ) {
    const result = await this.categoriesService.create(dto, user.id);
    return {
      success: true,
      message_key: 'CATEGORY_CREATED',
      message: 'Kategori başarıyla oluşturuldu',
      data: result,
    };
  }

  @Get()
  @ApiOperation({ summary: 'Kategorileri listele' })
  @ApiResponse({ status: 200, description: 'Kategoriler listelendi' })
  async findAll(@Query() query: any, @CurrentUser() user: any) {
    const result = await this.categoriesService.findAll(user.id, query);
    return {
      success: true,
      data: {
        categories: result.categories,
        pagination: result.pagination,
      },
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Tek kategori detayı' })
  @ApiResponse({ status: 200, description: 'Kategori detayı' })
  @ApiResponse({ status: 404, description: 'Kategori bulunamadı' })
  async findOne(
    @Param('id') id: string,
    @Query('include_stats') includeStats: string,
    @CurrentUser() user: any,
  ) {
    const result = await this.categoriesService.findOne(
      id,
      user.id,
      includeStats === 'true',
    );
    return {
      success: true,
      data: result,
    };
  }

  @Put(':id')
  @ApiOperation({ summary: 'Kategori güncelle' })
  @ApiResponse({ status: 200, description: 'Kategori başarıyla güncellendi' })
  @ApiResponse({ status: 404, description: 'Kategori bulunamadı' })
  @ApiResponse({ status: 400, description: 'Validation hatası' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateCategoryDto,
    @CurrentUser() user: any,
  ) {
    const result = await this.categoriesService.update(id, dto, user.id);
    return {
      success: true,
      message_key: 'CATEGORY_UPDATED',
      message: 'Kategori başarıyla güncellendi',
      data: result,
    };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Kategori sil' })
  @ApiResponse({ status: 200, description: 'Kategori başarıyla silindi' })
  @ApiResponse({ status: 404, description: 'Kategori bulunamadı' })
  @ApiResponse({ status: 403, description: 'Kategori silinemez' })
  async remove(@Param('id') id: string, @CurrentUser() user: any) {
    await this.categoriesService.remove(id, user.id);
    return {
      success: true,
      message_key: 'CATEGORY_DELETED',
      message: 'Kategori başarıyla silindi',
      data: null,
    };
  }
}

