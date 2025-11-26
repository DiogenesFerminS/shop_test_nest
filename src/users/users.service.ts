import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { handleError } from 'src/common/helpers/handlerErrors';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { ResponseMessageType } from 'src/common/interfaces';

@Injectable()
export class UsersService {
  private readonly handlerError: (error: unknown) => never;

  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
  ) {
    this.handlerError = handleError;
  }

  async create(createUserDto: CreateUserDto) {
    const newProduct = this.userRepository.create(createUserDto);

    try {
      await this.userRepository.save(newProduct);
      return newProduct;
    } catch (error) {
      this.handlerError(error);
    }
  }

  async findAll(paginationDto: PaginationDto) {
    const { limit = 10, page = 1 } = paginationDto;

    return await this.userRepository.find({
      where: {
        isActive: true,
      },
      take: limit,
      skip: (page - 1) * limit,
    });
  }

  async findOne(id: string) {
    const user = await this.userRepository.findOneBy({ user_id: id });
    if (!user) {
      throw new NotFoundException({
        ok: false,
        message: ResponseMessageType.NOT_FOUND,
      });
    }

    return user;
  }

  async findOneByTerm(term: string) {
    const user = await this.userRepository.findOne({
      where: [{ email: term }, { username: term }],
    });

    return user;
  }
}
