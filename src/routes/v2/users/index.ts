import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";

// Enhanced schema for v2
const userSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  profile: z.object({
    age: z.number().min(0).optional(),
    phone: z.string().optional(),
    address: z.string().optional(),
  }),
  role: z.enum(["user", "admin"]).default("user"),
  settings: z
    .object({
      notifications: z.boolean().default(true),
      theme: z.enum(["light", "dark"]).default("light"),
    })
    .optional(),
});

const users = new Hono();

// GET /users with filtering and pagination
users.get("/", (c) => {
  const page = parseInt(c.req.query("page") || "1");
  const limit = parseInt(c.req.query("limit") || "10");
  const role = c.req.query("role");

  const users = [
    {
      id: 1,
      name: "John Doe",
      email: "john@example.com",
      profile: {
        age: 30,
        phone: "1234567890",
      },
      role: "admin",
      settings: {
        notifications: true,
        theme: "dark",
      },
    },
    {
      id: 2,
      name: "Jane Smith",
      email: "jane@example.com",
      profile: {
        age: 25,
        phone: "0987654321",
      },
      role: "user",
      settings: {
        notifications: false,
        theme: "light",
      },
    },
  ];

  // Filter by role if specified
  const filtered = role ? users.filter((user) => user.role === role) : users;

  // Apply pagination
  const start = (page - 1) * limit;
  const end = start + limit;
  const paged = filtered.slice(start, end);

  return c.json({
    data: paged,
    metadata: {
      total: filtered.length,
      page,
      limit,
      pages: Math.ceil(filtered.length / limit),
    },
  });
});

// GET /users/:id with extended user info
users.get("/:id", (c) => {
  const id = c.req.param("id");
  const user = {
    id: parseInt(id),
    name: "John Doe",
    email: "john@example.com",
    profile: {
      age: 30,
      phone: "1234567890",
      address: "123 Main St",
    },
    role: "admin",
    settings: {
      notifications: true,
      theme: "dark",
    },
    metadata: {
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString(),
    },
  };
  return c.json({ data: user });
});

// POST /users with enhanced validation
users.post("/", zValidator("json", userSchema), async (c) => {
  const data = c.req.valid("json");
  const user = {
    id: Math.floor(Math.random() * 1000),
    ...data,
    metadata: {
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString(),
    },
  };
  return c.json({ data: user }, 201);
});

// PUT /users/:id with partial updates
users.put("/:id", zValidator("json", userSchema.partial()), async (c) => {
  const id = c.req.param("id");
  const updates = c.req.valid("json");
  const user = {
    id: parseInt(id),
    name: "John Doe",
    email: "john@example.com",
    ...updates,
    metadata: {
      updatedAt: new Date().toISOString(),
    },
  };
  return c.json({ data: user });
});

// DELETE /users/:id with enhanced response
users.delete("/:id", (c) => {
  const id = c.req.param("id");
  return c.json({
    success: true,
    message: `User ${id} deleted successfully`,
    metadata: {
      deletedAt: new Date().toISOString(),
    },
  });
});

// Batch operations
users.post(
  "/batch",
  zValidator(
    "json",
    z.object({
      operations: z.array(
        z.object({
          action: z.enum(["create", "update", "delete"]),
          data: z.any(),
          id: z.number().optional(),
        }),
      ),
    }),
  ),
  async (c) => {
    const { operations } = c.req.valid("json");
    const results = operations.map((op) => ({
      action: op.action,
      success: true,
      data: {
        id: op.id || Math.floor(Math.random() * 1000),
        ...op.data,
      },
    }));

    return c.json({
      success: true,
      data: results,
    });
  },
);

export { users };