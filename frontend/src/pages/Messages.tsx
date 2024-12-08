import { useState, useEffect, useCallback, useRef } from "react";
import { io } from "socket.io-client";
import { format } from "date-fns";
import { ArrowLeft } from "lucide-react";
import { MessageCircleMore } from 'lucide-react';

interface ConnectedUser {
  toId: string;
  name: string;
  username: string;
  profilePhotoPath: string;
}

interface ChatMessage {
  senderId: string;
  receiverId: string;
  message: string;
  timestamp: string;
}

const socket = io("http://localhost:3000", {
  transports: ["websocket"],
  withCredentials: true,
});

function Messages() {
  const [connectedUsers, setConnectedUsers] = useState<ConnectedUser[]>([]);
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState<string>("");
  const [selectedUser, setSelectedUser] = useState<ConnectedUser | null>(null);
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  const [isChatOpen, setIsChatOpen] = useState(false);

  useEffect(() => {
    const fetchCurrentUser = async () => {
      const response = await fetch("http://localhost:3000/api/check-session", {
        credentials: "include",
      });
      const data = await response.json();
      if (data.success) {
        setCurrentUser(data.user.userId);
      }
    };

    fetchCurrentUser();
  }, []);

  useEffect(() => {
    const fetchConnections = async () => {
      if (!currentUser) return;

      const response = await fetch(
        `http://localhost:3000/api/connections/user/${currentUser}`,
        {
          credentials: "include",
        },
      );
      const data = await response.json();
      if (data.success) {
        setConnectedUsers(data.data);
      }
    };

    fetchConnections();
  }, [currentUser]);

  useEffect(() => {
    if (selectedUser) {
      const fetchChatHistory = async () => {
        if (!currentUser) return;

        const response = await fetch(
          `http://localhost:3000/api/chat/${currentUser}/${selectedUser.toId}`,
          {
            credentials: "include",
          },
        );
        const data = await response.json();
        if (data.success) {
          setChatHistory(data.data);
        }

        socket.emit("joinRoom", currentUser);
      };

      fetchChatHistory();
    }
  }, [selectedUser, currentUser]);

  useEffect(() => {
    socket.on("receiveMessage", (data) => {
      if (selectedUser && selectedUser.toId === data.senderId) {
        setChatHistory((prev) => [...prev, data]);
      }
    });

    return () => {
      socket.off("receiveMessage");
    };
  }, [selectedUser]);

  const selectChat = useCallback((user: ConnectedUser) => {
    setIsChatOpen(true);
    setSelectedUser(user);
  }, []);

  const sendMessage = async () => {
    if (!newMessage || !selectedUser || !currentUser) return;

    const messageData: ChatMessage = {
      senderId: currentUser,
      receiverId: selectedUser.toId,
      message: newMessage,
      timestamp: new Date().toISOString(),
    };

    socket.emit("sendMessage", messageData);

    const newChatMessage: ChatMessage = {
      senderId: messageData.senderId,
      receiverId: messageData.receiverId,
      message: messageData.message,
      timestamp: messageData.timestamp,
    };

    setChatHistory((prev) => [...prev, newChatMessage]);
    setNewMessage("");

    await fetch("http://localhost:3000/api/notify-chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        senderId: currentUser,
        receiverId: selectedUser.toId,
        message: newMessage,
      }),
    }).catch((err) => console.error("Failed to notify chat:", err));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && newMessage.trim() !== "") {
      sendMessage();
    }
  };

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatHistory]);

  // Function to go back to the connected user list
  const goBack = () => {
    setIsChatOpen(false);
    setSelectedUser(null);
  };

  return (
    <div className="bg-wbd-background h-screen flex items-center justify-center">
      <div className="flex min-h-[600px] w-3/5 bg-wbd-background mt-16 fixed">
        {/* connected user section */}
        <div
          className={`w-full md:w-1/3 bg-wbd-secondary p-6 border-r-4 border-wbd-background rounded-lg ${
            isChatOpen ? "hidden md:block" : "block"
          }`}
        >
          <h2 className="text-xl xl:text-2xl font-semibold text-wbd-text mb-6">
            Connected Users
          </h2>
          <ul className="space-y-4">
            {connectedUsers.map((user) => (
              <li
                key={user.toId}
                className="flex items-center space-x-4 p-3 rounded-lg hover:bg-wbd-tertiary cursor-pointer"
                onClick={() => selectChat(user)}
              >
                <div className="w-12 h-12 rounded-full overflow-hidden">
                  <img
                    src={user.profilePhotoPath || "/default-avatar.png"}
                    alt={user.username}
                    className="w-full h-full object-cover"
                  />
                </div>
                <span className="text-lg font-medium text-wbd-text">
                  {user.username}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* chat section */}
        <div
          className={`w-full p-6 bg-wbd-secondary rounded-md ${isChatOpen ? "block" : "hidden"} md:block`}
        >
          {!selectedUser ? (
            <div className="flex flex-col mt-40">
              <p className="text-center text-wbd-text text-xl xl:text-2xl xl:mx-24 font-semibold">Connect with users to start chatting. Select a user from the list to begin!</p>
              <MessageCircleMore size={100} className="mx-auto mt-8 text-wbd-text" />
            </div>
          ) : (
            <>
              {/* Tombol back */}
              <button
                onClick={goBack}
                className="text-wbd-text flex items-center mb-4 p-2 rounded-lg hover:scale-105 transition-transform"
              >
                <ArrowLeft size={20} className="mr-2" />
                Back
              </button>

              <h2 className="text-2xl font-semibold text-wbd-text mb-4">
                Chat with {selectedUser.username}
              </h2>
              <div className="bg-wbd-background p-6 h-[400px] overflow-y-auto border border-gray-300 rounded-lg shadow-sm mb-6">
                <div className="space-y-4">
                  {chatHistory.map((msg) => (
                    <div
                      key={msg.timestamp}
                      className={`flex ${
                        msg.senderId === currentUser
                          ? "justify-end"
                          : "justify-start"
                      }`}
                    >
                      <div
                        className={`max-w-[80%] p-3 rounded-lg ${
                          msg.senderId === currentUser
                            ? "bg-wbd-tertiary text-white"
                            : "bg-wbd-secondary text-wbd-text"
                        }`}
                      >
                        <p>{msg.message}</p>
                        <p
                          className={`text-xs ${
                            msg.senderId === currentUser
                              ? "text-gray-300"
                              : "text-gray-500"
                          } mt-1`}
                        >
                          {format(
                            new Date(msg.timestamp),
                            "MMM dd, yyyy hh:mm a",
                          )}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                <div ref={chatEndRef} />
              </div>
              <div className="flex items-center space-x-4">
                <input
                  type="text"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-wbd-tertiary text-wbd-text bg-wbd-background"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Type your message..."
                />
                <button
                  onClick={sendMessage}
                  className="bg-wbd-tertiary text-white p-3 rounded-lg"
                >
                  Send
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default Messages;