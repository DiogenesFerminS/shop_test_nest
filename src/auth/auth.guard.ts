import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import type { Request } from 'express';
import { ResponseMessageType } from 'src/common/interfaces';
import { JwtPaylod } from 'src/common/interfaces/jwt-payload.interface';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context
      .switchToHttp()
      .getRequest<Request & { user: { id: string; username: string } }>();

    const authHeader = request.headers.authorization;

    if (!authHeader) {
      throw new UnauthorizedException({
        ok: false,
        error: 'No authorization header provided',
        message: ResponseMessageType.UNAUTHORIZED,
      });
    }

    const [type, token] = authHeader.split(' ');

    if (type !== 'Bearer') {
      throw new UnauthorizedException({
        ok: false,
        error: 'Invalid token type',
        message: ResponseMessageType.UNAUTHORIZED,
      });
    }

    if (!token) {
      throw new UnauthorizedException({
        ok: false,
        error: 'No token provided',
        message: ResponseMessageType.UNAUTHORIZED,
      });
    }

    try {
      const payload: JwtPaylod = await this.jwtService.verifyAsync(token, {
        secret: this.configService.getOrThrow('JWT_SECRET'),
      });

      request.user = { id: payload.sub, username: payload.username };
    } catch (error: unknown) {
      throw new UnauthorizedException({
        ok: false,
        error:
          error instanceof Error
            ? (error.message ?? 'Invalid token')
            : 'Invalid token',
        message: ResponseMessageType.UNAUTHORIZED,
      });
    }
    return true;
  }
}
