import React, { useState } from "react";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { X } from "lucide-react";
import { toast } from "react-hot-toast";

interface AddFeedProps {
  fullname: string;
  photo: string;
}

const AddFeed: React.FC<AddFeedProps> = ({ fullname, photo }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [postContent, setPostContent] = useState("");
  const maxLength = 280;

  const handlePost = async () => {
    if (postContent.trim()) {
      try {
        const response = await fetch("http://localhost:3000/api/feed", {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            content: postContent,
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to create feed");
        }

        toast.success("Feed posted successfully");

        setPostContent("");
        setIsOpen(false);
      } catch (error) {
        console.error("Error posting feed:", error);
        toast.error("Failed to post feed");
      }
    } else {
      toast.error("Feed content cannot be empty");
    }
  };

  const characterCountMessage =
    postContent.length > maxLength
      ? "Feed content cannot exceed 280 characters"
      : `${postContent.length}/${maxLength}`;

  return (
    <div className="relative w-full h-16 flex items-center">
      {/* Trigger Button */}
      <Button
        onClick={() => setIsOpen(true)}
        className="w-full flex justify-start items-center bg-white hover:bg-gray-100 border rounded-full px-4 py-2 text-black"
      >
        Start a post
      </Button>

      {/* Popover Content */}
      {isOpen && (
        <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-50 z-50">
          <div className="bg-white w-[600px] rounded-lg shadow-lg p-4 relative">
            {/* Close Icon */}
            <span
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 text-xl cursor-pointer"
            >
              <X size={24} /> {/* Icon close from lucide-react */}
            </span>

            {/* User Profile Info */}
            <div className="flex items-center mb-4">
              <img
                src={photo}
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
              placeholder="What do you want to talk about?"
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
                onClick={handlePost}
                className={`rounded-2xl ${postContent.length > maxLength ? 'bg-gray-300 text-gray-500' : ''}`}
                disabled={postContent.length > maxLength || !postContent.trim()}
              >
                Post
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddFeed;