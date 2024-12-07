import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader } from "../components/ui/card";
import { toast } from "react-hot-toast";
import EditFeed from "../components/edit-feed";
import { Edit2, Trash2 } from "lucide-react";

interface Feed {
  profilePhoto: string;
  fullname: string;
  content: string;
  createdAt: string;
  userId: number;
  feedId: number;
  user: User;
  id: number;
}

interface User {
  userId: number;
  fullname: string;
  profilePhotoPath: string;
  name: string;
  id: string;
}

export default function DetailFeed() {
  const [user, setUser] = useState<User | null>(null);
  const { feedId } = useParams<{ feedId: string }>();
  const navigate = useNavigate();
  const [feed, setFeed] = useState<Feed | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

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

  useEffect(() => {
    const fetchFeed = async () => {
      try {
        const response = await fetch(
          `http://localhost:3000/api/feed/${feedId}`,
          {
            method: "GET",
            credentials: "include",
          },
        );
        if (!response.ok) {
          throw new Error("Failed to fetch feed details.");
        }
        const data = await response.json();
        setFeed(data);
        console.log(data);
      } catch (error) {
        console.error("Error fetching feed:", error);
        toast.error("Failed to load feed details.");
      }
    };

    fetchFeed();
  }, [feedId]);

  const handleEdit = () => {
    setIsEditModalOpen(true);
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const response = await fetch(`http://localhost:3000/api/feed/${feedId}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!response.ok) {
        throw new Error("Failed to delete feed.");
      }
      toast.success("Feed deleted successfully.");
      navigate("/");
    } catch (error) {
      console.error("Error deleting feed:", error);
      toast.error("Failed to delete feed.");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCancelDelete = () => {
    setIsDeleteModalOpen(false);
  };

  if (!feed) {
    return <div>Loading...</div>;
  }

  const isOwnFeed = user?.userId.toString() === feed.user.id;

  return (
    <div className="flex flex-col items-center min-h-screen pt-40 bg-wbd-background p-6">
      <div className="w-full sm:w-3/4 md:w-2/3 lg:w-1/2">
        <Card className="border border-gray-300 rounded-lg shadow-lg">
          <CardHeader className="flex flex-row justify-between p-4 border-b border-gray-200">
            <div
              className="flex gap-x-6 cursor-pointer"
              onClick={() => navigate(`/profile/${feed.user.id}`)}
            >
              <img
                src={feed.user.profilePhotoPath}
                alt={`${feed.fullname}'s profile`}
                className="w-14 h-14 rounded-full object-cover border border-gray-200"
              />
              <div>
                <div className="flex justify-start space-x-4">
                  <div>
                    <h1 className="text-lg font-semibold text-gray-800">
                      {feed.user.name}
                    </h1>
                    <p className="text-sm text-gray-500">
                      {new Date(feed.createdAt).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6 bg-white rounded-b-lg">
            <p className="text-gray-700 text-base leading-relaxed">
              {feed.content}
            </p>
          </CardContent>
          {isOwnFeed && (
            <div className="mt-20 flex flex-col md:flex-row md:space-y-0 mb-6 md:space-x-4 mx-4 space-y-4 justify-end">
              <Button
                onClick={handleEdit}
                variant="secondary"
                className="w-full sm:w-auto"
              >
                <Edit2 className="mr-2" /> Edit Feed
              </Button>
              <Button
                onClick={() => setIsDeleteModalOpen(true)}
                variant="destructive"
                className="w-full sm:w-auto"
              >
                <Trash2 className="mr-2" /> Delete Feed
              </Button>
            </div>
          )}
        </Card>

        {isEditModalOpen && (
          <EditFeed
            fullname={feed.user.fullname}
            userId={Number(feed.user.id)}
            feedId={feed.id}
            initialContent={feed.content}
            onClose={() => setIsEditModalOpen(false)}
          />
        )}

        {isDeleteModalOpen && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-10">
            <div className="bg-white rounded-lg p-6 max-w-sm w-full shadow-lg">
              <h3 className="text-lg font-semibold text-gray-800">
                Are you sure you want to delete this feed?
              </h3>
              <div className="mt-4 flex justify-end space-x-4">
                <Button
                  onClick={handleCancelDelete}
                  variant="secondary"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  variant="destructive"
                >
                  {isDeleting ? "Deleting..." : "Delete"}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}