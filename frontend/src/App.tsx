import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import Navbar from "./components/navbar";
import Home from "./pages/Home";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Users from "./pages/Users";
import { Toaster } from "react-hot-toast";
import Connections from "./pages/Connections";
import Profile from "./pages/Profile";
import Requests from "./pages/Requests";
import Footer from "./components/footer";
import StickyFooter from "./components/sticky-footer";

function App() {
  return (
    <Router>
      <Layout />
    </Router>
  );
}

function Layout() {
  const location = useLocation();

  const stickyFooterPaths = [
    "/userlist",
    "/connections/user/:userId",
  ];

  const isStickyFooter = stickyFooterPaths.some((path) =>
    matchPath(path, location.pathname)
  );

  return (
    <>
      <Navbar />
      <Toaster />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/userlist" element={<Users />} />
        <Route path="/connections/user/:userId" element={<Connections />} />
        <Route path="/requests/user/:userId" element={<Requests />} />
        <Route path="/profile/:userId" element={<Profile />} />
      </Routes>
      {isStickyFooter ? <StickyFooter /> : <Footer />}
    </>
  );
}

function matchPath(pattern: string, pathname: string): boolean {
  const regex = new RegExp(
    "^" + pattern.replace(/:[^\s/]+/g, "([^/]+)") + "$"
  );
  return regex.test(pathname);
}

export default App;