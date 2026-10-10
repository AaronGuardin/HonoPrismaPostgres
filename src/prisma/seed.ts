import { connectDatabase, db } from "./db.ts";

const users = [
  { email: "aaron@gmail.com", name: "aaron" },
  { email: "alice@gmail.com", name: "alice" },
  { email: "bob@gmail.com", name: "bob" },
];

let pendingSeed: Promise<void> | undefined;

async function runSeed(): Promise<void> {
  await connectDatabase();

  for (const user of users) {
    await db.orm.public.User.upsert({
      create: user,
      update: {},
      conflictOn: { email: user.email },
    });
  }
}

export function seed(): Promise<void> {
  pendingSeed ??= runSeed().catch((error: unknown) => {
    pendingSeed = undefined;
    throw error;
  });
  return pendingSeed;
}
