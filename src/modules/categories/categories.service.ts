import { db } from "../../prisma/db";
import type { UpdateCategoryInput } from "./categories.schema";

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

export async function updateCategory(id: number, data: UpdateCategoryInput) {
  const existingCategory = await getCategoryById(id);

  if (!existingCategory) {
    return null;
  }

  if (data.slug) {
    const categoryWithSlug = await db.orm.public.Category.where({
      slug: data.slug,
    }).first();

    if (categoryWithSlug && categoryWithSlug.id !== id) {
      throw new Error("CATEGORY_ALREADY_EXISTS");
    }
  }

  return db.orm.public.Category.where({ id }).update(data);
}
