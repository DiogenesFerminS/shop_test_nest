import { Controller, Get, Res } from '@nestjs/common';
import type { Response } from 'express';

@Controller()
export class AppController {
  constructor() {}

  @Get()
  getHello(@Res() response: Response) {
    return response.status(200).json({
      ok: true,
      message: 'Shop API 0.1v by Diogenes Fermin',
    });
  }
}
