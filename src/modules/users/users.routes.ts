import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";

import { userIdParamSchema } from "./users.schema.ts";
import { getUserById, getUsers } from "./users.service.ts";

const users = new Hono();

users.get("/", async (c) => {
  const users = await getUsers();

  return c.json({
    data: users,
  });
});

users.get("/:id", zValidator("param", userIdParamSchema), async (c) => {
  const { id } = c.req.valid("param");

  const user = await getUserById(id);

  if (!user) {
    return c.json(
      {
        error: "User not found",
      },
      404,
    );
  }

  return c.json({
    data: user,
  });
});

export default users;
