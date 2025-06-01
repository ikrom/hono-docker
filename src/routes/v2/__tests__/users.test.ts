import { describe, expect, test } from "bun:test";
import { users } from "../users";

describe("V2 Users Routes", () => {
  const app = users;

  describe("GET /users", () => {
    test("should return 200 with paginated list of users", async () => {
      const res = await app.request("/?page=1&limit=10");
      const { data, metadata } = await res.json();

      expect(res.status).toBe(200);
      expect(Array.isArray(data)).toBe(true);
      expect(data.length).toBeGreaterThan(0);

      // Validate user structure
      expect(data[0]).toHaveProperty("id");
      expect(data[0]).toHaveProperty("name");
      expect(data[0]).toHaveProperty("email");
      expect(data[0]).toHaveProperty("profile");
      expect(data[0]).toHaveProperty("role");
      expect(data[0]).toHaveProperty("settings");

      // Validate pagination metadata
      expect(metadata).toHaveProperty("total");
      expect(metadata).toHaveProperty("page", 1);
      expect(metadata).toHaveProperty("limit", 10);
      expect(metadata).toHaveProperty("pages");
    });

    test("should filter users by role", async () => {
      const res = await app.request("/?role=admin");
      const { data } = await res.json();

      expect(res.status).toBe(200);
      expect(Array.isArray(data)).toBe(true);
      data.forEach((user: { role: string }) => {
        expect(user.role).toBe("admin");
      });
    });
  });

  describe("GET /users/:id", () => {
    test("should return 200 with extended user details", async () => {
      const res = await app.request("/1");
      const { data } = await res.json();

      expect(res.status).toBe(200);
      expect(data).toHaveProperty("id", 1);
      expect(data).toHaveProperty("name");
      expect(data).toHaveProperty("email");
      expect(data).toHaveProperty("profile");
      expect(data).toHaveProperty("role");
      expect(data).toHaveProperty("settings");
      expect(data).toHaveProperty("metadata");

      // Validate profile structure
      expect(data.profile).toHaveProperty("age");
      expect(data.profile).toHaveProperty("phone");
      expect(data.profile).toHaveProperty("address");

      // Validate settings structure
      expect(data.settings).toHaveProperty("notifications");
      expect(data.settings).toHaveProperty("theme");

      // Validate metadata structure
      expect(data.metadata).toHaveProperty("createdAt");
      expect(data.metadata).toHaveProperty("lastLogin");
    });
  });

  describe("POST /users", () => {
    test("should return 201 when creating a valid user", async () => {
      const newUser = {
        name: "Test User",
        email: "test@example.com",
        profile: {
          age: 25,
          phone: "1234567890",
          address: "123 Test St",
        },
        role: "user",
        settings: {
          notifications: true,
          theme: "light",
        },
      };

      const res = await app.request("/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newUser),
      });

      const { data } = await res.json();

      expect(res.status).toBe(201);
      expect(data).toHaveProperty("id");
      expect(data).toHaveProperty("name", newUser.name);
      expect(data).toHaveProperty("email", newUser.email);
      expect(data).toHaveProperty("profile");
      expect(data).toHaveProperty("role", newUser.role);
      expect(data).toHaveProperty("settings");
      expect(data).toHaveProperty("metadata");
      expect(data.metadata).toHaveProperty("createdAt");
      expect(data.metadata).toHaveProperty("lastLogin");
    });

    test("should return 400 for invalid user data", async () => {
      const invalidUser = {
        name: "a", // too short
        email: "invalid-email",
        profile: {
          age: -1, // invalid age
        },
      };

      const res = await app.request("/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(invalidUser),
      });

      expect(res.status).toBe(400);
    });
  });

  describe("PUT /users/:id", () => {
    test("should return 200 when partially updating a user", async () => {
      const updates = {
        name: "Updated User",
        profile: {
          age: 30,
        },
        settings: {
          theme: "dark",
        },
      };

      const res = await app.request("/1", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updates),
      });

      const { data } = await res.json();

      expect(res.status).toBe(200);
      expect(data).toHaveProperty("id", 1);
      expect(data).toHaveProperty("name", updates.name);
      expect(data.profile).toHaveProperty("age", updates.profile.age);
      expect(data.settings).toHaveProperty("theme", updates.settings.theme);
      expect(data.metadata).toHaveProperty("updatedAt");
    });

    test("should return 400 for invalid update data", async () => {
      const invalidUpdates = {
        name: "a", // too short
        profile: {
          age: -1, // invalid age
        },
      };

      const res = await app.request("/1", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(invalidUpdates),
      });

      expect(res.status).toBe(400);
    });
  });

  describe("DELETE /users/:id", () => {
    test("should return 200 with metadata when deleting a user", async () => {
      const res = await app.request("/1", {
        method: "DELETE",
      });

      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data).toHaveProperty("success", true);
      expect(data).toHaveProperty("message", "User 1 deleted successfully");
      expect(data).toHaveProperty("metadata");
      expect(data.metadata).toHaveProperty("deletedAt");
    });
  });

  describe("POST /users/batch", () => {
    test("should handle batch operations successfully", async () => {
      const batchOperations = {
        operations: [
          {
            action: "create",
            data: {
              name: "New User",
              email: "new@example.com",
              profile: { age: 25 },
            },
          },
          {
            action: "update",
            id: 1,
            data: {
              name: "Updated Name",
            },
          },
          {
            action: "delete",
            id: 2,
          },
        ],
      };

      const res = await app.request("/batch", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(batchOperations),
      });

      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data).toHaveProperty("success", true);
      expect(data).toHaveProperty("data");
      expect(Array.isArray(data.data)).toBe(true);
      expect(data.data.length).toBe(batchOperations.operations.length);

      // Verify each operation result
      data.data.forEach((result: any, index: number | number) => {
        const operation = batchOperations.operations[index];
        expect(result).toHaveProperty("action", operation.action);
        expect(result).toHaveProperty("success", true);
        expect(result).toHaveProperty("data");
      });
    });

    test("should return 400 for invalid batch operations", async () => {
      const invalidBatchOps = {
        operations: [
          {
            action: "invalid", // invalid action
            data: {},
          },
        ],
      };

      const res = await app.request("/batch", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(invalidBatchOps),
      });

      expect(res.status).toBe(400);
    });
  });
});
