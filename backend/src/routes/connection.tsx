import { Hono } from "hono";
import { PrismaClient } from "@prisma/client";

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

const prisma = new PrismaClient();
const connectionRoute = new Hono();

/**
 * Get list of connections
 */
connectionRoute.get("/connections", async function (c) {
  try {
    const userIdHeader = c.req.header("user-id");
    if (!userIdHeader) {
      return errorResponse(c, "User ID header is required", null, 400);
    }

    const userId = parseInt(userIdHeader, 10);
    if (isNaN(userId)) {
      return errorResponse(c, "Invalid User ID header", null, 400);
    }

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
connectionRoute.post("/connections/request", async function (c) {
  try {
    const { requestToId } = await c.req.json();
    const userIdHeader = c.req.header("user-id");
    if (!userIdHeader) {
      return errorResponse(c, "User ID header is required", null, 400);
    }

    const requestFromId = parseInt(userIdHeader, 10);
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
        "User cannot send a connection request to themself",
        null,
        400
      );
    }

    const existingConnection = await prisma.connection.findFirst({
      where: {
        OR: [
          { fromId: requestFromId, toId: requestToId },
          { fromId: requestToId, toId: requestFromId },
        ],
      },
    });

    if (existingConnection) {
      return errorResponse(
        c,
        "User are already connected to the requested user",
        null,
        400
      );
    }

    const existingRequest = await prisma.connectionRequest.findUnique({
      where: { fromId_toId: { fromId: requestFromId, toId: requestToId } },
    });

    if (existingRequest) {
      return errorResponse(c, "Connection request already exists", null, 400);
    }

    await prisma.connectionRequest.create({
      data: { fromId: requestFromId, toId: requestToId, createdAt: new Date() },
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
connectionRoute.get("/connections/requests", async function (c) {
  try {
    const userIdHeader = c.req.header("user-id");
    if (!userIdHeader) {
      return errorResponse(c, "User ID header is required", null, 400);
    }

    const userId = parseInt(userIdHeader, 10);
    if (isNaN(userId)) {
      return errorResponse(c, "Invalid User ID header", null, 400);
    }

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
connectionRoute.post("/connections/requests/:action", async function (c) {
  try {
    const action = c.req.param("action");
    const { fromId } = await c.req.json();
    const userIdHeader = c.req.header("user-id");
    if (!userIdHeader) {
      return errorResponse(c, "User ID header is required", null, 400);
    }

    const toId = parseInt(userIdHeader, 10);
    if (isNaN(toId) || !["accept", "reject"].includes(action)) {
      return errorResponse(c, "Invalid action or user ID", null, 400);
    }

    const request = await prisma.connectionRequest.findUnique({
      where: { fromId_toId: { fromId, toId } },
    });

    if (!request) {
      return errorResponse(c, "Connection request not found", null, 404);
    }

    if (action === "accept") {
      await prisma.connection.createMany({
        data: [
          { fromId, toId, createdAt: new Date() },
          { fromId: toId, toId: fromId, createdAt: new Date() },
        ],
      });
    }

    await prisma.connectionRequest.delete({
      where: { fromId_toId: { fromId, toId } },
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
connectionRoute.delete("/connections", async function (c) {
  try {
    const { connectionToId } = await c.req.json();
    const userIdHeader = c.req.header("user-id");
    if (!userIdHeader) {
      return errorResponse(c, "User ID header is required", null, 400);
    }

    const userId = parseInt(userIdHeader, 10);
    if (
      isNaN(userId) ||
      connectionToId === undefined ||
      isNaN(connectionToId)
    ) {
      return errorResponse(c, "Invalid or missing input data", null, 400);
    }

    const connection = await prisma.connection.findFirst({
      where: {
        OR: [
          { fromId: userId, toId: connectionToId },
          { fromId: connectionToId, toId: userId },
        ],
      },
    });

    if (!connection) {
      return errorResponse(c, "Connection does not exist", null, 404);
    }

    await prisma.connection.deleteMany({
      where: {
        OR: [
          { fromId: userId, toId: connectionToId },
          { fromId: connectionToId, toId: userId },
        ],
      },
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
