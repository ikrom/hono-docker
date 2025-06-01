import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";

// Schema for v1
const userSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  age: z.number().min(0).optional(),
});

const users = new Hono();

// GET /users
users.get("/", (c) => {
  const users = [
    { id: 1, name: "John Doe", email: "john@example.com" },
    { id: 2, name: "Jane Smith", email: "jane@example.com" },
  ];
  return c.json({ data: users });
});

// GET /users/:id
users.get("/:id", (c) => {
  const id = c.req.param("id");
  const user = {
    id: parseInt(id),
    name: "John Doe",
    email: "john@example.com",
  };
  return c.json({ data: user });
});

// POST /users
users.post("/", zValidator("json", userSchema), async (c) => {
  const data = c.req.valid("json");
  const user = {
    id: Math.floor(Math.random() * 1000),
    ...data,
  };
  return c.json({ data: user }, 201);
});

// PUT /users/:id
users.put("/:id", zValidator("json", userSchema), async (c) => {
  const id = c.req.param("id");
  const data = c.req.valid("json");
  const user = {
    id: parseInt(id),
    ...data,
  };
  return c.json({ data: user });
});

// DELETE /users/:id
users.delete("/:id", (c) => {
  const id = c.req.param("id");
  return c.json({
    message: `User ${id} deleted successfully`,
  });
});

export { users };