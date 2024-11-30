import { useEffect, useState, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Fuse from "fuse.js";

import { Search } from "lucide-react";
import { Button } from "../components/ui/button";

interface User {
  id: number;
  username: string;
  profilePhotoPath: string;
}

interface CurrentUser {
  email: string;
}

export default function Users() {
  const navigate = useNavigate();
  const location = useLocation();

  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const observerRef = useRef<HTMLDivElement | null>(null);
  const fetchedPages = useRef<Set<number>>(new Set());
  const [fuse, setFuse] = useState<Fuse<User> | null>(null);
  const [isSessionLoading, setIsSessionLoading] = useState(true);

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const sessionResponse = await fetch(
          "http://localhost:3000/api/check-session",
          {
            method: "GET",
            credentials: "include",
          },
        );

        if (sessionResponse.ok) {
          const sessionData = await sessionResponse.json();
          setIsLoggedIn(true);
          setCurrentUser(sessionData.user);
        }
      } catch (error) {
        console.error("Failed to fetch session:", error);
      } finally {
        setIsSessionLoading(false);
      }
    };

    fetchSession();
  }, []);

  useEffect(() => {
    console.log("Current user changed:", currentUser);
    fetchedPages.current.clear();
    setPage(1);
    setUsers([]);
    setHasMore(true);
  }, [currentUser]);

  useEffect(() => {
    const fetchUsers = async (page: number) => {
      console.log("Fetching users for page:", page);
      console.log("Current user:", currentUser?.email);
      console.log("Loading:", loading);
      if (!currentUser?.email || fetchedPages.current.has(page)) return;

      setLoading(true);
      fetchedPages.current.add(page);

      console.log("Fetching users for page:", page);

      try {
        const response = await fetch(
          `http://localhost:3000/api/users?page=${page}&limit=15&excludeEmail=${currentUser.email}`,
        );

        console.log("Fetched users response:", response);
        const data = await response.json();

        console.log("Fetched users:", data.users);

        if (data.users.length > 0) {
          setUsers((prevUsers) => {
            const mergedUsers = [...prevUsers, ...data.users];
            return Array.from(
              new Map(mergedUsers.map((user) => [user.id, user])).values(),
            );
          });
        }

        if (data.users.length < 10) {
          setHasMore(false);
        }
      } catch (error) {
        console.error("Failed to fetch users:", error);
      } finally {
        setLoading(false);
      }
    };

    if (!isSessionLoading && currentUser) {
      fetchUsers(page);
    }
  }, [page, isSessionLoading, currentUser]);

  useEffect(() => {
    if (users.length > 0) {
      const options = {
        keys: ["username"],
        threshold: 0.4,
        distance: 100,
        minMatchCharLength: 2,
      };
      setFuse(new Fuse(users, options));
    }
  }, [users]);

  useEffect(() => {
    if (!searchQuery || !fuse) {
      setFilteredUsers(users);
      return;
    }
    const result = fuse.search(searchQuery);
    setFilteredUsers(result.map((res: any) => res.item));
  }, [searchQuery, fuse, users]);

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
        if (entries[0].isIntersecting && hasMore && !loading) {
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
  }, [hasMore, loading]);

  return (
    <div className="min-h-screen bg-wbd-background pt-20 px-8">
      <section className="p-6 mx-auto max-w-7xl space-y-8">
        <div className="relative max-w-lg mx-auto">
          <div className="absolute inset-y-0 left-3 flex items-center">
            <Search className="text-gray-400" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={handleSearch}
            placeholder="Search for users..."
            className="w-full border border-gray-300 rounded-full pl-12 p-3 text-wbd-text placeholder-gray-400 shadow-md focus:outline-none focus:ring-2 focus:ring-wbd-tertiary focus:border-transparent transition-shadow duration-200"
          />
        </div>

        {filteredUsers.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredUsers.map((user) => (
              <div
                key={user.id}
                className="bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden hover:shadow-2xl hover:scale-105 transition-transform duration-300 p-6 flex flex-col justify-between group"
              >
                <div className="flex items-center space-x-4">
                  <img
                    src={
                      user.profilePhotoPath
                        ? user.profilePhotoPath
                        : "/default-profile-pic.png"
                    }
                    alt={`${user.username}'s profile`}
                    className="w-16 h-16 rounded-full object-cover border border-gray-200"
                  />
                  <strong className="text-lg font-semibold text-wbd-text">
                    {user.username}
                  </strong>
                </div>
                {isLoggedIn && (
                  <div className="flex justify-end mt-6">
                    <Button
                      onClick={() => navigate(`/profile/${user.id}`)}
                      variant="default"
                      size="sm"
                    >
                      View Profile
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          !loading &&
          filteredUsers.length === 0 && (
            <div className="flex flex-col items-center space-y-4 mt-48">
              <p className="text-xl text-wbd-primary text-center font-medium">
                No user found.
              </p>
            </div>
          )
        )}

        {loading && (
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
