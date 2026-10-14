import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";

import {
  createUserSchema,
  userIdParamSchema,
  updateUserSchema,
} from "./users.schema.ts";
import {
  createUser,
  deleteUser,
  getUserById,
  getUsers,
  updateUser,
} from "./users.service.ts";

const users = new Hono();

// Get
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

// Post
users.post(
  "/",
  zValidator("json", createUserSchema, (result, c) => {
    if (!result.success) {
      return c.json(
        {
          error: "Validation failed",
          details: result.error.issues,
        },
        400,
      );
    }
  }),
  async (c) => {
    try {
      const body = c.req.valid("json");

      const user = await createUser(body);

      return c.json(
        {
          message: "User created successfully",
          data: user,
        },
        201,
      );
    } catch (error: unknown) {
      if (error instanceof Error && error.message === "USER_ALREADY_EXISTS") {
        return c.json(
          {
            error: "A user with this email already exists",
          },
          409,
        );
      }

      console.error(error);

      return c.json(
        {
          error: "Internal server error",
        },
        500,
      );
    }
  },
);

export default users;

// Patch
users.patch(
  "/:id",
  zValidator("param", userIdParamSchema),
  zValidator("json", updateUserSchema, (result, c) => {
    if (!result.success) {
      return c.json(
        {
          error: "Validation failed",
          details: result.error.issues,
        },
        400,
      );
    }
  }),
  async (c) => {
    try {
      const { id } = c.req.valid("param");
      const body = c.req.valid("json");

      const user = await updateUser(id, body);

      if (!user) {
        return c.json(
          {
            error: "User not found",
          },
          404,
        );
      }

      return c.json({
        message: "User updated successfully",
        data: user,
      });
    } catch (error: unknown) {
      if (error instanceof Error && error.message === "USER_ALREADY_EXISTS") {
        return c.json(
          {
            error: "A user with this email already exists",
          },
          409,
        );
      }

      console.error(error);

      return c.json(
        {
          error: "Internal server error",
        },
        500,
      );
    }
  },
);

// Delete
users.delete("/:id", zValidator("param", userIdParamSchema), async (c) => {
  try {
    const { id } = c.req.valid("param");

    const user = await deleteUser(id);

    if (!user) {
      return c.json(
        {
          error: "User not found",
        },
        404,
      );
    }

    return c.json({
      message: "User deleted successfully",
      data: user,
    });
  } catch (error: unknown) {
    console.error(error);

    return c.json(
      {
        error: "Internal server error",
      },
      500,
    );
  }
});
