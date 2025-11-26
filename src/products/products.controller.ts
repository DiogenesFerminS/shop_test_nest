import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UsePipes,
  Query,
  Res,
  ParseUUIDPipe,
  UseGuards,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { ZodValidationPipe } from 'src/common/pipes/zodValidation.pipe';
import {
  type CreateProductDto,
  createProductSchema,
  type UpdateProductDto,
  updateProductSchema,
} from './dto';
import {
  paginationSchema,
  type PaginationDto,
} from 'src/common/dto/pagination.dto';
import { ResponseMessageType } from 'src/common/interfaces';
import { type Response } from 'express';
import { AuthGuard } from 'src/auth/auth.guard';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @UsePipes(new ZodValidationPipe(createProductSchema))
  async create(
    @Res({ passthrough: true }) response: Response,
    @Body() createProductDto: CreateProductDto,
  ) {
    const newProduct = await this.productsService.create(createProductDto);

    response.status(201);

    return {
      ok: true,
      message: ResponseMessageType.CREATED,
      data: newProduct,
    };
  }

  @Get()
  @UseGuards(AuthGuard)
  findAll(
    @Query(new ZodValidationPipe(paginationSchema))
    paginationDto: PaginationDto,
  ) {
    return this.productsService.findAll(paginationDto);
  }

  @Get(':id')
  async findOne(
    @Res({ passthrough: true }) response: Response,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    const product = await this.productsService.findOne(id);
    response.status(200);
    return {
      ok: true,
      message: ResponseMessageType.SUCCESS,
      data: product,
    };
  }

  @Patch(':id')
  async update(
    @Res({ passthrough: true }) response: Response,
    @Param('id', ParseUUIDPipe) id: string,
    @Body(new ZodValidationPipe(updateProductSchema))
    updateProductDto: UpdateProductDto,
  ) {
    const updatedProduct = await this.productsService.update(
      id,
      updateProductDto,
    );

    return {
      ok: true,
      message: ResponseMessageType.UPDATED,
      data: updatedProduct,
    };
  }

  @Delete(':id')
  async remove(
    @Res({ passthrough: true }) response: Response,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    const productDeleted = await this.productsService.remove(id);

    return {
      ok: true,
      message: ResponseMessageType.DELETED,
      data: productDeleted,
    };
  }
}
