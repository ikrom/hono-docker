import { describe, expect, test } from "bun:test";
import { users } from "../users";

describe("V1 Users Routes", () => {
  const app = users;

  describe("GET /users", () => {
    test("should return 200 with list of users", async () => {
      const res = await app.request("/");
      const { data } = await res.json();

      expect(res.status).toBe(200);
      expect(Array.isArray(data)).toBe(true);
      expect(data.length).toBeGreaterThan(0);
      expect(data[0]).toHaveProperty("id");
      expect(data[0]).toHaveProperty("name");
      expect(data[0]).toHaveProperty("email");
    });
  });

  describe("GET /users/:id", () => {
    test("should return 200 with user details", async () => {
      const res = await app.request("/1");
      const { data } = await res.json();

      expect(res.status).toBe(200);
      expect(data).toHaveProperty("id", 1);
      expect(data).toHaveProperty("name");
      expect(data).toHaveProperty("email");
    });
  });

  describe("POST /users", () => {
    test("should return 201 when creating a valid user", async () => {
      const newUser = {
        name: "Test User",
        email: "test@example.com",
        age: 25,
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
      expect(data).toHaveProperty("age", newUser.age);
    });

    test("should return 400 for invalid user data", async () => {
      const invalidUser = {
        name: "a", // too short
        email: "invalid-email",
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
    test("should return 200 when updating a user", async () => {
      const updatedUser = {
        name: "Updated User",
        email: "updated@example.com",
        age: 30,
      };

      const res = await app.request("/1", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedUser),
      });

      const { data } = await res.json();

      expect(res.status).toBe(200);
      expect(data).toHaveProperty("id", 1);
      expect(data).toHaveProperty("name", updatedUser.name);
      expect(data).toHaveProperty("email", updatedUser.email);
      expect(data).toHaveProperty("age", updatedUser.age);
    });

    test("should return 400 for invalid update data", async () => {
      const invalidUser = {
        name: "a", // too short
        email: "invalid-email",
      };

      const res = await app.request("/1", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(invalidUser),
      });

      expect(res.status).toBe(400);
    });
  });

  describe("DELETE /users/:id", () => {
    test("should return 200 when deleting a user", async () => {
      const res = await app.request("/1", {
        method: "DELETE",
      });

      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data).toHaveProperty("message", "User 1 deleted successfully");
    });
  });
});