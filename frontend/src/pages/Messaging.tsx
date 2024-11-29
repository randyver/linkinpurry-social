import { useState, useEffect } from "react";
import io from "socket.io-client";
import { useParams } from "react-router-dom";

const socket = io("http://localhost:3000/ws", {
  transports: ["websocket"],
  withCredentials: true,
});

const Messaging = () => {
  const { userId } = useParams();
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<
    Array<{ senderId: string; message: string }>
  >([]);
  const [receiverId, setReceiverId] = useState<string | undefined>(undefined);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    if (!userId) return;
    socket.emit("joinRoom", userId);

    socket.on("receiveMessage", (data) => {
      setMessages((prevMessages) => [...prevMessages, data]);
    });

    socket.on("error", (errorMessage) => {
      setError(errorMessage);
    });

    return () => {
      socket.off("receiveMessage");
      socket.off("error");
    };
  }, [userId]);

  const sendMessage = () => {
    if (!message || !receiverId) {
      return setError("Please enter a message and a receiver ID");
    }

    socket.emit("sendMessage", { receiverId, message });

    setMessage("");
  };

  return (
    <div className="max-w-2xl mx-auto mt-8 p-6 bg-white rounded-lg shadow-lg">
      <h1 className="text-2xl font-semibold mb-4">
        Chat with User {receiverId}
      </h1>

      {error && <div className="text-red-500 mb-4">{error}</div>}

      <div className="mb-4">
        <label
          htmlFor="receiverId"
          className="block text-sm font-medium text-gray-700"
        >
          Receiver ID:
        </label>
        <input
          type="text"
          id="receiverId"
          value={receiverId || ""}
          onChange={(e) => setReceiverId(e.target.value)}
          placeholder="Enter receiver user ID"
          className="text-black mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="mb-4">
        <label
          htmlFor="message"
          className="block text-sm font-medium text-gray-700"
        >
          Message:
        </label>
        <input
          type="text"
          id="message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Enter your message"
          className="text-black mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <button
        onClick={sendMessage}
        className="w-full bg-blue-500 text-white py-2 rounded-md shadow-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        Send Message
      </button>

      <h3 className="mt-6 text-xl font-semibold">Message History</h3>
      <div className="mt-4 h-64 overflow-y-scroll p-4 border border-gray-300 rounded-lg bg-gray-50">
        {messages.map((msg, idx) => (
          <div key={idx} className="mb-2">
            <strong className="text-sm text-blue-600">
              User {msg.senderId}:
            </strong>
            <p className="text-gray-700">{msg.message}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Messaging;
