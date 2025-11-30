import z from 'zod/v4';

export const createCustomerSchema = z.object({
  name: z
    .string({
      error: (iss) => {
        if (iss.input === undefined) {
          return 'Name is required';
        }

        if (typeof iss.input !== 'string') {
          return 'Name must be a string';
        }
      },
    })
    .min(3, 'Name is too short, the min length is 3 characters')
    .max(100, 'Name is too long, the max length is 100 characters'),
  email: z.email('Email must be a valid email'),
});

export type CreateCustomerDto = z.infer<typeof createCustomerSchema>;
