import { db } from "../../prisma/db";

export async function getCategories() {
  return db.orm.public.Category.select(
    "id",
    "name",
    "slug",
    "createdAt",
    "updatedAt",
  )
    .limit(10)
    .all();
}

export async function getCategoryById(id: number) {
  return db.orm.public.Category.where({ id })
    .select("id", "name", "slug", "createdAt", "updatedAt")
    .first();
}

export async function createCategory(data: { name: string; slug: string }) {
  return db.orm.public.Category.create(data);
}
