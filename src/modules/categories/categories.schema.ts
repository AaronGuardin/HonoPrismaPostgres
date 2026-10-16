import { z } from "zod";

export const categoryIdParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});

export const createCategorySchema = z.object({
  name: z.string().trim().min(1).max(100),
  slug: z
    .string()
    .trim()
    .min(1)
    .max(100)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
});

export const updateCategorySchema = z.object({
  name: z.string().trim().min(1).max(100).optional(),

  slug: z
    .string()
    .trim()
    .min(1)
    .max(100)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
    .optional(),
});

export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;

export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
