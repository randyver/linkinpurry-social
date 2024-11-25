import { Hono } from "hono";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const connectionRoute = new Hono();

/**
 * Utility function for error responses
 */
function errorResponse(
  c: any,
  message: string,
  errorPayload: unknown = null,
  statusCode = 500
) {
  const errorDetails =
    errorPayload instanceof Error ? errorPayload.message : errorPayload;

  return c.json(
    {
      success: false,
      message,
      error: errorDetails,
    },
    statusCode
  );
}

/**
 * Get list of connections
 */
connectionRoute.get("/connections", async (c) => {
  try {
    const user = c.get("user");

    if (!user) {
      return c.json({ success: false, message: "User not authenticated" }, 401);
    }

    const userId = parseInt(user.userId, 10);

    const connections = await prisma.connection.findMany({
      where: { fromId: userId },
      select: {
        toId: true,
        createdAt: true,
      },
    });

    const formattedConnections = connections.map((connection) => ({
      ...connection,
      toId: connection.toId.toString(),
      createdAt: connection.createdAt.toISOString(),
    }));

    return c.json({ success: true, data: formattedConnections });
  } catch (error) {
    console.error("Error fetching connections:", error);
    return errorResponse(c, "Failed to fetch connections", error);
  }
});

/**
 * Send a connection request
 */
connectionRoute.post("/connections/request", async (c) => {
  try {
    const { requestToId } = await c.req.json();
    const user = c.get("user");

    if (!user) {
      return c.json({ success: false, message: "User not authenticated" }, 401);
    }

    const requestFromId = parseInt(user.userId, 10);

    if (
      isNaN(requestFromId) ||
      requestToId === undefined ||
      isNaN(requestToId)
    ) {
      return errorResponse(c, "Invalid or missing input data", null, 400);
    }

    if (requestFromId === requestToId) {
      return errorResponse(
        c,
        "User cannot send a connection request to themselves",
        null,
        400
      );
    }

    await prisma.$transaction(async (tx) => {
      const existingConnection = await tx.connection.findFirst({
        where: { fromId: requestFromId, toId: requestToId },
      });

      if (existingConnection) {
        throw new Error("User is already connected to the requested user");
      }

      const existingRequest = await tx.connectionRequest.findUnique({
        where: { fromId_toId: { fromId: requestFromId, toId: requestToId } },
      });

      if (existingRequest) {
        throw new Error("Connection request already exists");
      }

      await tx.connectionRequest.create({
        data: {
          fromId: requestFromId,
          toId: requestToId,
          createdAt: new Date(),
        },
      });
    });

    return c.json({ success: true, message: "Connection request sent" }, 201);
  } catch (error) {
    console.error("Error sending connection request:", error);
    return errorResponse(c, "Failed to send connection request", error);
  }
});

/**
 * Get pending connection requests
 */
connectionRoute.get("/connections/requests", async (c) => {
  try {
    const user = c.get("user");

    if (!user) {
      return c.json({ success: false, message: "User not authenticated" }, 401);
    }

    const userId = parseInt(user.userId, 10);

    const requests = await prisma.connectionRequest.findMany({
      where: { toId: userId },
      orderBy: { createdAt: "desc" },
    });

    const formattedRequests = requests.map((request) => ({
      ...request,
      fromId: request.fromId.toString(),
      toId: request.toId.toString(),
      createdAt: request.createdAt.toISOString(),
    }));

    return c.json({ success: true, data: formattedRequests });
  } catch (error) {
    console.error("Error fetching connection requests:", error);
    return errorResponse(c, "Failed to fetch connection requests", error);
  }
});

/**
 * Accept or reject a connection request
 */
connectionRoute.post("/connections/requests/:action", async (c) => {
  try {
    const action = c.req.param("action");
    const { fromId } = await c.req.json();
    const user = c.get("user");

    if (!user) {
      return c.json({ success: false, message: "User not authenticated" }, 401);
    }

    const toId = parseInt(user.userId, 10);

    if (isNaN(toId) || !["accept", "reject"].includes(action)) {
      return errorResponse(c, "Invalid action or user ID", null, 400);
    }

    await prisma.$transaction(async (tx) => {
      const request = await tx.connectionRequest.findUnique({
        where: { fromId_toId: { fromId, toId } },
      });

      if (!request) {
        throw new Error("Connection request not found");
      }

      if (action === "accept") {
        await tx.connection.createMany({
          data: [
            { fromId, toId, createdAt: new Date() },
            { fromId: toId, toId: fromId, createdAt: new Date() },
          ],
        });
      }

      await tx.connectionRequest.delete({
        where: { fromId_toId: { fromId, toId } },
      });
    });

    return c.json({ success: true, message: `Connection request ${action}ed` });
  } catch (error) {
    console.error("Error processing connection request:", error);
    return errorResponse(c, "Failed to process connection request", error);
  }
});

/**
 * Delete a connection
 */
connectionRoute.delete("/connections", async (c) => {
  try {
    const { connectionToId } = await c.req.json();
    const user = c.get("user");

    if (!user) {
      return c.json({ success: false, message: "User not authenticated" }, 401);
    }

    const userId = parseInt(user.userId, 10);

    if (
      isNaN(userId) ||
      connectionToId === undefined ||
      isNaN(connectionToId)
    ) {
      return errorResponse(c, "Invalid or missing input data", null, 400);
    }

    await prisma.$transaction(async (tx) => {
      const connection = await tx.connection.findFirst({
        where: { fromId: userId, toId: connectionToId },
      });

      if (!connection) {
        throw new Error("Connection does not exist");
      }

      await tx.connection.deleteMany({
        where: {
          OR: [
            { fromId: userId, toId: connectionToId },
            { fromId: connectionToId, toId: userId },
          ],
        },
      });
    });

    return c.json({
      success: true,
      message: "Connection deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting connection:", error);
    return errorResponse(c, "Failed to delete connection", error);
  }
});

export default connectionRoute;
