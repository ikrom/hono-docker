import { describe, expect, test } from "bun:test";
import { health } from "../health";

describe("V2 Health Routes", () => {
  const app = health;

  describe("GET /health", () => {
    test("should return 200 with correct health check structure", async () => {
      const res = await app.request("/");
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data).toHaveProperty("status", "ok");
      expect(data).toHaveProperty("version", "v2");
      expect(data).toHaveProperty("timestamp");
      expect(data).toHaveProperty("system");

      // Validate timestamp is ISO format
      expect(new Date(data.timestamp).toISOString()).toBe(data.timestamp);

      // Validate system metrics
      expect(data.system).toHaveProperty("memory");
      expect(data.system).toHaveProperty("uptime");
      expect(typeof data.system.uptime).toBe("number");
      expect(data.system.uptime).toBeGreaterThanOrEqual(0);

      // Validate memory metrics
      expect(data.system.memory).toHaveProperty("heapTotal");
      expect(data.system.memory).toHaveProperty("heapUsed");
      expect(data.system.memory).toHaveProperty("rss");
      expect(typeof data.system.memory.heapTotal).toBe("number");
      expect(typeof data.system.memory.heapUsed).toBe("number");
      expect(typeof data.system.memory.rss).toBe("number");
    });
  });
});