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

//Import handlers
import {
  getConnectionsHandler,
  sendConnectionRequestHandler,
  getConnectionRequestsHandler,
  acceptOrRejectRequestHandler,
  deleteConnectionHandler,
} from "./routes/connection.js";
import { getProfileHandler, updateProfileHandler } from "./routes/profile.js";
import { getSignedUrlHandler } from "./routes/get-url.js";
// import { addFeedRoute } from "./routes/add-feed.js";
// import { editFeedRoute } from "./routes/edit-feed.js";
// import { deleteFeedRoute } from "./routes/delete-feed.js";
// import { feedsRoute } from "./routes/feeds.js";
import { feedsRoute } from "./routes/feed.js";
import { addFeedRoute } from "./routes/feed.js";
import { editFeedRoute } from "./routes/feed.js";
import { deleteFeedRoute } from "./routes/feed.js";
import { savePushSubscription } from "./routes/save-push-subscription.js";

// Import middlewares
import { validateJWT } from "./middleware/validateJWT.js";
import { profileAccessMiddleware } from "./middleware/profileAccess.js";
import { Server } from "socket.io";
import { Server as HttpServer } from "http";
import { getChatHistoryHandler } from "./routes/messages.js";
import { attachSocket } from "./socket.js";

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

app.get('/api/vapid-key', (c) => {
  const vapidKey = process.env.VAPID_PUBLIC_KEY!;
  console.log("VAPID Key:", vapidKey);
  if (!vapidKey) {
    return c.json({ error: "VAPID key not set in the environment" }, 500);
  }
  return c.json({ vapidKey });
});

// Public Routes
const publicRoutes = new Hono();
publicRoutes.route("/api", registerRoute);
publicRoutes.route("/api", loginRoute);
publicRoutes.route("/api", logoutRoute);
publicRoutes.route("/api", userSearchRoute);
publicRoutes.route("/api", userRoute);
publicRoutes.route("/api", usersRoute);
publicRoutes.get("/api/get-url", getSignedUrlHandler);
publicRoutes.get("/api/connections/user/:user_id", getConnectionsHandler);

// Feeds Routes
// publicRoutes.post("/api/add-feed", addFeedRoute);
// publicRoutes.put("/api/edit-feed/:feed_id", editFeedRoute);
// publicRoutes.delete("/api/delete-feed/:feed_id", deleteFeedRoute);

app.route("/", publicRoutes);

// Protected Routes
const protectedRoutesValidateJWT = new Hono();
protectedRoutesValidateJWT.use("/api/*", validateJWT);
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
// protectedRoutesValidateJWT.get("/api/feeds", feedsRoute);
// protectedRoutesValidateJWT.post("/api/add-feed", addFeedRoute);
// protectedRoutesValidateJWT.put("/api/edit-feed/:feed_id", editFeedRoute);
// protectedRoutesValidateJWT.delete("/api/delete-feed/:feed_id", deleteFeedRoute);
protectedRoutesValidateJWT.get("/api/feed", feedsRoute);
protectedRoutesValidateJWT.post("/api/feed", addFeedRoute);
protectedRoutesValidateJWT.put("/api/feed/:feed_id", editFeedRoute);
protectedRoutesValidateJWT.delete("/api/feed/:feed_id", deleteFeedRoute);
protectedRoutesValidateJWT.route("/api", checkSessionRoute);
protectedRoutesValidateJWT.post("/api/save-push-subscription", savePushSubscription);
protectedRoutesValidateJWT.get(
  "/api/chat/:userId/:oppositeUserId",
  getChatHistoryHandler
);
app.route("/", protectedRoutesValidateJWT);

const protectedRouteProfileAccess = new Hono();
protectedRouteProfileAccess.get("/api/profile/:user_id", getProfileHandler);
protectedRouteProfileAccess.use("/api/*", profileAccessMiddleware);
app.route("/", protectedRouteProfileAccess);


// Start server
const port = 3000;
console.log(`Server running on http://localhost:${port}`);

const server = serve({ fetch: app.fetch, port });
attachSocket(server);