import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";

// Import routes and handlers
import registerRoute from "./routes/Register.js";
import loginRoute from "./routes/Login.js";
import logoutRoute from "./routes/Logout.js";
import usersSearchRoute from "./routes/user-search.js";
import {
  getConnectionsHandler,
  sendConnectionRequestHandler,
  getConnectionRequestsHandler,
  acceptOrRejectRequestHandler,
  deleteConnectionHandler,
} from "./routes/connection.js";
import { getProfileHandler, updateProfileHandler } from "./routes/profile.js";
import checkSessionRoute from "./routes/check-session.js";

import { validateJWT } from "./middleware/validateJWT.js";
import { profileAccessMiddleware } from "./middleware/profileAccess.js";
import { getSignedUrlHandler } from "./routes/get-url.js";

const app = new Hono();

// Middleware CORS
app.use(
  "*",
  cors({
    origin: "http://localhost:5173",
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type"],
    credentials: true,
  })
);

// Base route
app.get("/", (c) => c.text("Hello Hono!"));

// Public Routes
const publicRoutes = new Hono();
publicRoutes.route("/api", registerRoute);
publicRoutes.route("/api", loginRoute);
publicRoutes.route("/api", logoutRoute);
publicRoutes.route("/api", usersSearchRoute);
publicRoutes.get("/api/get-url", getSignedUrlHandler);
publicRoutes.get("/api/connections/user/:user_id", getConnectionsHandler);
app.route("/", publicRoutes);

// Protected Routes
const protectedRoutesValidateJWT = new Hono();
protectedRoutesValidateJWT.use("/api/*", validateJWT);
protectedRoutesValidateJWT.post("/api/connections/request", sendConnectionRequestHandler);
protectedRoutesValidateJWT.get("/api/connections/requests", getConnectionRequestsHandler);
protectedRoutesValidateJWT.post("/api/connections/requests/:action", acceptOrRejectRequestHandler);
protectedRoutesValidateJWT.delete("/api/connections", deleteConnectionHandler);
protectedRoutesValidateJWT.put("/api/profile/:user_id", updateProfileHandler)
protectedRoutesValidateJWT.route("/api", checkSessionRoute);
app.route("/", protectedRoutesValidateJWT);

const protectedRouteProfileAccess = new Hono();
protectedRouteProfileAccess.get("/api/profile/:user_id", getProfileHandler);
protectedRouteProfileAccess.use("/api/*", profileAccessMiddleware);
app.route("/", protectedRouteProfileAccess);

// Start server
const port = 3000;
console.log(`Server running on http://localhost:${port}`);

serve({ fetch: app.fetch, port });