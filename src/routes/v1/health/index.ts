import { Hono } from "hono";

const health = new Hono();

// Basic health check
health.get("/", (c) => {
  return c.json({
    status: "ok",
    version: "v1",
    timestamp: new Date().toISOString(),
  });
});

export { health };