import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import toast from "react-hot-toast";
import Fuse from "fuse.js";
import { Search } from "lucide-react";

type Connection = {
  toId: string;
  name: string;
  username: string;
  profilePhotoPath: string;
  createdAt: string;
};

interface User {
  id: string;
  name: string;
  username: string;
  email: string;
  profilePhotoPath: string;
}

export default function Connections() {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [User, setUser] = useState<User | null>(null);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [filteredConnections, setFilteredConnections] = useState<Connection[]>(
    [],
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const observerRef = useRef<HTMLDivElement | null>(null);
  const [fuse, setFuse] = useState<Fuse<Connection> | null>(null);
  const [connectionCount, setConnectionCount] = useState<number | null>(null);

  if (!userId) {
    toast.error("User ID is required to view connections.");
    return <div className="text-center text-red-500">User ID is missing.</div>;
  }

  const fetchUser = async () => {
    try {
      const userResponse = await fetch(
        `http://localhost:3000/api/user?userId=${userId}`,
        { method: "GET" },
      );

      if (userResponse.ok) {
        const userData = await userResponse.json();
        setUser(userData);
      }
    } catch (error) {
      console.error("Failed to fetch current user:", error);
    }
  };

  const fetchConnections = async (pageToFetch: number) => {
    if (!hasMore && pageToFetch > 1) return;

    setIsLoading(true);

    try {
      const response = await fetch(
        `http://localhost:3000/api/connections/user/${userId}?page=${pageToFetch}&limit=10`,
        { method: "GET", credentials: "include" },
      );

      if (!response.ok) {
        throw new Error("Failed to fetch connections");
      }

      const data = await response.json();
      if (data.success) {
        setConnections((prev) =>
          pageToFetch === 1 ? data.data : [...prev, ...data.data],
        );
        setHasMore(data.hasMore);
      }

      if (pageToFetch === 1) {
        setConnectionCount(data.total);
      }
    } catch (error) {
      console.error(error);
      toast.error("Error fetching connections");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
    fetchConnections(1);
  }, [userId]);

  useEffect(() => {
    if (connections.length > 0) {
      const options = {
        keys: ["username", "name"],
        threshold: 0.4,
        distance: 100,
        minMatchCharLength: 2,
      };
      setFuse(new Fuse(connections, options));
    }
  }, [connections]);

  useEffect(() => {
    if (!searchQuery || !fuse) {
      setFilteredConnections(connections);
      return;
    }
    const result = fuse.search(searchQuery);
    setFilteredConnections(result.map((res: any) => res.item));
  }, [searchQuery, fuse, connections]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (searchQuery) {
      params.set("search", searchQuery);
    } else {
      params.delete("search");
    }
    navigate(`?${params.toString()}`, { replace: true });
  }, [searchQuery, navigate, location.search]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const query = params.get("search") || "";
    setSearchQuery(query.toLowerCase());
  }, [location.search]);

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value.toLowerCase());
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoading) {
          setPage((prevPage) => prevPage + 1);
        }
      },
      { threshold: 1.0 },
    );

    if (observerRef.current) {
      observer.observe(observerRef.current);
    }

    return () => {
      if (observerRef.current) {
        observer.unobserve(observerRef.current);
      }
    };
  }, [hasMore]);

  useEffect(() => {
    if (page > 1) {
      fetchConnections(page);
    }
  }, [page]);

  return (
    <div className="min-h-screen bg-wbd-background pt-24 px-8">
      <section className="p-6 mx-auto max-w-7xl space-y-8">
        <div className="bg-gradient-to-br from-wbd-primary to-wbd-tertiary p-8 rounded-xl shadow-md text-center space-y-2">
          <div className="flex flex-col items-center space-y-3">
            {User?.profilePhotoPath && (
              <img
                src={User.profilePhotoPath || "/default-profile-pic.png"}
                alt={`${User.name}'s profile`}
                className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg"
              />
            )}
            <h1 className="text-3xl sm:text-4xl font-bold text-white drop-shadow-md">
              {User?.name ? `${User.name}'s Connections` : "User's Connections"}
            </h1>
          </div>
          <p className="text-lg sm:text-xl text-white font-medium">
            @{User?.username} | ID: {User?.id}
          </p>
          <p className="text-lg sm:text-xl text-white">
            {connectionCount} connections
          </p>
        </div>

        <div className="relative max-w-lg mx-auto">
          <div className="absolute inset-y-0 left-3 flex items-center">
            <Search className="text-wbd-primary" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={handleSearch}
            placeholder="Search for connections..."
            className="w-full border border-gray-300 rounded-full pl-12 p-3 text-wbd-text placeholder-gray-400 shadow-md focus:outline-none focus:ring-2 focus:ring-wbd-tertiary focus:border-transparent transition-shadow duration-200"
          />
        </div>

        {filteredConnections.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredConnections.map((connection) => (
              <div
                key={connection.toId}
                className="bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden hover:shadow-2xl hover:scale-105 transition-transform duration-300 p-6 flex flex-col justify-between group"
              >
                <div className="flex items-center space-x-4">
                  <div
                    className="flex items-center space-x-4 cursor-pointer"
                    onClick={() => navigate(`/profile/${connection.toId}`)}
                  >
                    <img
                      src={
                        connection.profilePhotoPath
                          ? connection.profilePhotoPath
                          : "/default-profile-pic.png"
                      }
                      alt={`${connection.username}'s profile`}
                      className="w-16 h-16 rounded-full object-cover border border-gray-200"
                    />
                    <div className="flex flex-col">
                      {connection.name && (
                        <strong className="text-lg font-semibold text-wbd-text">
                          {connection.name}
                        </strong>
                      )}
                      <span className="text-md text-gray-500">
                        @{connection.username}
                      </span>
                      <span className="text-sm text-gray-500">
                        ID: {connection.toId}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          !isLoading && (
            <div className="flex flex-col items-center space-y-4 mt-48">
              <p className="text-xl text-gray-700 text-center font-medium">
                No connections found.
              </p>
            </div>
          )
        )}

        {isLoading && (
          <div className="flex justify-center space-x-2 mt-20">
            <div className="w-6 h-6 bg-wbd-highlight rounded-full animate-bounce"></div>
            <div className="w-6 h-6 bg-wbd-highlight rounded-full animate-bounce delay-100"></div>
            <div className="w-6 h-6 bg-wbd-highlight rounded-full animate-bounce delay-200"></div>
          </div>
        )}

        <div ref={observerRef} className="h-1"></div>
      </section>
    </div>
  );
}
