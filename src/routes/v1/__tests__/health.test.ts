import { describe, expect, test } from "bun:test";
import { health } from "../health";

describe("V1 Health Routes", () => {
  const app = health;

  describe("GET /health", () => {
    test("should return 200 with correct health check structure", async () => {
      const res = await app.request("/");
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data).toHaveProperty("status", "ok");
      expect(data).toHaveProperty("version", "v1");
      expect(data).toHaveProperty("timestamp");

      // Validate timestamp is ISO format
      expect(new Date(data.timestamp).toISOString()).toBe(data.timestamp);
    });
  });
});