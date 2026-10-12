import { seed } from "./seed.ts";

try {
  await seed();
  console.log("Seed completed successfully.");
} catch (error: unknown) {
  console.error("Seed failed:", error);
  process.exitCode = 1;
}
