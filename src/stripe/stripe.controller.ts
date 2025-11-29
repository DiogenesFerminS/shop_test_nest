import {
  BadRequestException,
  Controller,
  Headers,
  Post,
  Req,
  Res,
} from '@nestjs/common';
import { StripeService } from './stripe.service';
import Stripe from 'stripe';
import type { Request, Response } from 'express';

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
}
