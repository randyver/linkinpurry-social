import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AddFeed from "../components/add-feed";
import Feed from "../components/feed";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { ProfileCard } from "../components/profile-card";

interface User {
  userId: string;
  username: string;
  email: string;
  fullname: string;
  profilePhotoPath: string;
  name: string;
  id: string;
  isConnected: boolean;
}

interface OtherUser {
  id: string;
  username: string;
  name: string;
  profilePhotoPath: string | null;
  isConnected: boolean;
  hasPendingRequest: boolean;
}

export default function Home() {
  const [user, setUser] = useState<User | null>(null);
  const [otherUsers, setOtherUsers] = useState<OtherUser[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const response = await fetch(
          "http://localhost:3000/api/check-session",
          {
            method: "GET",
            credentials: "include",
          }
        );

        if (!response.ok) {
          navigate("/login");
          return;
        }

        const data = await response.json();
        setUser(data.user);
      } catch (error) {
        console.error("Error checking session:", error);
      }
    };

    checkLoginStatus();
  }, [navigate]);

  useEffect(() => {
    const fetchOtherUsers = async () => {
      if (!user) return;

      try {
        const response = await fetch(
          `http://localhost:3000/api/users?excludedId=${user.userId}`
        );

        if (response.ok) {
          const data = await response.json();
          const filteredUsers = data.users
            .filter((u: OtherUser) => !u.isConnected)
            .slice(0, 3);
          setOtherUsers(filteredUsers);
        } else {
          console.error("Failed to fetch other users");
        }
      } catch (error) {
        console.error("Error fetching other users:", error);
      }
    };

    fetchOtherUsers();
  }, [user]);

  return (
    <div className="min-h-screen bg-wbd-background pt-20">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 max-w-7xl mx-auto p-4">
        {/* Sidebar Kiri */}
        {user && (
          <div className="order-1 md:order-none md:col-span-1">
            <ProfileCard
              username={user.username}
              email={user.email}
              fullName={user.fullname}
              profilePhotoPath={user.profilePhotoPath}
            />
          </div>
        )}

        {/* Feed Section */}
        <div className="order-2 md:col-span-2 space-y-6">
          {!user ? (
            <div className="text-center">Loading...</div>
          ) : (
            <>
              <Card className="p-4 flex items-center">
                <img
                  src={user.profilePhotoPath}
                  alt="Profile"
                  className="w-12 h-12 rounded-full mr-4"
                />
                <AddFeed
                  fullname={user.fullname}
                  photo={user.profilePhotoPath}
                />
              </Card>

              <div className="flex justify-between items-center text-sm text-gray-500">
                <hr className="flex-grow border-gray-300" />
              </div>

              <Feed currentUser={user} />
            </>
          )}
        </div>

        {/* Sidebar Kanan */}
        <div className="order-3 md:col-span-1 hidden md:block space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Who to follow</CardTitle>
            </CardHeader>
            <CardContent>
              {otherUsers.length > 0 ? (
                otherUsers.map((otherUser) => (
                  <div
                    key={otherUser.id}
                    className="flex gap-x-4 items-center mb-4 cursor-pointer"
                    onClick={() => navigate(`/profile/${otherUser.id}`)}
                  >
                    <img
                      src={
                        otherUser.profilePhotoPath ||
                        "https://via.placeholder.com/48"
                      }
                      alt="Profile"
                      className="w-12 h-12 rounded-full"
                    />
                    <div>
                      <p className="font-semibold">{otherUser.name}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500">No users to follow</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}