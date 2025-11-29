import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';
import Stripe from 'stripe';

@Injectable()
export class StripeService {
  private stripeClient: Stripe;
  private readonly logger = new Logger('StripeService');

  constructor(@Inject('STRIPE_API_KEY') private readonly stripeApiKey: string) {
    this.stripeClient = new Stripe(stripeApiKey);
  }

  async createPaymentIntent() {
    const paymentIntent = await this.stripeClient.paymentIntents.create({
      amount: 2000,
      currency: 'usd',
      automatic_payment_methods: {
        enabled: true,
      },
    });

    const { client_secret } = paymentIntent;
    return client_secret;
  }

  buildEvent(rawBody: Buffer, signature: string, endPointSecret: string) {
    let event: Stripe.Event;

    try {
      event = this.stripeClient.webhooks.constructEvent(
        rawBody,
        signature,
        endPointSecret,
      );

      return event;
    } catch (error) {
      this.logger.error(
        `⚠️ Webhook signature verification failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );

      throw new BadRequestException({
        ok: false,
        message: 'Unexpected Error',
      });
    }
  }
}
