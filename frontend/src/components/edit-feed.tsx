import React, { useState, useEffect, useRef } from "react";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { X } from "lucide-react";

interface EditFeedProps {
  fullname: string;
  userId: number;
  feedId: number;
  initialContent: string;
  onClose: () => void;
}

const EditFeed: React.FC<EditFeedProps> = ({ fullname, userId, feedId, initialContent, onClose }) => {
  const [isOpen, setIsOpen] = useState(true);
  const [postContent, setPostContent] = useState(initialContent);
  const maxLength = 280;

  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onClose]);

  const handleEdit = async () => {
    if (postContent.trim()) {
      try {
        const response = await fetch(`http://localhost:3000/api/feed/${feedId}`, {
          method: "PUT",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            content: postContent,
            userId: userId,
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to edit feed");
        }

        const data = await response.json();
        console.log("Feed edited:", data);

        setPostContent("");
        setIsOpen(false);
        onClose();
      } catch (error) {
        console.error("Error editing feed:", error);
        alert("Failed to edit feed");
      }
    } else {
      alert("Please write something before editing.");
    }
  };

  const characterCountMessage =
    postContent.length > maxLength
      ? "Feed content cannot exceed 280 characters"
      : `${postContent.length}/${maxLength}`;

  return (
    <div className="relative text-black">
      {/* Popover Content */}
      {isOpen && (
        <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-50 z-50">
          <div
            ref={modalRef}
            className="bg-white w-[600px] rounded-lg shadow-lg p-4 relative"
          >
            {/* Close Icon */}
            <span
              onClick={() => { setIsOpen(false); onClose(); }}
              className="absolute top-4 right-4 text-xl cursor-pointer"
            >
              <X size={24} />
            </span>

            {/* User Profile Info */}
            <div className="flex items-center mb-4">
              <img
                src="https://a.storyblok.com/f/191576/1200x800/a3640fdc4c/profile_picture_maker_before.webp"
                alt="Profile"
                className="w-12 h-12 rounded-full mr-4"
              />
              <div>
                {/* Display fullname passed from props */}
                <p className="font-semibold">{fullname}</p>
              </div>
            </div>

            {/* Text Area */}
            <Textarea
              placeholder="Edit your feed..."
              className="w-full h-[300px] resize-none p-2 bg-transparent focus:ring-0 focus:outline-none"
              value={postContent}
              onChange={(e) => setPostContent(e.target.value)}
            />

            {/* Character count and button */}
            <div className="mt-2 text-sm text-gray-500">
              {characterCountMessage}
            </div>

            {/* Footer Button */}
            <div className="flex justify-end mt-4">
              <Button
                onClick={handleEdit}
                className={`rounded-2xl ${postContent.length > maxLength ? 'bg-gray-300 text-gray-500' : ''}`}
                disabled={postContent.length > maxLength || !postContent.trim()}
              >
                Save
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EditFeed;