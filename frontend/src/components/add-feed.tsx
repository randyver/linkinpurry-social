import React, { useState } from "react";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { X } from "lucide-react";

interface AddFeedProps {
  fullname: string;
  userId: number;
}

const AddFeed: React.FC<AddFeedProps> = ({ fullname, userId }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [postContent, setPostContent] = useState("");

  const handlePost = async () => {
    if (postContent.trim()) {
      try {
        const response = await fetch("http://localhost:3000/api/add-feed", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            content: postContent,
            userId: userId,
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to create feed");
        }

        const data = await response.json();
        console.log("Feed created:", data);

        setPostContent("");
        setIsOpen(false);
      } catch (error) {
        console.error("Error posting feed:", error);
        alert("Failed to create post");
      }
    } else {
      alert("Please write something before posting.");
    }
  };

  return (
    <div className="relative">
      {/* Trigger Button */}
      <Button
        onClick={() => setIsOpen(true)}
        className="w-full flex justify-start items-center bg-gray-100 border rounded-full px-4 py-2 text-gray-600"
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
              <X size={24} /> {/* Ikon close dari lucide-react */}
            </span>

            {/* User Profile Info */}
            <div className="flex items-center mb-4">
              <img
                src="https://a.storyblok.com/f/191576/1200x800/a3640fdc4c/profile_picture_maker_before.webp"
                alt="Profile"
                className="w-12 h-12 rounded-full mr-4"
              />
              <div>
                {/* Menampilkan fullname yang diterima dari props */}
                <p className="font-semibold">{fullname}</p>
              </div>
            </div>

            {/* Text Area */}
            <Textarea
              placeholder="What do you want to talk about?"
              className="w-full h-[300px] resize-none p-2 bg-transparent focus:ring-0 focus:outline-none" // Tidak ada border, latar belakang transparan, dan tanpa efek fokus
              value={postContent}
              onChange={(e) => setPostContent(e.target.value)}
            />

            {/* Footer Button */}
            <div className="flex justify-end mt-4">
              <Button
                onClick={handlePost}
                className={`rounded-2xl ${postContent.trim() ? '' : 'bg-gray-300 text-gray-500'}`}
                disabled={!postContent.trim()}
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