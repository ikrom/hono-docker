import { Hono } from "hono";
import { health } from "./health";
import { users } from "./users";

const v1 = new Hono();

// Mount routes
v1.route("/health", health);
v1.route("/users", users);

export { v1 };