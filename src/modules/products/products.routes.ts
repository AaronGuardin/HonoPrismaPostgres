import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";

import { productIdParamSchema } from "./products.schema.ts";
import { getProductById, getProducts } from "./products.service.ts";

const products = new Hono();

products.get("/", async (c) => {
  const products = await getProducts();

  return c.json({
    data: products,
  });
});

products.get("/:id", zValidator("param", productIdParamSchema), async (c) => {
  const { id } = c.req.valid("param");

  const product = await getProductById(id);

  if (!product) {
    return c.json(
      {
        error: "Category not found",
      },
      404,
    );
  }

  return c.json({
    data: product,
  });
});

export default products;
