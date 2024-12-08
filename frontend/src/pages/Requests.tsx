import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { Button } from "../components/ui/button";
import { Skeleton } from "../components/ui/skeleton";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Send, Check, X } from "lucide-react";

type ConnectionRequest = {
  fromId: string;
  name: string;
  username: string;
  profilePhotoPath?: string;
  createdAt: string;
};

type UserSearchResult = {
  id: string;
  username: string;
  name: string;
  profilePhotoPath?: string;
};

export default function Requests() {
  const navigate = useNavigate();
  const { userId } = useParams<{ userId: string }>();
  const [requests, setRequests] = useState<ConnectionRequest[]>([]);
  const [requestToId, setRequestToId] = useState("");
  const [isLoadingRequests, setIsLoadingRequests] = useState(false);
  const [requestCount, setRequestCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<UserSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  if (!userId) {
    toast.error("User ID is required to view connections.");
    return <div className="text-center text-red-600">User ID is missing.</div>;
  }

  const fetchRequests = async () => {
    setIsLoadingRequests(true);
    try {
      const response = await fetch(
        `http://localhost:3000/api/connections/requests`,
        {
          method: "GET",
          credentials: "include",
        },
      );

      if (!response.ok) {
        throw new Error("Failed to fetch connection requests");
      }

      const data = await response.json();
      setRequests(data.data || []);
      setRequestCount(data.count || 0);
    } catch (error) {
      console.error(error);
      toast.error("Error fetching connection requests");
    } finally {
      setIsLoadingRequests(false);
    }
  };

  const searchUsers = async (query: string) => {
    setIsSearching(true);

    try {
      const response = await fetch(
        `http://localhost:3000/api/user-search?search=${query}`,
        { method: "GET", credentials: "include" },
      );

      if (!response.ok) {
        throw new Error("Search failed");
      }

      const data = await response.json();
      setSearchResults(data.data || []);
    } catch (error) {
      console.error("Error searching users:", error);
      toast.error("Error during search");
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);

    if (!query) {
      setSearchResults([]);
      return;
    }
  
    searchUsers(query);
  };

  const handleSelectUser = (user: UserSearchResult) => {
    setRequestToId(user.id);
    setSearchQuery(user.username);
    setSearchResults([]);
  };

  const sendRequest = async () => {
    console.log("sending request to: ", requestToId);
    if (!requestToId.trim()) {
      toast.error("Please enter a valid user ID to send a connection request");
      return;
    }

    const toastId = toast.loading("Sending connection request...");
    try {
      const response = await fetch(
        `http://localhost:3000/api/connections/request`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({ requestToId: parseInt(requestToId, 10) }),
        },
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
    action: "accept" | "reject",
  ) => {
    const toastId = toast.loading(
      `${action.charAt(0).toUpperCase() + action.slice(1)}ing request...`,
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
        },
      );

      if (!response.ok) {
        throw new Error(`Failed to ${action} connection request`);
      }

      toast.success(`Connection request ${action}ed successfully`);
      setRequests((prevRequests) =>
        prevRequests.filter((req) => req.fromId !== fromId),
      );

      setRequestCount((prevCount) => Math.max(prevCount - 1, 0));
    } catch (error) {
      console.error(error);
      toast.error(`Error ${action}ing connection request`);
    } finally {
      toast.dismiss(toastId);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [userId]);

  return (
    <div className="bg-wbd-background min-h-screen flex flex-col items-center pt-32 px-6">
      <h1 className="text-4xl font-bold mb-8 text-wbd-primary">
        Manage Requests
      </h1>

      <div className="flex flex-col lg:flex-row gap-8 items-stretch w-full max-w-6xl">
        <Card className="max-h-fit bg-wbd-secondary border-wbd-tertiary flex flex-col gap-4 p-6 rounded-lg shadow-lg hover:shadow-xl transition flex-1">
          <CardHeader>
            <CardTitle className="text-xl font-medium text-wbd-primary">
              Send a Request
            </CardTitle>
          </CardHeader>

          <CardContent>
            <div className="flex flex-row w-full gap-4">
              <div className="relative w-full">
                <input
                  type="text"
                  placeholder="Search by username, name, or ID"
                  value={searchQuery}
                  onChange={handleSearchChange}
                  className="w-full rounded-lg px-4 py-2 border border-wbd-tertiary text-wbd-text focus:outline-none focus:border-transparent focus:ring-2 focus:ring-wbd-highlight transition"
                />
                {isSearching ? (
                  <div className="absolute top-full left-0 w-full bg-white shadow-lg p-4 rounded-lg">
                    <Skeleton className="h-6 w-full mb-2" />
                    <Skeleton className="h-6 w-full" />
                  </div>
                ) : (
                  searchResults.length > 0 && (
                    <ul className="absolute top-full mt-1 left-0 w-full bg-white shadow-lg p-4 rounded-lg">
                      {searchResults.map((user) => (
                        <li
                          key={user.id}
                          onClick={() => handleSelectUser(user)}
                          className="flex items-center gap-4 p-2 hover:bg-gray-100 cursor-pointer"
                        >
                          <img
                            src={user.profilePhotoPath || "/default-avatar.png"}
                            alt={`${user.name}'s avatar`}
                            className="w-8 h-8 rounded-full object-cover"
                          />
                          <div>
                            <p className="text-sm text-wbd-text font-medium">{user.name}</p>
                            <p className="text-xs text-gray-500">
                              @{user.username} | ID: {user.id}
                            </p>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )
                )}
              </div>

              <Button
                onClick={sendRequest}
                variant={"default"}
                className="px-6 py-2 hover:scale-105 transition flex items-center justify-center"
              >
                <Send className="text-xl" />
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-wbd-secondary border-wbd-tertiary flex flex-col flex-1 p-6 rounded-lg shadow-lg hover:shadow-xl transition">
          <CardHeader>
            <CardTitle className="text-xl font-medium text-wbd-primary">
              Pending Requests
            </CardTitle>
            <p className="text-lg text-wbd-primary">
              You have <strong>{requestCount}</strong> pending request(s).
            </p>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            {isLoadingRequests ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, idx) => (
                  <Skeleton key={idx} className="h-8 rounded-md bg-gray-200" />
                ))}
              </div>
            ) : requests.length > 0 ? (
              <>
                <style>
                  {`
                    .custom-scrollbar::-webkit-scrollbar {
                      width: 6px;
                    }
                    .custom-scrollbar::-webkit-scrollbar-thumb {
                      background-color: #415044;
                      border-radius: 4px;
                    }
                    .custom-scrollbar::-webkit-scrollbar-track {
                      background: transparent;
                    }
                  `}
                </style>

                <div className="space-y-4 custom-scrollbar pr-2 overflow-y-auto max-h-[55vh]">
                  <ul className="space-y-4">
                    {requests.map((request) => (
                      <li
                        key={request.fromId}
                        className="p-4 rounded-lg bg-white border border-wbd-tertiary shadow flex justify-between items-center hover:shadow-md transition"
                      >
                        <div
                          className="flex items-center gap-4 cursor-pointer"
                          onClick={() => navigate(`/profile/${request.fromId}`)}
                        >
                          <img
                            src={
                              request.profilePhotoPath || "/default-avatar.png"
                            }
                            alt={`${request.name}'s avatar`}
                            className="w-12 h-12 rounded-full object-cover"
                          />
                          <div>
                            <p className="text-sm font-semibold text-wbd-primary">
                              {request.name}
                            </p>
                            <p className="text-xs text-gray-500">
                              @{request.username} | ID: {request.fromId}
                            </p>
                            <p className="text-xs text-gray-500">
                              Requested:{" "}
                              {new Date(request.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            onClick={() =>
                              handleRequestAction(request.fromId, "accept")
                            }
                            className="rounded-xl w-10 bg-wbd-primary text-white p-2 hover:scale-105 transition"
                            aria-label="Accept"
                          >
                            <Check />
                          </Button>
                          <Button
                            onClick={() =>
                              handleRequestAction(request.fromId, "reject")
                            }
                            className="rounded-xl w-10 bg-wbd-red text-white p-2 hover:scale-105 transition"
                            aria-label="Reject"
                          >
                            <X />
                          </Button>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </>
            ) : (
              <p className="text-center text-wbd-primary">
                No pending requests
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
