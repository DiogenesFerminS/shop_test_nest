import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';
import Stripe from 'stripe';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { ResponseMessageType } from 'src/common/interfaces';
import { PaginationDto } from 'src/common/dto/pagination.dto';

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
        message: ResponseMessageType.BAD_REQUEST,
        error: 'Unexpected Error',
      });
    }
  }

  async recoverBalance() {
    try {
      const balance: Stripe.Balance =
        await this.stripeClient.balance.retrieve();

      return balance;
    } catch (error) {
      this.logger.error(
        `Failure to restore balance: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
      throw new BadRequestException({
        ok: false,
        message: ResponseMessageType.BAD_REQUEST,
        error: 'Failure to restore balance',
      });
    }
  }

  async createCustomer(
    createCustomerDto: CreateCustomerDto,
  ): Promise<Stripe.Customer> {
    const { email, name } = createCustomerDto;

    try {
      const customer: Stripe.Customer =
        await this.stripeClient.customers.create({
          email,
          name,
        });

      return customer;
    } catch (error) {
      this.logger.error(
        `Failure to restore balance: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );

      throw new BadRequestException({
        ok: false,
        message: ResponseMessageType.BAD_REQUEST,
        error: 'Failure to create customer',
      });
    }
  }

  async getAllCustomers(paginationDto: PaginationDto) {
    const { limit = 10 } = paginationDto;
    try {
      const customers: Stripe.ApiList<Stripe.Customer> =
        await this.stripeClient.customers.list({
          limit,
        });

      return customers;
    } catch (error) {
      this.logger.error(
        `Failure to restore customer list: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );

      throw new BadRequestException({
        ok: false,
        message: ResponseMessageType.BAD_REQUEST,
        error: 'Failure to get customers list',
      });
    }
  }

  async getOneCustomer(id: string) {
    try {
      const customer: Stripe.Response<
        Stripe.Customer | Stripe.DeletedCustomer
      > = await this.stripeClient.customers.retrieve(id);

      return customer;
    } catch (error) {
      if (error instanceof Stripe.errors.StripeError) {
        switch (error.type) {
          case 'StripeInvalidRequestError':
            throw new BadRequestException({
              ok: false,
              message: ResponseMessageType.BAD_REQUEST,
              error: error.message,
            });

          case 'StripeConnectionError':
            throw new BadRequestException({
              ok: false,
              message: ResponseMessageType.BAD_REQUEST,
              error: error.message,
            });

          default:
            throw new BadRequestException({
              ok: false,
              message: ResponseMessageType.BAD_REQUEST,
              error: 'Unknow error',
            });
        }
      }

      throw new BadRequestException({
        ok: false,
        message: ResponseMessageType.BAD_REQUEST,
        error: 'Something went wrong',
      });
    }
  }

  async deleteCustomer(id: string) {
    await this.getOneCustomer(id);

    const resp = await this.stripeClient.customers.del(id);
    return resp;
  }
}
