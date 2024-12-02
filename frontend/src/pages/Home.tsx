import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ProfileCard } from "../components/profile-card";
import { FeedCard } from "../components/feed-card";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import AddFeed from "../components/add-feed";

export default function Home() {
  const [user, setUser] = useState<any>(null);
  const [feeds, setFeeds] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const response = await fetch("http://localhost:3000/api/check-session", {
          method: "GET",
          credentials: "include",
        });

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
    const fetchFeeds = async () => {
      if (!user) return;

      try {
        const response = await fetch(`http://localhost:3000/api/feeds`, {
          method: "GET",
          credentials: "include",
        }); 

        if (response.ok) {
          const data = await response.json();
          console.log("Feeds:", data);
          setFeeds(data || []);
        } else {
          console.error("Failed to fetch feeds");
        }
      } catch (error) {
        console.error("Error fetching feeds:", error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchFeeds();
    }
  }, [user]);

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

        {/* Konten Utama */}
        <div className="w-1/2 space-y-6">
          {/* Placeholder Loading */}
          {loading && (
            <div className="flex justify-center items-center min-h-[200px]">
              <p>Loading feeds...</p>
            </div>
          )}

          {!loading && (
            <>
              {/* Area untuk membuat post */}
              <Card className="p-4 flex items-center">
                <img
                  src="https://a.storyblok.com/f/191576/1200x800/a3640fdc4c/profile_picture_maker_before.webp"
                  alt="Profile"
                  className="w-12 h-12 rounded-full mr-4"
                />
                {user && <AddFeed fullname={user.fullname} userId={user.userId} />}
              </Card>

              {/* Line dan sorting feed */}
              <div className="flex justify-between items-center text-sm text-gray-500">
                <hr className="flex-grow border-gray-300" />
                <span className="px-2">Sort by: Top</span>
              </div>

              {/* Feed */}
              {feeds.length > 0 ? (
                feeds.map((feed) => (
                  <FeedCard
                    key={feed.id}
                    profilePhoto={feed.user.profilePhotoPath || "https://via.placeholder.com/48"}
                    fullname={feed.user.name}
                    date={new Date(feed.createdAt).toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    })}                    
                    content={feed.content}
                  />
                ))
              ) : (
                <p className="text-center text-gray-500">No feeds available</p>
              )}
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
                <Button className="w-full bg-wbd-primary hover:bg-wbd-tertiary hover:text-white">
                  Follow
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}