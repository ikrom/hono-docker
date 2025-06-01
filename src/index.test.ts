import { describe, expect, test, beforeEach, afterEach } from "bun:test";
import { HTTPException } from "hono/http-exception";
import app, { createApp } from ".";

describe("Hono Docker API", () => {
  let originalEnv: string | undefined;

  beforeEach(() => {
    originalEnv = process.env.NODE_ENV;
  });

  afterEach(() => {
    process.env.NODE_ENV = originalEnv;
  });

  describe("API Information (GET /)", () => {
    test("should return 200 with API information", async () => {
      const res = await app.request("/");
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data).toHaveProperty("name", "Hono API");
      expect(data).toHaveProperty("description");
      expect(data).toHaveProperty("versions");

      // Validate versions structure
      expect(data.versions).toHaveProperty("v1");
      expect(data.versions).toHaveProperty("v2");
      expect(data.versions.v1).toHaveProperty("path", "/v1");
      expect(data.versions.v1).toHaveProperty("status", "stable");
      expect(data.versions.v2).toHaveProperty("path", "/v2");
      expect(data.versions.v2).toHaveProperty("status", "latest");

      // Validate features
      expect(data.versions.v1).toHaveProperty("features");
      expect(Array.isArray(data.versions.v1.features)).toBe(true);
      expect(data.versions.v2).toHaveProperty("features");
      expect(Array.isArray(data.versions.v2.features)).toBe(true);
    });
  });

  describe("API Documentation (GET /docs)", () => {
    test("should return 200 with API documentation", async () => {
      const res = await app.request("/docs");
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data).toHaveProperty("openapi", "3.0.0");
      expect(data).toHaveProperty("info");
      expect(data).toHaveProperty("versions");

      // Validate versions structure
      expect(data.versions).toHaveProperty("v1");
      expect(data.versions).toHaveProperty("v2");
      expect(data.versions.v1).toHaveProperty("status", "stable");
      expect(data.versions.v1).toHaveProperty("endpoints");
      expect(data.versions.v2).toHaveProperty("status", "latest");
      expect(data.versions.v2).toHaveProperty("endpoints");

      // Validate endpoints structure
      expect(Array.isArray(data.versions.v1.endpoints)).toBe(true);
      expect(Array.isArray(data.versions.v2.endpoints)).toBe(true);
      data.versions.v1.endpoints.forEach((endpoint: any) => {
        expect(endpoint).toHaveProperty("method");
        expect(endpoint).toHaveProperty("path");
        expect(endpoint).toHaveProperty("description");
      });
      data.versions.v2.endpoints.forEach((endpoint: any) => {
        expect(endpoint).toHaveProperty("method");
        expect(endpoint).toHaveProperty("path");
        expect(endpoint).toHaveProperty("description");
      });
    });
  });

  describe("Error Handling", () => {
    test("should return 404 for non-existent routes", async () => {
      const res = await app.request("/non-existent");
      const data = await res.json();

      expect(res.status).toBe(404);
      expect(data).toHaveProperty("success", false);
      expect(data).toHaveProperty("message", "Not Found");
      expect(data).toHaveProperty("path", "/non-existent");
    });

    test("should handle HTTP exceptions", async () => {
      const res = await app.request("/v1/users/invalid", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({}),
      });
      expect(res.status).toBe(400);
    });

    test("should handle internal server errors", async () => {
      const res = await app.request("/test-error");
      const data = await res.json();

      expect(res.status).toBe(500);
      expect(data).toHaveProperty("success", false);
      expect(data).toHaveProperty("message", "Test error");
      expect(data).toHaveProperty("error");
      expect(data.error).toHaveProperty("type", "Error");
    });

    describe("Environment-specific error handling", () => {
      test("should not include stack trace in production", async () => {
        process.env.NODE_ENV = "production";
        const res = await app.request("/test-error");
        const data = await res.json();

        expect(res.status).toBe(500);
        expect(data.error.details).toBeUndefined();
      });

      test("should include stack trace in development", async () => {
        process.env.NODE_ENV = "development";
        const res = await app.request("/test-error");
        const data = await res.json();

        expect(res.status).toBe(500);
        expect(data.error.details).toBeDefined();
        expect(data.error.details).toContain("Error: Test error");
      });
    });
  });

  describe("CORS Configuration", () => {
    test("should handle preflight requests", async () => {
      const res = await app.request("/", {
        method: "OPTIONS",
        headers: {
          Origin: "http://example.com",
          "Access-Control-Request-Method": "POST",
          "Access-Control-Request-Headers": "Content-Type",
        },
      });

      expect(res.status).toBe(204);
      expect(res.headers.get("Access-Control-Allow-Origin")).toBe("*");
      expect(res.headers.get("Access-Control-Allow-Methods")).toContain("POST");
      expect(res.headers.get("Access-Control-Allow-Headers")).toContain(
        "Content-Type",
      );
      expect(res.headers.get("Access-Control-Max-Age")).toBe("86400");
    });

    test("should handle actual CORS requests", async () => {
      const res = await app.request("/", {
        headers: {
          Origin: "http://example.com",
        },
      });

      expect(res.headers.get("Access-Control-Allow-Origin")).toBe("*");
      expect(res.headers.get("Access-Control-Expose-Headers")).toContain(
        "X-Total-Count",
      );
      expect(res.headers.get("Access-Control-Expose-Headers")).toContain(
        "X-Total-Pages",
      );
    });

    test("should respect custom CORS origin", async () => {
      const customOrigin = "https://custom-origin.com".trim();
      const customApp = createApp({ corsOrigin: customOrigin });

      const res = await customApp.request("/", {
        headers: {
          Origin: customOrigin,
        },
      });

      expect(res.headers.get("Access-Control-Allow-Origin")).toBe(customOrigin);

      // Test that preflight also respects custom origin
      const preflightRes = await customApp.request("/", {
        method: "OPTIONS",
        headers: {
          Origin: customOrigin,
          "Access-Control-Request-Method": "POST",
          "Access-Control-Request-Headers": "Content-Type",
        },
      });

      expect(preflightRes.headers.get("Access-Control-Allow-Origin")).toBe(
        customOrigin,
      );
    });

    test("should handle multiple origins correctly", async () => {
      const customOrigin = "https://custom-origin.com, https://another-origin.com";
      const customApp = createApp({ corsOrigin: customOrigin });
      const origins = customOrigin.split(",").map(o => o.trim());

      // Test regular requests
      for (const origin of origins) {
        const res = await customApp.request("/", {
          headers: {
            Origin: origin,
          },
        });
        expect(res.headers.get("Access-Control-Allow-Origin")).toBe(origin);
      }

      // Test preflight requests
      for (const origin of origins) {
        const res = await customApp.request("/", {
          method: "OPTIONS",
          headers: {
            Origin: origin,
            "Access-Control-Request-Method": "POST",
            "Access-Control-Request-Headers": "Content-Type",
          },
        });
        expect(res.headers.get("Access-Control-Allow-Origin")).toBe(origin);
      }

      // Test disallowed origin
      const disallowedRes = await customApp.request("/", {
        headers: {
          Origin: "https://evil.com",
        },
      });
      expect(disallowedRes.headers.get("Access-Control-Allow-Origin")).toBeNull();
    });
  });

  describe("Route Mounting", () => {
    test("v1 routes should be mounted correctly", async () => {
      const res = await app.request("/v1/health");
      expect(res.status).toBe(200);
    });

    test("v2 routes should be mounted correctly", async () => {
      const res = await app.request("/v2/health");
      expect(res.status).toBe(200);
    });

    test("mounted routes should maintain their versioned responses", async () => {
      const [v1Res, v2Res] = await Promise.all([
        app.request("/v1/health"),
        app.request("/v2/health"),
      ]);

      const v1Data = await v1Res.json();
      const v2Data = await v2Res.json();

      expect(v1Data.version).toBe("v1");
      expect(v2Data.version).toBe("v2");
      expect(v2Data).toHaveProperty("system");
      expect(v1Data.system).toBeUndefined();
    });
  });
});
