import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";

import {
  categoryIdParamSchema,
  createCategorySchema,
} from "./categories.schema.ts";
import {
  getCategoryById,
  getCategories,
  createCategory,
} from "./categories.service.ts";

const categories = new Hono();

categories.get("/", async (c) => {
  const categories = await getCategories();

  return c.json({
    data: categories,
  });
});

categories.get(
  "/:id",
  zValidator("param", categoryIdParamSchema),
  async (c) => {
    const { id } = c.req.valid("param");

    const category = await getCategoryById(id);

    if (!category) {
      return c.json(
        {
          error: "Category not found",
        },
        404,
      );
    }

    return c.json({
      data: category,
    });
  },
);

categories.post("/", zValidator("json", createCategorySchema), async (c) => {
  const data = c.req.valid("json");
  const category = await createCategory(data);

  return c.json({ data: category }, 201);
});

export default categories;
