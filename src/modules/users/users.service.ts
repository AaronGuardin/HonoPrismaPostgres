import { db } from "../../prisma/db";
import type { CreateUserInput, UpdateUserInput } from "./users.schema";

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

export async function createUser(input: CreateUserInput) {
  const existingUser = await db.orm.public.User.where({
    email: input.email,
  }).first();

  if (existingUser) {
    throw new Error("USER_ALREADY_EXISTS");
  }

  const user = await db.orm.public.User.create(input);

  return user;
}

export async function updateUser(id: number, data: UpdateUserInput) {
  const existingUser = await getUserById(id);

  if (!existingUser) {
    return null;
  }

  if (data.email) {
    const userWithEmail = await db.orm.public.User.where({
      email: data.email,
    }).first();

    if (userWithEmail && userWithEmail.id !== id) {
      throw new Error("USER_ALREADY_EXISTS");
    }
  }

  return db.orm.public.User.where({ id }).update(data);
}

export async function deleteUser(id: number) {
  const existingUser = await getUserById(id);

  if (!existingUser) {
    return null;
  }

  await db.orm.public.User.where({ id }).delete();

  return existingUser;
}
