import { serve } from "@hono/node-server";
import { Hono } from "hono";
import routes from "./routes/index.ts";

const app = new Hono();

app.get("/", (c) => {
  return c.json({
    message: "E-Commerce API is running",
  });
});

app.route("/", routes);

const rawPort = (process.env.PORT ?? "").trim();
const parsedPort = rawPort.length > 0 ? Number(rawPort) : Number.NaN;
const port =
  Number.isInteger(parsedPort) && parsedPort >= 0 && parsedPort <= 65535
    ? parsedPort
    : 3000;
serve({
  fetch: app.fetch,
  port,
});

console.log(`Server running at http://localhost:${port}`);

// app.get("/users/:id", async (c) => {
//   const id = Number(c.req.param("id"));

//   // Validate user ID
//   if (!Number.isInteger(id) || id < 1) {
//     return c.json({ error: "Invalid user ID" }, 400);
//   }

//   // Find user by ID
//   const user = await db.orm.public.User.where({ id }).first();

//   // Handle user not found
//   if (!user) {
//     return c.json({ error: "User not found" }, 404);
//   }

//   // Return user
//   return c.json({ data: user }, 200);
// });

// app.get("/users", async (c) => {
//   const users = await listUsers(10).catch((error) => {
//     console.error("Failed to query users:", error);
//     return undefined;
//   });

//   if (!users) {
//     return c.json(
//       {
//         error:
//           "Could not query users yet. Run contract:emit and apply your schema first.",
//       },
//       500,
//     );
//   }

//   return c.json(users);
// });
