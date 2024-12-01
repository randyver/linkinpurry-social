import { Link, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";

import { Button } from "./ui/button";

import LinkinPurryLogo from "./image/linkinpurry-logo";
import {
  UsersRound,
  UserRoundPlus,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

interface User {
  id: string;
  username: string;
  email: string;
  profilePhotoPath: string;
}

function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [hovered, setHovered] = useState<string | null>(null);

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const sessionResponse = await fetch(
          "http://localhost:3000/api/check-session",
          {
            method: "GET",
            credentials: "include",
          },
        );

        if (sessionResponse.ok) {
          const sessionData = await sessionResponse.json();
          setIsLoggedIn(true);

          const userResponse = await fetch(
            `http://localhost:3000/api/user?email=${sessionData.user.email}`,
            { method: "GET" },
          );

          if (userResponse.ok) {
            const userData = await userResponse.json();
            console.log(userData);
            setUser(userData);
          }
        } else {
          setIsLoggedIn(false);
          setUser(null);
        }
      } catch (error) {
        setIsLoggedIn(false);
        setUser(null);
      }
    };

    fetchSession();
  }, [location]);

  const handleLogout = async () => {
    try {
      const response = await fetch("http://localhost:3000/api/logout", {
        method: "POST",
        credentials: "include",
      });

      if (response.ok) {
        setIsLoggedIn(false);
        setUser(null);
        navigate("/login");
      }
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  return (
    <nav className="bg-wbd-secondary py-4 shadow-sm fixed top-0 w-full z-50">
      <div className="max-w-7xl mx-auto flex justify-between items-center px-4">
        <div>
          <Link to="/" className="flex items-center">
            <LinkinPurryLogo width={200} />
          </Link>
        </div>

        {isLoggedIn ? (
          <div className="space-x-8 flex items-center">
            <div className="space-x-2 items-center flex flex-row">
              <div
                className="relative flex flex-col items-center group"
                onMouseEnter={() => setHovered("requests")}
                onMouseLeave={() => setHovered(null)}
              >
                <UserRoundPlus size={24} className="text-wbd-primary" />
                <Link
                  to=""
                  className={`text-lg font-medium text-wbd-primary relative px-4`}
                >
                  Requests
                  <span
                    className={`absolute -bottom-4 left-0 h-1 bg-wbd-primary transition-all duration-300 ${
                      location.pathname === "" && hovered !== "explore"
                        ? "w-full"
                        : hovered === "requests"
                          ? "w-full"
                          : "w-0"
                    }`}
                  ></span>
                </Link>
              </div>

              <div
                className="relative flex flex-col items-center group"
                onMouseEnter={() => setHovered("explore")}
                onMouseLeave={() => setHovered(null)}
              >
                <UsersRound size={24} className="text-wbd-primary" />
                <Link
                  to="/userlist"
                  className={`text-lg font-medium text-wbd-primary relative px-4`}
                >
                  Explore
                  <span
                    className={`absolute -bottom-4 left-0 h-1 bg-wbd-primary transition-all duration-300 ${
                      location.pathname === "/userlist" &&
                      hovered !== "requests"
                        ? "w-full"
                        : hovered === "explore"
                          ? "w-full"
                          : "w-0"
                    }`}
                  ></span>
                </Link>
              </div>
            </div>

            <div className="relative flex items-center space-x-4">
              <div className="w-10 h-10 rounded-full overflow-hidden">
                <img
                  src={user?.profilePhotoPath}
                  alt="User's Profile"
                  className="w-full h-full object-cover"
                />
              </div>
              <button
                className="text-lg font-medium text-wbd-primary flex items-center relative"
                onClick={() => setDropdownOpen((prev) => !prev)}
              >
                {user?.username}
                {dropdownOpen ? (
                  <ChevronUp className="ml-2" size={20} />
                ) : (
                  <ChevronDown className="ml-2" size={20} />
                )}
              </button>
              {dropdownOpen && (
                <div className="absolute top-full right-0 mt-4 bg-white shadow-lg rounded-md w-40 z-10">
                  <Link
                    to={`/profile/${user?.id}`}
                    className="block px-4 py-2 text-wbd-primary text-sm hover:bg-gray-100"
                  >
                    Profile
                  </Link>
                  <Link
                    to="/messages"
                    className="block px-4 py-2 text-sm text-wbd-primary hover:bg-gray-100"
                  >
                    Messages
                  </Link>
                  <button
                    className="block px-4 py-2 text-sm text-wbd-primary hover:bg-gray-100 hover:text-wbd-red w-full text-left"
                    onClick={handleLogout}
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="space-x-4 flex items-center">
            <Link to="/login">
              <Button variant="default" size="sm">
                Log In
              </Button>
            </Link>
            <Link to="/register">
              <Button variant="default" size="sm">
                Join Now
              </Button>
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
