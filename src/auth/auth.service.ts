import { BadRequestException, Injectable } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { LoginUserDto } from './dto/login.dto';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async login(loginUserDto: LoginUserDto) {
    const { identifier, password: password_input } = loginUserDto;

    const user = await this.usersService.findOneByTerm(identifier);

    if (!user) {
      throw new BadRequestException({
        ok: false,
        message: 'Invalid credentials (Email or Username)',
      });
    }

    if (password_input !== user.password) {
      throw new BadRequestException({
        ok: false,
        message: 'Invalid credentials (password)',
      });
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _, ...rest } = user;
    const payload = { sub: user.user_id, username: user.username };
    return {
      rest,
      access_token: await this.jwtService.signAsync(payload),
    };
  }
}
