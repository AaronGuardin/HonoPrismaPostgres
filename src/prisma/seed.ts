import { connectDatabase, db } from "./db.ts";

const users = [
  { email: "aaron@gmail.com", name: "aaron" },
  { email: "alice@gmail.com", name: "alice" },
  { email: "bob@gmail.com", name: "bob" },
];

const categories = [
  { name: "Electronics", slug: "electronics" },
  { name: "Beauty", slug: "beauty" },
  { name: "Clothes", slug: "clothes" },
];

const products = [
  {
    name: "Keyboard",
    slug: "keyboard",
    price: "200.00",
    stock: 2,
    sku: "001",
    isActive: true,
    categoryId: 1,
  },
  {
    name: "Lipstick",
    slug: "lipstick",
    price: "59.00",
    stock: 10,
    sku: "002",
    isActive: true,
    categoryId: 2,
  },
  {
    name: "Hoodie",
    slug: "hoodie",
    price: "30.00",
    stock: 5,
    sku: "003",
    isActive: true,
    categoryId: 3,
  },
];

let pendingSeed: Promise<void> | undefined;

async function runSeed(): Promise<void> {
  await connectDatabase();

  // Seed users
  for (const user of users) {
    await db.orm.public.User.upsert({
      create: user,
      update: {},
      conflictOn: { email: user.email },
    });
  }

  // Seed categories
  for (const category of categories) {
    await db.orm.public.Category.upsert({
      create: category,
      update: {},
      conflictOn: { slug: category.slug },
    });
  }

  // Seed products
  for (const product of products) {
    await db.orm.public.Product.upsert({
      create: product,
      update: {},
      conflictOn: { slug: product.slug },
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
