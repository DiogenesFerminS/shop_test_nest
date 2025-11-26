import Joi from 'joi';

export const validationEnvs = Joi.object({
  PORT: Joi.number().port().default(8080),
  POSTGRES_USER: Joi.string().required(),
  POSTGRES_PASS: Joi.string().required(),
  POSTGRES_DB: Joi.string().required(),
  POSTGRES_HOST: Joi.string().required(),
  POSTGRES_PORT: Joi.number().port().required(),
  JWT_SECRET: Joi.string().required(),
  JWT_EXPIRATION_TIME: Joi.string().required(),
});
