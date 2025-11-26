import z from 'zod/v4';

export const createProductSchema = z.object({
  name: z
    .string({
      error: (iss) => {
        if (iss.input === undefined) {
          return '"Name" is required';
        }

        if (typeof iss.input !== 'string') {
          return '"Name" must be a string';
        }
      },
    })
    .min(3, '"Name" must be at least 3 characters long')
    .max(500, '"Name" must be at most 500 characters long'),

  description: z
    .string({
      error: (iss) => {
        if (iss.input === undefined) {
          return '"Description" is required';
        }

        if (typeof iss.input !== 'string') {
          return '"Description" must be a string';
        }
      },
    })
    .max(4000, '"Description" must be at most 4000 characters long')
    .min(2, '"Description" must be at least 2 characters long'),

  price: z.coerce
    .number({
      error: (iss) => {
        if (typeof iss.input !== 'number') {
          return '"Price" must be a number';
        }
      },
    })
    .positive({ message: '"Price" must be a positive' })
    .refine(
      (n) => {
        const parts = n.toString().split('.');

        return parts.length === 1 || parts[1].length <= 2;
      },
      { message: '"Price" must be at most 2 decimals' },
    )
    .optional(),
  available: z.boolean({ message: '"Available" must be a boolean' }),
  stock: z
    .number({
      error: (iss) => {
        if (iss.input === undefined) {
          return '"Stock" is required';
        }

        if (typeof iss.input !== 'number') {
          return '"Stock" must be a Number';
        }
      },
    })
    .positive({ message: '"Stock" must be a positive' }),
});

export type CreateProductDto = z.infer<typeof createProductSchema>;
