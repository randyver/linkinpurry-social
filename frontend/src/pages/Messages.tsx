import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { io } from "socket.io-client";
import { format } from "date-fns";
import { Button } from "../components/ui/button";
import { ArrowLeft, MessageCircleMore, Send } from "lucide-react";

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
  const navigate = useNavigate();
  const { oppositeUser } = useParams();
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
    const fetchChatHistory = async () => {
      if (oppositeUser) {
        // Fetch user details or chat history for the selected user
        const user = connectedUsers.find((u) => u.toId === oppositeUser);
        if (user) {
          setSelectedUser(user);
          if (!currentUser) return;
          // Fetch chat history
          const response = await fetch(
            `http://localhost:3000/api/chat/${currentUser}/${user.toId}`,
            {
              credentials: "include",
            },
          );
          const data = await response.json();
          console.log(data);
          if (data.success) {
            setChatHistory(data.data);
          }
          // Join the room for real-time messaging
          socket.emit("joinRoom", currentUser);
        }
      }
    };
    fetchChatHistory();
  }, [oppositeUser, connectedUsers, currentUser]);

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
      console.log("Connections response:", data);
      if (data.success) {
        setConnectedUsers(data.data);
      }
    };

    fetchConnections();
  }, [currentUser]);

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
    navigate(`/messages/${user.toId}`);
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

    await fetch("http://localhost:3000/api/send-push-notification", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        userId: selectedUser.toId,
        notificationType: "message",
        message: newMessage,
        url: `http://localhost:5173/messages/${currentUser}`,
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
      <div className="flex flex-col md:flex-row min-h-[600px] w-11/12 md:w-3/4 lg:w-2/3 bg-wbd-secondary shadow-2xl rounded-lg overflow-hidden">
        <div
          className={`w-full md:w-1/3 bg-wbd-secondary p-6 border-r ${
            isChatOpen ? "hidden md:block" : "block"
          }`}
        >
          <h2 className="text-xl xl:text-2xl font-semibold text-wbd-primary mb-6">
            Connected Users
          </h2>
          <ul className="space-y-4 max-h-[470px] overflow-y-auto custom-scrollbar">
            {connectedUsers.map((user) => (
              <li
                key={user.toId}
                className="flex items-center space-x-4 p-3 rounded-lg hover:bg-wbd-tertiary transition-all cursor-pointer"
                onClick={() => selectChat(user)}
              >
                <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-wbd-tertiary shadow-md">
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

        <div
          className={`w-full md:w-2/3 p-6 bg-wbd-background ${
            isChatOpen ? "block" : "hidden"
          } md:block`}
        >
          {!selectedUser ? (
            <div className="flex flex-col items-center justify-center h-full">
              <MessageCircleMore size={80} className="text-wbd-primary mb-4" />
              <p className="text-2xl text-center text-wbd-primary font-semibold">
                Select a user to start chatting!
              </p>
            </div>
          ) : (
            <>
              <div className="flex items-center mb-6">
                <button
                  onClick={goBack}
                  className="text-wbd-text hover:text-wbd-tertiary transition-all mr-4"
                >
                  <ArrowLeft size={24} />
                </button>
                <h2 className="text-xl font-semibold text-wbd-text">
                  Chat with {selectedUser.username}
                </h2>
              </div>
              <div className="bg-wbd-secondary p-4 h-[400px] overflow-y-auto border rounded-lg shadow-md custom-scrollbar">
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
                        className={`max-w-[80%] p-4 rounded-lg shadow-lg ${
                          msg.senderId === currentUser
                            ? "bg-wbd-tertiary text-white"
                            : "bg-wbd-background text-wbd-text"
                        }`}
                      >
                        <p>{msg.message}</p>
                        <p className="text-xs mt-2 opacity-80">
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
              <div className="flex items-center mt-6 h-[48px]">
                <input
                  type="text"
                  className="w-full h-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-wbd-tertiary text-wbd-text bg-wbd-secondary"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Type your message..."
                />
                <Button
                  onClick={sendMessage}
                  variant={"default"}
                  className="ml-4 h-full px-4 hover:scale-105 transition flex items-center justify-center"
                >
                  <Send className="text-xl" />
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
      <style>
        {`
          .custom-scrollbar::-webkit-scrollbar {
            width: 6px;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb {
            background-color: #3A4A3F;
            border-radius: 4px;
          }
          .custom-scrollbar::-webkit-scrollbar-track {
            background: transparent;
          }
        `}
      </style>
    </div>
  );
}

export default Messages;
