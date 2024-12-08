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
import Messages from "./pages/Messages";
import NotFound from "./pages/NotFound";
import DetailFeed from "./pages/DetailFeed";
import Landing from "./pages/Landing";

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

  const noFooterPaths = ["/messages", "/messages/:oppositeUser"];

  const isStickyFooter = stickyFooterPaths.some((path) =>
    matchPath(path, location.pathname)
  );

  const isNoFooter = noFooterPaths.some((path) =>
    matchPath(path, location.pathname)
  );

  return (
    <>
      <Navbar />
      <Toaster />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/home" element={<Home />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/userlist" element={<Users />} />
        <Route path="/connections/user/:userId" element={<Connections />} />
        <Route path="/requests/user/:userId" element={<Requests />} />
        <Route path="/profile/:userId" element={<Profile />} />
        <Route path="/messages" element={<Messages />} />
        <Route path="/not-found" element={<NotFound />} />
        <Route path="/feed/:feedId" element={<DetailFeed />} />
        <Route path="/messages/:oppositeUser" element={<Messages />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      {!isNoFooter && (isStickyFooter ? <StickyFooter /> : <Footer />)}
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