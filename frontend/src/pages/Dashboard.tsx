import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ProfileCard } from "../components/profile-card";
import { FeedCard } from "../components/feed-card";
import { Button } from "../components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "../components/ui/card";

export default function Dashboard() {
  const [user, setUser] = useState<any>(null);
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

  const handleLogout = async () => {
    try {
      const response = await fetch("http://localhost:3000/api/logout", {
        method: "POST",
        credentials: "include",
      });

      if (response.ok) {
        navigate("/login");
      } else {
        console.error("Failed to logout");
      }
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  return (
    <div className="min-h-screen bg-wbd-background">
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
            <div className="mt-4">
              <Button
                className="bg-red-500 text-white w-full"
                onClick={handleLogout}
              >
                Logout
              </Button>
            </div>
          </div>
        )}

        {/* Konten Utama */}
        <div className="w-1/2 space-y-6">
          {/* Area untuk membuat post */}
          <Card className="p-4 flex items-center">
            <img
              src="https://a.storyblok.com/f/191576/1200x800/a3640fdc4c/profile_picture_maker_before.webp"
              alt="Profile"
              className="w-12 h-12 rounded-full mr-4"
            />
            <Button className="flex-grow bg-gray-200 text-gray-600 hover:bg-gray-300">
              Start a post, try writing with AI
            </Button>
          </Card>

          {/* Line dan sorting feed */}
          <div className="flex justify-between items-center text-sm text-gray-500">
            <hr className="flex-grow border-gray-300" />
            <span className="px-2">Sort by: Top</span>
          </div>

          {/* Feed */}
          <FeedCard
            title="Hello, World!"
            description="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Curabitur non felis sit amet libero volutpat commodo."
            date="26 November 2024"
          />
          <FeedCard
            title="New Feature Released!"
            description="Check out the latest updates to our platform. We’re introducing AI-powered writing tools to enhance your experience!"
            date="25 November 2024"
          />
          <FeedCard
            title="Weekly Highlights"
            description="Here are some key moments from the past week: record-breaking user engagement and exciting new partnerships!"
            date="24 November 2024"
          />
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
                  src="https://a.storyblok.com/f/191576/1200x800/a3640fdc4c/profile_picture_maker_before.webp"
                  alt="Profile"
                  className="w-12 h-12 rounded-full"
                />
                <div>
                  <h2 className="text-lg font-semibold">John Doe</h2>
                  <p className="text-sm text-gray-500">Software Engineer</p>
                </div>
              </div>
              <div className="mt-4">
                <Button className="w-full bg-blue-500 text-white">Follow</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}