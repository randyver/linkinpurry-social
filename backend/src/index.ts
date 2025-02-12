import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";

// Import routes
import registerRoute from "./routes/register.js";
import loginRoute from "./routes/login.js";
import logoutRoute from "./routes/logout.js";
import userSearchRoute from "./routes/user-search.js";
import checkSessionRoute from "./routes/check-session.js";
import userRoute from "./routes/user.js";
import usersRoute from "./routes/users.js";
import notificationRoute from "./routes/send-push-notification.js";

//Import handlers
import {
  getConnectionsHandler,
  sendConnectionRequestHandler,
  getConnectionRequestsHandler,
  acceptOrRejectRequestHandler,
  deleteConnectionHandler,
} from "./routes/connection.js";
import {
  getProfileHandler,
  updateProfileHandler,
  getUserRecentPosts,
} from "./routes/profile.js";
import { getSignedUrlHandler } from "./routes/get-url.js";
import {
  feedsRoute,
  addFeedRoute,
  editFeedRoute,
  deleteFeedRoute,
  detailFeedRoute,
} from "./routes/feed.js";
import { savePushSubscription } from "./routes/save-push-subscription.js";
import { getChatHistoryHandler } from "./routes/messages.js";

// Import middlewares
import { validateJWT } from "./middleware/validateJWT.js";
import { profileAccessMiddleware } from "./middleware/profileAccess.js";

import { attachSocket } from "./socket.js";
import vapidRoute from "./routes/vapid.js";

export const app = new Hono();

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
publicRoutes.route("/api", userSearchRoute);
publicRoutes.route("/api", userRoute);
publicRoutes.route("/api", usersRoute);
publicRoutes.route("/api", vapidRoute);
publicRoutes.get("/api/get-url", getSignedUrlHandler);
publicRoutes.get("/api/connections/user/:user_id", getConnectionsHandler);
app.route("/", publicRoutes);

// Protected Routes
const protectedRouteProfileAccess = new Hono();
protectedRouteProfileAccess.use(
  "/api/profile/:user_id",
  profileAccessMiddleware
);
protectedRouteProfileAccess.get("/api/profile/:user_id", getProfileHandler);
protectedRouteProfileAccess.get(
  "/api/profile/:user_id/recent-posts",
  getUserRecentPosts
);
app.route("/", protectedRouteProfileAccess);

const protectedRoutesValidateJWT = new Hono();
protectedRoutesValidateJWT.use("/api/*", validateJWT);
protectedRoutesValidateJWT.route("/api", logoutRoute);
protectedRoutesValidateJWT.post(
  "/api/connections/request",
  sendConnectionRequestHandler
);
protectedRoutesValidateJWT.get(
  "/api/connections/requests",
  getConnectionRequestsHandler
);
protectedRoutesValidateJWT.post(
  "/api/connections/requests/:action",
  acceptOrRejectRequestHandler
);
protectedRoutesValidateJWT.delete("/api/connections", deleteConnectionHandler);
protectedRoutesValidateJWT.put("/api/profile/:user_id", updateProfileHandler);
protectedRoutesValidateJWT.get("/api/feed", feedsRoute);
protectedRoutesValidateJWT.post("/api/feed", addFeedRoute);
protectedRoutesValidateJWT.put("/api/feed/:feed_id", editFeedRoute);
protectedRoutesValidateJWT.delete("/api/feed/:feed_id", deleteFeedRoute);
protectedRoutesValidateJWT.get("/api/feed/:feed_id", detailFeedRoute);
protectedRoutesValidateJWT.route("/api", checkSessionRoute);
protectedRoutesValidateJWT.get(
  "/api/chat/:userId/:oppositeUserId",
  getChatHistoryHandler
);
protectedRoutesValidateJWT.post(
  "/api/save-push-subscription",
  savePushSubscription
);
protectedRoutesValidateJWT.route("/api", notificationRoute);
app.route("/", protectedRoutesValidateJWT);

// Start server
const port = 3000;
console.log(`Server running on http://localhost:${port}`);

const server = serve({ fetch: app.fetch, port });
attachSocket(server);
