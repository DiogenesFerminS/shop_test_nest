import z from 'zod/v4';

export const loginSchema = z.object({
  identifier: z
    .string({
      error: (iss) => {
        if (iss.input === undefined) {
          return 'Email or Username is required';
        }

        if (typeof iss.input !== 'string') {
          return 'Email or Username must be a string';
        }
      },
    })
    .min(6, 'Email or Username is too short')
    .max(255, 'Email or Username is too long')
    .trim()
    .toLowerCase(),
  password: z
    .string({
      error: (iss) => {
        if (iss.input === undefined) {
          return 'Email or Username is required';
        }

        if (typeof iss.input !== 'string') {
          return 'Email or Username must be a string';
        }
      },
    })
    .min(8, 'Password is too short')
    .max(255, 'Password is too long')
    .trim()
    .toLowerCase(),
});

export type LoginUserDto = z.infer<typeof loginSchema>;
