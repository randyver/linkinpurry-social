// src/App.tsx
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/navbar";
import Home from "./pages/Home";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Users from "./pages/Users";
import { Toaster } from "react-hot-toast";
import Connections from "./pages/Connections";
import Profile from "./pages/Profile";
import Footer from "./components/footer";
import Messaging from "./pages/Messaging";

function App() {
  return (
    <Router>
      <Navbar />
      <Toaster />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/userlist" element={<Users/>} />
        <Route path="/connections/user/:userId" element={<Connections />} />
        <Route path="/profile/:userId" element={<Profile />} />
        <Route path="/messages/:userId" element={<Messaging />} /> {/* New Route for Messaging */}
      </Routes>
      <Footer />
    </Router>
  );
}

export default App;