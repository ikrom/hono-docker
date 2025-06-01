import { Hono } from "hono";

const health = new Hono();

// Enhanced health check with more details
health.get("/", (c) => {
  return c.json({
    status: "ok",
    version: "v2",
    timestamp: new Date().toISOString(),
    system: {
      memory: process.memoryUsage(),
      uptime: process.uptime(),
    },
  });
});

export { health };