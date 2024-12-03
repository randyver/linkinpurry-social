import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AddFeed from "../components/add-feed";
import { Button } from "../components/ui/button";
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
}

export default function Home(){
  const [user, setUser] = useState<User | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const response = await fetch(
          "http://localhost:3000/api/check-session",
          {
            method: "GET",
            credentials: "include",
          },
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

  return (
    <div className="min-h-screen bg-wbd-background pt-20">
      <div className="flex justify-between max-w-7xl mx-auto p-4 space-x-6">
        {/* Sidebar Kiri */}
        {user && (
          <div className="w-1/4">
            <ProfileCard
              username={user.username}
              email={user.email}
              fullName={user.fullname}
              profilePhotoPath="https://a.storyblok.com/f/191576/1200x800/a3640fdc4c/profile_picture_maker_before.webp"
              connections={0}
            />
          </div>
        )}

        {/* Feed Section */}
        <div className="w-1/2 space-y-6">
          {!user ? (
            <div className="text-center">Loading...</div>
          ) : (
            <>
              {/* Profile Card and AddFeed Form */}
              <Card className="p-4 flex items-center">
                <img
                  src="https://a.storyblok.com/f/191576/1200x800/a3640fdc4c/profile_picture_maker_before.webp"
                  alt="Profile"
                  className="w-12 h-12 rounded-full mr-4"
                />
                <AddFeed
                  fullname={user.fullname}
                  userId={Number(user.userId)}
                />
              </Card>

              <div className="flex justify-between items-center text-sm text-gray-500">
                <hr className="flex-grow border-gray-300" />
                <span className="px-2">Sort by: Top</span>
              </div>

              {/* Feed Component */}
              <Feed currentUser={user} />
            </>
          )}
        </div>

        {/* Sidebar Kanan */}
        <div className="w-1/4 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Who to follow</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-4">
                <img
                  src="https://via.placeholder.com/48"
                  alt="Profile"
                  className="w-12 h-12 rounded-full"
                />
                <div>
                  <h2 className="text-lg font-semibold">John Doe</h2>
                  <p className="text-sm text-gray-500">Software Engineer</p>
                </div>
              </div>
              <div className="mt-4">
                <Button className="w-full bg-blue-500">Follow</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};