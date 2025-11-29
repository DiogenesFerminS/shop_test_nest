import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { AppController } from './app.controller';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { validationEnvs } from './config/validationEnvs.schema';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Envs } from './config/envs.interface';
import { ProductsModule } from './products/products.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { StripeModule } from './stripe/stripe.module';
import * as express from 'express';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: validationEnvs,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService<Envs>) => ({
        type: 'postgres',
        host: configService.getOrThrow('POSTGRES_HOST'),
        port: configService.getOrThrow('POSTGRES_PORT'),
        username: configService.getOrThrow('POSTGRES_USER'),
        password: configService.getOrThrow('POSTGRES_PASS'),
        database: configService.getOrThrow('POSTGRES_DB'),
        autoLoadEntities: true,
        synchronize: true,
      }),
      inject: [ConfigService],
    }),
    ProductsModule,
    UsersModule,
    AuthModule,
    StripeModule.register(),
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(express.json())
      .exclude({ path: 'stripe/webhook', method: RequestMethod.POST })
      .forRoutes('*');

    consumer
      .apply(express.raw({ type: 'application/json' }))
      .forRoutes({ path: 'stripe/webhook', method: RequestMethod.POST });
  }
}
