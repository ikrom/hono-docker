import { Hono } from "hono";
import { logger } from "hono/logger";
import { prettyJSON } from "hono/pretty-json";
import { cors } from "hono/cors";
import { secureHeaders } from "hono/secure-headers";
import { HTTPException } from "hono/http-exception";
import { v1 } from "./routes/v1";
import { v2 } from "./routes/v2";

export function createApp(options?: { corsOrigin?: string }) {
  const app = new Hono();

  // Global middleware
  app.use("*", logger());
  app.use("*", prettyJSON());

  // Handle CORS with support for multiple origins
  const corsOrigin = options?.corsOrigin || process.env.CORS_ORIGIN || "*";
  app.use(
    "*",
    cors({
      origin: (origin) => {
        if (corsOrigin === "*") return "*";
        const allowedOrigins = corsOrigin.split(",").map(o => o.trim());
        return allowedOrigins.includes(origin) ? origin : null;
      },
      allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
      allowHeaders: ["Content-Type", "Authorization"],
      exposeHeaders: ["X-Total-Count", "X-Total-Pages"],
      maxAge: 86400,
    }),
  );
  app.use("*", secureHeaders());

  // API Information
  app.get("/", (c) => {
    return c.json({
      name: "Hono API",
      description: "A versioned REST API example",
      versions: {
        v1: {
          path: "/v1",
          status: "stable",
          features: ["Basic CRUD operations", "Simple validation"],
        },
        v2: {
          path: "/v2",
          status: "latest",
          features: [
            "Enhanced validation",
            "Extended user profiles",
            "Pagination and search",
            "Batch operations",
            "Detailed responses",
          ],
        },
      },
      documentation: "/docs",
    });
  });

  // Mount versioned routes
  app.route("/v1", v1);
  app.route("/v2", v2);

  // API Documentation
  app.get("/docs", (c) => {
    return c.json({
      openapi: "3.0.0",
      info: {
        title: "Hono API",
        version: "2.0.0",
        description: "A versioned REST API built with Hono",
      },
      versions: {
        v1: {
          status: "stable",
          endpoints: [
            {
              method: "GET",
              path: "/v1/health",
              description: "Basic health check",
            },
            { method: "GET", path: "/v1/users", description: "List users" },
            {
              method: "GET",
              path: "/v1/users/:id",
              description: "Get user by ID",
            },
            { method: "POST", path: "/v1/users", description: "Create user" },
            { method: "PUT", path: "/v1/users/:id", description: "Update user" },
            {
              method: "DELETE",
              path: "/v1/users/:id",
              description: "Delete user",
            },
          ],
        },
        v2: {
          status: "latest",
          endpoints: [
            {
              method: "GET",
              path: "/v2/health",
              description: "Enhanced health check with metrics",
            },
            {
              method: "GET",
              path: "/v2/users",
              description: "List users with pagination and search",
            },
            {
              method: "GET",
              path: "/v2/users/:id",
              description: "Get user by ID with extended info",
            },
            {
              method: "POST",
              path: "/v2/users",
              description: "Create user with extended profile",
            },
            {
              method: "PUT",
              path: "/v2/users/:id",
              description: "Partial update user",
            },
            {
              method: "DELETE",
              path: "/v2/users/:id",
              description: "Delete user",
            },
            {
              method: "POST",
              path: "/v2/users/batch",
              description: "Batch operations",
            },
          ],
        },
      },
    });
  });

  // Test error route (for testing purposes only)
  app.get("/test-error", () => {
    throw new Error("Test error");
  });

  // Global error handler
  app.onError((err, c) => {
    console.error(`[${new Date().toISOString()}] Error:`, err);

    if (err instanceof HTTPException) {
      return err.getResponse();
    }

    return c.json(
      {
        success: false,
        message: err.message || "Internal Server Error",
        error: {
          type: err.name,
          details: process.env.NODE_ENV === "development" ? err.stack : undefined,
        },
      },
      500,
    );
  });

  // 404 handler
  app.notFound((c) => {
    return c.json(
      {
        success: false,
        message: "Not Found",
        path: c.req.path,
      },
      404,
    );
  });

  return app;
}

const app = createApp();

export default {
  port: process.env.PORT || 3000,
  fetch: app.fetch,
  request: app.request,
};