import z from 'zod/v4';

export const paginationSchema = z.object({
  page: z.coerce
    .number({
      error: (iss) => {
        if (typeof iss.input !== 'number') {
          return 'Page must be a number';
        }
      },
    })
    .positive({ message: 'Page must be a positive' })
    .min(1, 'Page must be at least 1')
    .default(1)
    .optional(),
  limit: z.coerce
    .number({
      error: (iss) => {
        if (typeof iss.input !== 'number') {
          return 'Limit must be a number';
        }
      },
    })
    .positive({ message: 'Limit must be a positive' })
    .min(1, 'Limit must be at least 10')
    .default(10)
    .optional(),
});

export type PaginationDto = z.infer<typeof paginationSchema>;
