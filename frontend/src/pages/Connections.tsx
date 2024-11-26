import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";

type Connection = {
  toId: string;
  createdAt: string;
};

type ConnectionRequest = {
  fromId: string;
  createdAt: string;
};

export default function Connections() {
  const { userId } = useParams<{ userId: string }>();
  const [connections, setConnections] = useState<Connection[]>([]);
  const [requests, setRequests] = useState<ConnectionRequest[]>([]);
  const [requestToId, setRequestToId] = useState("");
  const [isLoadingConnections, setIsLoadingConnections] = useState(false);
  const [isLoadingRequests, setIsLoadingRequests] = useState(false);

  if (!userId) {
    toast.error("User ID is required to view connections.");
    return <div className="text-center text-red-500">User ID is missing.</div>;
  }

  const fetchConnections = async () => {
    setIsLoadingConnections(true);
    try {
      const response = await fetch(
        `http://localhost:3000/api/connections/user/${userId}`,
        {
          method: "GET",
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch connections");
      }

      const data = await response.json();
      setConnections(data.data || []);
      toast.success("Connections fetched successfully");
    } catch (error) {
      console.error(error);
      toast.error("Error fetching connections");
    } finally {
      setIsLoadingConnections(false);
    }
  };

  const fetchRequests = async () => {
    setIsLoadingRequests(true);
    try {
      const response = await fetch(
        `http://localhost:3000/api/connections/requests`,
        {
          method: "GET",
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch connection requests");
      }

      const data = await response.json();
      setRequests(data.data || []);
      toast.success("Connection requests fetched successfully");
    } catch (error) {
      console.error(error);
      toast.error("Error fetching connection requests");
    } finally {
      setIsLoadingRequests(false);
    }
  };

  const sendRequest = async () => {
    if (!requestToId.trim()) {
      toast.error("Please enter a valid user ID to send a connection request");
      return;
    }

    const toastId = toast.loading("Sending connection request...");
    try {
      const response = await fetch(
        "http://localhost:3000/api/connections/request",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({ requestToId: parseInt(requestToId, 10) }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to send connection request");
      }

      toast.success("Connection request sent successfully");
      setRequestToId("");
    } catch (error) {
      console.error(error);
      toast.error("Error sending connection request");
    } finally {
      toast.dismiss(toastId);
    }
  };

  const handleRequestAction = async (
    fromId: string,
    action: "accept" | "reject"
  ) => {
    const toastId = toast.loading(
      `${action.charAt(0).toUpperCase() + action.slice(1)}ing request...`
    );
    try {
      const response = await fetch(
        `http://localhost:3000/api/connections/requests/${action}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({ fromId: parseInt(fromId, 10) }),
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to ${action} connection request`);
      }

      toast.success(`Connection request ${action}ed successfully`);
      setRequests((prevRequests) =>
        prevRequests.filter((req) => req.fromId !== fromId)
      );
      if (action === "accept") fetchConnections();
    } catch (error) {
      console.error(error);
      toast.error(`Error ${action}ing connection request`);
    } finally {
      toast.dismiss(toastId);
    }
  };

  useEffect(() => {
    fetchConnections();
    fetchRequests();
  }, [userId]);

  return (
    <div className="flex flex-col items-center min-h-screen bg-gray-100 p-4 text-black">
      <h1 className="text-2xl font-bold mb-4">Connections for User ID: {userId}</h1>

      {/* Connections List */}
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Your Connections</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoadingConnections ? (
            Array.from({ length: 3 }).map((_, idx) => (
              <div key={idx} className="h-6 w-full bg-gray-200 rounded mb-2"></div>
            ))
          ) : connections.length > 0 ? (
            <ul>
              {connections.map((connection) => (
                <li
                  key={connection.toId}
                  className="border-b py-2 flex justify-between items-center"
                >
                  <span>User ID: {connection.toId}</span>
                  <span>{new Date(connection.createdAt).toLocaleString()}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p>No connections found.</p>
          )}
        </CardContent>
      </Card>

      {/* Send Connection Request */}
      <Card className="w-full max-w-md mt-4">
        <CardHeader>
          <CardTitle>Send Connection Request</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="User ID"
              value={requestToId}
              onChange={(e: any) => setRequestToId(e.target.value)}
              className="border rounded px-3 py-2 w-full"
            />
            <Button onClick={sendRequest}>Send</Button>
          </div>
        </CardContent>
      </Card>

      {/* Connection Requests */}
      <Card className="w-full max-w-md mt-4">
        <CardHeader>
          <CardTitle>Pending Connection Requests</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoadingRequests ? (
            Array.from({ length: 3 }).map((_, idx) => (
              <div key={idx} className="h-6 w-full bg-gray-200 rounded mb-2"></div>
            ))
          ) : requests.length > 0 ? (
            <ul>
              {requests.map((request) => (
                <li
                  key={request.fromId}
                  className="border-b py-2 flex justify-between items-center"
                >
                  <span>User ID: {request.fromId}</span>
                  <span>{new Date(request.createdAt).toLocaleString()}</span>
                  <div className="flex gap-2">
                    <Button
                      onClick={() =>
                        handleRequestAction(request.fromId, "accept")
                      }
                    >
                      Accept
                    </Button>
                    <Button
                      onClick={() =>
                        handleRequestAction(request.fromId, "reject")
                      }
                      variant="destructive"
                    >
                      Reject
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p>No pending connection requests.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}