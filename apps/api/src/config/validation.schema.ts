import * as Joi from 'joi';

export const validationSchema = Joi.object({
  // Database
  DATABASE_HOST: Joi.string().required(),
  DATABASE_PORT: Joi.number().default(5432),
  DATABASE_USERNAME: Joi.string().required(),
  DATABASE_PASSWORD: Joi.string().required(),
  DATABASE_NAME: Joi.string().required(),

  // JWT
  JWT_SECRET: Joi.string().required(),
  JWT_EXPIRATION: Joi.string().default('15m'),
  JWT_REFRESH_SECRET: Joi.string().required(),
  JWT_REFRESH_EXPIRATION: Joi.string().default('7d'),

  // Email
  RESEND_API_KEY: Joi.string().required(),
  EMAIL_FROM: Joi.string().email().required(),
  APP_URL: Joi.string().uri().required(),

  // Security
  BCRYPT_ROUNDS: Joi.number().default(10),
  PASSWORD_MIN_LENGTH: Joi.number().default(8),

  // Rate Limiting
  LOGIN_MAX_ATTEMPTS: Joi.number().default(5),
  LOGIN_LOCK_DURATION: Joi.number().default(900000),

  // App
  PORT: Joi.number().default(3333),
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test')
    .default('development'),
});
