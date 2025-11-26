import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UsePipes,
  ParseUUIDPipe,
  Query,
  Res,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { type CreateUserDto, createUserSchema } from './dto/create-user.dto';
import { ZodValidationPipe } from 'src/common/pipes/zodValidation.pipe';
import {
  paginationSchema,
  type PaginationDto,
} from 'src/common/dto/pagination.dto';
import type { Response } from 'express';
import { ResponseMessageType } from 'src/common/interfaces';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @UsePipes(new ZodValidationPipe(createUserSchema))
  async create(
    @Res({ passthrough: true }) response: Response,
    @Body() createUserDto: CreateUserDto,
  ) {
    const newUser = await this.usersService.create(createUserDto);

    response.status(201);

    return {
      ok: true,
      message: ResponseMessageType.CREATED,
      data: newUser,
    };
  }

  @Get(':id')
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    const user = await this.usersService.findOne(id);

    return {
      ok: true,
      message: ResponseMessageType.SUCCESS,
      data: user,
    };
  }

  @Get()
  async findAll(
    @Query(new ZodValidationPipe(paginationSchema))
    paginationDto: PaginationDto,
  ) {
    const users = await this.usersService.findAll(paginationDto);

    return {
      ok: true,
      message: ResponseMessageType.SUCCESS,
      data: users,
    };
  }
}
