import { DynamicModule, Module } from '@nestjs/common';
import { StripeService } from './stripe.service';
import { ConfigService } from '@nestjs/config';
import { Envs } from 'src/config/envs.interface';
import { StripeController } from './stripe.controller';

@Module({})
export class StripeModule {
  static register(): DynamicModule {
    return {
      module: StripeModule,
      controllers: [StripeController],
      providers: [
        {
          provide: 'STRIPE_API_KEY',
          useFactory: (configService: ConfigService<Envs>) => {
            return configService.getOrThrow<string>('STRIPE_API_KEY');
          },
          inject: [ConfigService],
        },
        StripeService,
      ],
    };
  }
}
