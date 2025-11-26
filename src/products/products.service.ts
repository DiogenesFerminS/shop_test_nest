import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { Repository } from 'typeorm';
import { CreateProductDto, UpdateProductDto } from './dto';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { ResponseMessageType } from 'src/common/interfaces';
import { handleError } from 'src/common/helpers/handlerErrors';

@Injectable()
export class ProductsService {
  private handlerError: (error: unknown) => never;

  constructor(
    @InjectRepository(Product)
    private readonly productsRepository: Repository<Product>,
  ) {
    this.handlerError = handleError;
  }
  async create(createProductDto: CreateProductDto) {
    try {
      const newProduct = this.productsRepository.create(createProductDto);

      return await this.productsRepository.save(newProduct);
    } catch (error: unknown) {
      this.handlerError(error);
    }
  }

  findAll(paginationDto: PaginationDto) {
    const { limit = 10, page = 1 } = paginationDto;
    return this.productsRepository.find({
      take: limit,
      skip: (page - 1) * limit,
      where: { available: true },
    });
  }

  async findOne(id: string) {
    const product = await this.productsRepository.findOneBy({ product_id: id });
    if (!product) {
      throw new BadRequestException({
        ok: false,
        message: ResponseMessageType.NOT_FOUND,
      });
    }
    return product;
  }

  async update(id: string, updateProductDto: UpdateProductDto) {
    const product = await this.findOne(id);
    const newProduct = {
      ...product,
      ...updateProductDto,
    };

    try {
      return await this.productsRepository.save(newProduct);
    } catch (error) {
      this.handlerError(error);
    }
  }

  async remove(id: string) {
    const product = await this.findOne(id);
    product.available = false;

    try {
      await this.productsRepository.save(product);
      return product;
    } catch (error) {
      this.handlerError(error);
    }
  }
}
