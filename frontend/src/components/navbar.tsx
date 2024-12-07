import { Link, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { MessageSquareText, Menu, X } from "lucide-react";

import { Button } from "./ui/button";
import LinkinPurryLogo from "./image/linkinpurry-logo";
import {
  UsersRound,
  UserRoundPlus,
  ChevronDown,
  ChevronUp,
  House,
  Compass,
  LogOut,
} from "lucide-react";

interface User {
  id: string;
  name: string;
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
  const [menuOpen, setMenuOpen] = useState(false);

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
            `http://localhost:3000/api/user?userId=${sessionData.user.userId}`,
            { method: "GET" },
          );

          if (userResponse.ok) {
            const userData = await userResponse.json();
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

  const menuItems = [
    {
      name: "Home",
      to: "/home",
      icon: <House size={24} className="text-wbd-primary" />,
    },
    {
      name: "Explore",
      to: "/userlist",
      icon: <Compass size={24} className="text-wbd-primary" />,
    },
    {
      name: "Network",
      to: `/connections/user/${user?.id}`,
      icon: <UsersRound size={24} className="text-wbd-primary" />,
    },
    {
      name: "Requests",
      to: `/requests/user/${user?.id}`,
      icon: <UserRoundPlus size={24} className="text-wbd-primary" />,
    },
    {
      name: "Chat",
      to: "/messages",
      icon: <MessageSquareText size={24} className="text-wbd-primary" />,
    },
  ];

  return (
    <nav className="bg-wbd-secondary py-4 shadow-sm fixed top-0 w-full z-50">
      <div className="max-w-7xl mx-auto flex justify-between items-center px-4">
        {/* Logo */}
        <div>
          <Link to="/home" className="flex items-center">
            <LinkinPurryLogo width={200} />
          </Link>
        </div>

        {/* Desktop Menu */}
        <div className="hidden md:flex space-x-12 items-center">
          {isLoggedIn ? (
            <>
              {menuItems.map(({ name, to, icon }, index) => (
                <Link
                  key={index}
                  to={to}
                  className="relative flex flex-col items-center group text-center"
                >
                  {icon}
                  <span className="text-lg font-medium text-wbd-primary">
                    {name}
                  </span>
                </Link>
              ))}
              <div className="relative flex items-center space-x-4">
                <div className="w-10 h-10 rounded-full overflow-hidden">
                  <img
                    src={
                      user?.profilePhotoPath
                        ? user?.profilePhotoPath
                        : "/default-profile-pic.png"
                    }
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
                    <button
                      className="block px-4 py-2 text-sm text-wbd-primary hover:bg-gray-100 hover:text-wbd-red w-full text-left"
                      onClick={handleLogout}
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
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
            </>
          )}
        </div>

        {/* Hamburger Menu */}
        <div className="md:hidden flex items-center text-wbd-text">
          <button onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X size={32} /> : <Menu size={32} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden flex flex-col space-y-8 mt-4 bg-wbd-secondary px-4 pb-4">
          {isLoggedIn ? (
            <>
              {menuItems.map(({ name, to, icon }, index) => (
                <Link
                  key={index}
                  to={to}
                  className="flex items-center text-lg font-medium text-wbd-primary hover:scale-105 transition-transform"
                  onClick={() => setMenuOpen(false)}
                >
                  <span className="mr-2">{icon}</span>
                  {name}
                </Link>
              ))}
              <button
                className="flex items-center text-lg font-medium text-wbd-primary text-start hover:scale-105 transition-transform"
                onClick={handleLogout}
              >
                <LogOut size={24} className="mr-2" />
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="flex items-center text-lg font-medium text-wbd-primary hover:scale-105 transition-transform"
                onClick={() => setMenuOpen(false)}
              >
                <UserRoundPlus size={24} className="mr-2" />
                Log In
              </Link>
              <Link
                to="/register"
                className="flex items-center text-lg font-medium text-wbd-primary hover:scale-105 transition-transform"
                onClick={() => setMenuOpen(false)}
              >
                <UserRoundPlus size={24} className="mr-2" />
                Join Now
              </Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}

export default Navbar;