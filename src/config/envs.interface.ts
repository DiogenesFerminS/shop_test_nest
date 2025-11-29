export interface Envs {
  PORT: string;
  POSTGRES_USER: string;
  POSTGRES_PASS: string;
  POSTGRES_DB: string;
  POSTGRES_HOST: string;
  POSTGRES_PORT: number;
  JWT_SECRET: string;
  JWT_EXPIRATION_TIME: string;
  STRIPE_API_KEY: string;
  STRIPE_WEBHOOK_SECRET: string;
}
