import { useEffect, useState } from "react";

interface User {
  id: number;
  username: string;
  email: string;
}

export default function Users() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch("http://localhost:3000/api/users");
        const data = await response.json();
        setUsers(data);
      } catch (error) {
        console.error("Failed to fetch users", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-blue-200 p-8">
      {/* User List */}
      <section className="bg-white shadow-lg rounded-lg p-6 mx-auto max-w-4xl">
        <h2 className="text-2xl font-bold text-blue-700 mb-4">List of Users</h2>
        {loading ? (
          <p className="text-blue-500 text-center">Loading...</p>
        ) : users.length > 0 ? (
          <ul className="space-y-4">
            {users.map((user) => (
              <li
                key={user.id}
                className="bg-blue-50 p-4 rounded-lg shadow-sm border border-blue-200 flex justify-between items-center"
              >
                <div>
                  <strong className="text-blue-700">{user.username}</strong>
                  <p className="text-blue-600 text-sm">{user.email}</p>
                </div>
                <button className="text-sm bg-blue-700 text-white px-4 py-2 rounded hover:bg-blue-800 transition">
                  View Profile
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-blue-600 text-center">No users found.</p>
        )}
      </section>
    </div>
  );
}