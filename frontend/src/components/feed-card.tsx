import { Card, CardContent, CardHeader } from "./ui/card";
import { MoreHorizontal } from "lucide-react";
import { Button } from "./ui/button";
import { useState, useEffect, useRef } from "react";
import EditFeed from "./edit-feed";
import { Link } from "react-router-dom";

interface FeedCardProps {
  profilePhoto: string;
  fullname: string;
  date: string;
  content: string;
  feedId: number;
  userId: number;
  ownerFeedId: number;
}

export const FeedCard = ({
  profilePhoto,
  fullname,
  date,
  content,
  feedId,
  userId,
  ownerFeedId,
}: FeedCardProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleEdit = () => {
    setIsEditModalOpen(true);
    setIsMenuOpen(false);
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
  };

  const handleDelete = async () => {
    setIsDeleting(true);

    try {
      const response = await fetch(`http://localhost:3000/api/feed/${feedId}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to delete feed");
      }

      setIsDeleteModalOpen(false);
      setIsMenuOpen(false);
      alert("Feed deleted successfully!");
    } catch (error) {
      console.error("Failed to delete feed:", error);
      alert("Failed to delete feed");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCancelDelete = () => {
    setIsDeleteModalOpen(false);
  };

  const isOwnFeed = userId === ownerFeedId;

  return (
    <div>
      <Card className="border border-gray-200 rounded-lg shadow-sm transition-shadow duration-200 ease-in-out">
        <CardHeader className="flex flex-row justify-between p-4 border-b border-gray-200">
          <div className="flex gap-x-6">
            <img
              src={profilePhoto}
              alt={`${fullname}'s profile`}
              className="w-12 h-12 rounded-full object-cover"
            />
            <div>
              <div className="flex justify-start space-x-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">
                    {fullname}
                  </h3>
                  <p className="text-sm text-gray-500">{date}</p>
                </div>
              </div>
            </div>
          </div>
          {/* More options icon */}
          <div className="relative" ref={menuRef}>
            <Button
              variant="ghost"
              className="text-gray-500 hover:text-gray-800 p-0"
              aria-label="More options"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <MoreHorizontal className="w-5 h-5" />
            </Button>
            {isMenuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl z-10">
                <ul className="text-sm text-gray-700">
                  {/* Show "View Profile" for everyone */}
                  <li>
                    {/* redirect to profile/ownerFeedId */}
                    <Link to={`/profile/${ownerFeedId}`}
                      className="bg-white text-black rounded-none block px-4 py-2 text-left  w-full text-sm hover:bg-wbd-secondary cursor:pointer">
                      View Profile
                    </Link>
                  </li>

                  {/* Show "Edit Feed" and "Delete Feed" only if it's the user's own feed */}
                  {isOwnFeed && (
                    <>
                      <li>
                        <Button
                          onClick={handleEdit}
                          className="bg-white text-black rounded-none block px-4 py-2 text-left  w-full text-sm hover:bg-wbd-secondary cursor:pointer"
                        >
                          Edit Feed
                        </Button>
                      </li>
                      <li>
                        <Button
                          onClick={() => setIsDeleteModalOpen(true)}
                          className="bg-white rounded-none block px-4 py-2 text-left text-red-600  w-full text-sm hover:bg-wbd-secondary cursor:pointer"
                        >
                          Delete Feed
                        </Button>
                      </li>
                    </>
                  )}
                </ul>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-4">
          <p className="text-gray-600 text-sm">{content}</p>
        </CardContent>
      </Card>

      {/* Edit Feed Modal */}
      {isEditModalOpen && (
        <EditFeed
          fullname={fullname}
          userId={userId}
          feedId={feedId}
          initialContent={content}
          onClose={handleCloseEditModal}
        />
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50 z-20">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full">
            <h3 className="text-lg font-semibold text-gray-800">
              Are you sure you want to delete this feed?
            </h3>
            <div className="mt-4 flex justify-end space-x-4">
              <Button
                variant="outline"
                onClick={handleCancelDelete}
                className="text-gray-600 hover:bg-gray-100"
              >
                No
              </Button>
              <Button
                onClick={handleDelete}
                className="text-white bg-red-600 hover:bg-red-700"
                disabled={isDeleting}
              >
                {isDeleting ? "Deleting..." : "Yes"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
