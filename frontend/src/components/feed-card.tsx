import { Card, CardContent, CardHeader } from "./ui/card";
import { MoreHorizontal } from "lucide-react"; // Importing the "three dots" icon
import { Button } from "./ui/button"; // Importing the Button from Shadcn UI
import { useState, useEffect, useRef } from "react"; // Import useRef for reference to dropdown and useEffect for event handling
import EditFeed from "./edit-feed"; // Import the EditFeed component

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
  const [isMenuOpen, setIsMenuOpen] = useState(false); // To toggle the visibility of the dropdown menu
  const [isEditModalOpen, setIsEditModalOpen] = useState(false); // To manage EditFeed modal visibility
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false); // To manage Delete confirmation modal visibility
  const [isDeleting, setIsDeleting] = useState(false); // To manage delete loading state

  const menuRef = useRef<HTMLDivElement>(null); // Reference for the dropdown menu

  // Close the menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false); // Close the menu if clicked outside
      }
    };

    // Add event listener for clicks outside the menu
    document.addEventListener("mousedown", handleClickOutside);

    // Cleanup event listener on component unmount
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleEdit = () => {
    setIsEditModalOpen(true); // Open the EditFeed modal
    setIsMenuOpen(false); // Close the menu
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false); // Close the EditFeed modal
  };

  const handleDelete = async () => {
    setIsDeleting(true); // Show loading indicator

    try {
      // Call the DELETE API endpoint using fetch
      const response = await fetch(`http://localhost:3000/api/delete-feed/${feedId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete feed");
      }

      // After successful deletion, close the delete modal
      setIsDeleteModalOpen(false);
      setIsMenuOpen(false); // Close the menu after deletion
      // Optionally, you can add a success notification or update state here
      alert("Feed deleted successfully!");
    } catch (error) {
      console.error("Failed to delete feed:", error);
      alert("Failed to delete feed");
    } finally {
      setIsDeleting(false); // Hide loading indicator
    }
  };

  const handleCancelDelete = () => {
    setIsDeleteModalOpen(false); // Close the confirmation modal without deleting
  };

  // Check if the current feed belongs to the logged-in user
  const isOwnFeed = userId === ownerFeedId;

  return (
    <div>
      <Card className="border border-gray-200 rounded-lg shadow-sm hover:shadow-lg transition-shadow duration-200 ease-in-out">
        <CardHeader className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center space-x-4">
            <img
              src={profilePhoto}
              alt={`${fullname}'s profile`}
              className="w-12 h-12 rounded-full object-cover"
            />
            <div>
              <h3 className="text-lg font-semibold text-gray-800">{fullname}</h3>
              <p className="text-sm text-gray-500">{date}</p>
            </div>
          </div>
          {/* More options icon */}
          <div className="relative" ref={menuRef}>
            <Button
              variant="ghost"
              className="text-gray-500 hover:text-gray-800 p-0"
              aria-label="More options"
              onClick={() => setIsMenuOpen(!isMenuOpen)} // Toggle the menu visibility
            >
              <MoreHorizontal className="w-5 h-5" />
            </Button>
            {isMenuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10">
                <ul className="text-sm text-gray-700">
                  {/* Show "View Profile" for everyone */}
                  <li>
                    <Button
                      onClick={() => {}}
                      className="block px-4 py-2 text-left  w-full text-sm"
                    >
                      View Profile
                    </Button>
                  </li>

                  {/* Show "Edit Feed" and "Delete Feed" only if it's the user's own feed */}
                  {isOwnFeed && (
                    <>
                      <li>
                        <Button
                          onClick={handleEdit}
                          className="block px-4 py-2 text-left  w-full text-sm"
                        >
                          Edit Feed
                        </Button>
                      </li>
                      <li>
                        <Button
                          onClick={() => setIsDeleteModalOpen(true)} // Show the delete confirmation modal
                          className="block px-4 py-2 text-left text-red-600  w-full text-sm"
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
          onClose={handleCloseEditModal} // Close modal callback
        />
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50 z-20">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full">
            <h3 className="text-lg font-semibold text-gray-800">Are you sure you want to delete this feed?</h3>
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
                disabled={isDeleting} // Disable button during delete process
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