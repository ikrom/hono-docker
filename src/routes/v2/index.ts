import { Hono } from "hono";
import { health } from "./health";
import { users } from "./users";

const v2 = new Hono();

// Mount routes
v2.route("/health", health);
v2.route("/users", users);

export { v2 };