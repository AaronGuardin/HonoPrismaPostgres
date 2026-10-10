import { db } from "./db.ts";
import { seed } from "./seed.ts";

export { db };

export async function listUsers(limit = 10) {
  await seed();
  const users = await db.orm.public.User.select(
    "id",
    "email",
    "name",
    "createdAt",
    "updatedAt",
  )
    .limit(limit)
    .all();

  return users.map((user) => ({
    id: String(user.id),
    email: user.email,
    name: user.name ?? null,
    createdAt: user.createdAt,
    UpdatedAt: user.updatedAt,
  }));
}

export type StarterUser = Awaited<ReturnType<typeof listUsers>>[number];
