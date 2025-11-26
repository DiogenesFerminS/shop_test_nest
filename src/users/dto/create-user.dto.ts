import z from 'zod/v4';

export const createUserSchema = z.object({
  username: z
    .string({
      error: (iss) => {
        if (iss.input === undefined) {
          return 'Username is required';
        }

        if (typeof iss.input !== 'string') {
          return 'Username must be a string';
        }
      },
    })
    .max(255, 'Username must be at most 255 characters')
    .min(6, 'Username must be at least 6 characters long')
    .trim()
    .toLowerCase(),
  email: z
    .email('"Email" must be a valid email')
    .max(255, 'Email is too long, limit is 255 characters')
    .trim()
    .toLowerCase(),
  password: z
    .string({
      error: (iss) => {
        if (iss.input === undefined) {
          return 'Password is required';
        }

        if (typeof iss.input !== 'string') {
          return 'Password must be a string';
        }
      },
    })
    .max(150, 'Password is too long, limit is 150 characters')
    .min(8, 'Password must be at least 8 characters long')
    .regex(/[a-z]/, {
      message: 'The password must contain at least one lowercase letter',
    })
    .regex(/[A-Z]/, {
      message: 'The password must contain at least one uppercase letter.',
    })
    .regex(/[0-9]/, {
      message: 'The password must contain at least one number',
    })
    .regex(/[\W_]/, {
      message:
        'The password must contain at least one special character (!@#...)',
    })
    .trim()
    .toLowerCase(),
});

export type CreateUserDto = z.infer<typeof createUserSchema>;
