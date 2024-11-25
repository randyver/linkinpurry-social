import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <nav className="bg-blue-600 text-white p-4">
      <div className="max-w-7xl mx-auto flex justify-between">
        <h1 className="text-xl font-bold">
          <Link to="/">LinkIn Purry</Link>
        </h1>
        <div className="space-x-4">
          <Link to="/register" className="hover:underline">
            Register
          </Link>
          <Link to="/login" className="hover:underline">
            Login
          </Link>
          <Link to="/userlist" className="hover:underline">
            User List
          </Link>
        </div>
      </div>
    </nav>
  );
}