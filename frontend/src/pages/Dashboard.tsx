import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const [user, setUser] = useState<any>(null);
  const [message, setMessage] = useState<string>("");
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
        setMessage("Error checking login status.");
      }
    };

    checkLoginStatus();
  }, [navigate]);

  const handleLogout = async () => {
    try {
      const response = await fetch("http://localhost:3000/api/logout", {
        method: "POST",
        credentials: "include",
      });

      if (response.ok) {
        navigate("/login");
      } else {
        setMessage("Logout failed");
      }
    } catch (error) {
      console.error("Error logging out:", error);
      setMessage("Error logging out");
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-gray-700">Dashboard</h2>

        {message && <p className="text-sm text-red-500">{message}</p>}

        {user ? (
          <div>
            <p className="text-gray-700">Welcome, {user.email}</p>
            <p className="mt-4 text-sm text-gray-500">User ID: {user.id}</p>
            <div className="mt-6">
              <button
                onClick={handleLogout}
                className="w-full bg-red-600 text-white p-2 rounded hover:bg-red-700 transition duration-200"
              >
                Logout
              </button>
            </div>
          </div>
        ) : (
          <p className="text-gray-500">Loading user information...</p>
        )}
      </div>
    </div>
  );
}