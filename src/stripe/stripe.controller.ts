import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  Param,
  Post,
  Query,
  Req,
  Res,
  UsePipes,
} from '@nestjs/common';
import { StripeService } from './stripe.service';
import Stripe from 'stripe';
import type { Request, Response } from 'express';
import { ResponseMessageType } from 'src/common/interfaces';
import {
  type CreateCustomerDto,
  createCustomerSchema,
} from './dto/create-customer.dto';
import { ZodValidationPipe } from 'src/common/pipes/zodValidation.pipe';
import {
  paginationSchema,
  type PaginationDto,
} from 'src/common/dto/pagination.dto';

@Controller('stripe')
export class StripeController {
  constructor(private readonly stripeService: StripeService) {}

  @Post('create-payment-intent')
  async createPaymentIntent() {
    const client_secret = await this.stripeService.createPaymentIntent();
    return { client_secret };
  }

  @Post('webhook')
  webhook(
    @Req() request: Request,
    @Res() response: Response,
    @Headers('stripe-signature') signature: string,
  ) {
    console.log('Webhook called');
    const endPointSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!signature || !endPointSecret) {
      throw new BadRequestException({
        ok: false,
        message: 'Invalid signature or secret',
      });
    }

    let stripeEvent: Stripe.Event;

    try {
      stripeEvent = this.stripeService.buildEvent(
        request.body as Buffer,
        signature,
        endPointSecret,
      );
    } catch (error) {
      return response.status(400).json(error);
    }

    switch (stripeEvent.type) {
      case 'payment_intent.succeeded': {
        const paymentIntent = stripeEvent.data.object;
        console.log(paymentIntent);
        break;
      }
      case 'payment_method.attached': {
        const paymentMethod = stripeEvent.data.object;
        console.log(paymentMethod);
        break;
      }
      default:
        console.log(`Unhandled event type ${stripeEvent.type}`);
    }

    response.json({ received: true });
  }

  @Get('balance')
  async getBalance() {
    const balance = await this.stripeService.recoverBalance();

    return {
      ok: true,
      message: ResponseMessageType.SUCCESS,
      data: balance,
    };
  }

  @Post('customers')
  @UsePipes(new ZodValidationPipe(createCustomerSchema))
  async createCustomer(
    @Res({ passthrough: true }) response: Response,
    @Body() createCustomerDto: CreateCustomerDto,
  ) {
    const customer = await this.stripeService.createCustomer(createCustomerDto);

    response.status(201);

    return {
      ok: true,
      message: ResponseMessageType.CREATED,
      data: customer,
    };
  }

  @Get('customers')
  async getAllCustomers(
    @Query(new ZodValidationPipe(paginationSchema))
    paginationDto: PaginationDto,
  ) {
    const customers = await this.stripeService.getAllCustomers(paginationDto);

    return {
      ok: true,
      message: ResponseMessageType.SUCCESS,
      data: customers,
    };
  }

  @Get('customers/:id')
  async getOneCustomers(@Param('id') id: string) {
    const customer = await this.stripeService.getOneCustomer(id);

    return {
      ok: true,
      message: ResponseMessageType.SUCCESS,
      data: customer,
    };
  }

  @Delete('customers/:id')
  async deleteCustomer(@Param('id') id: string) {
    const resp = await this.stripeService.deleteCustomer(id);

    return {
      ok: true,
      message: ResponseMessageType.SUCCESS,
      data: resp,
    };
  }
}
