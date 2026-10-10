import { db } from "../../prisma/db";

export async function getUsers() {
  return db.orm.public.User.select(
    "id",
    "email",
    "name",
    "createdAt",
    "updatedAt",
  )
    .limit(10)
    .all();
}

export async function getUserById(id: number) {
  return db.orm.public.User.where({ id })
    .select("id", "email", "name", "createdAt", "updatedAt")
    .first();
}
