import { db } from "../../prisma/db";

export async function getProducts() {
  return db.orm.public.Product.select(
    "id",
    "name",
    "slug",
    "description",
    "price",
    "stock",
    "sku",
    "imageUrl",
    "isActive",
    "createdAt",
    "updatedAt",
  )
    .limit(10)
    .all();
}

export async function getProductById(id: number) {
  return db.orm.public.Product.where({ id })
    .select(
      "id",
      "name",
      "slug",
      "description",
      "price",
      "stock",
      "sku",
      "imageUrl",
      "isActive",
      "createdAt",
      "updatedAt",
    )
    .first();
}
