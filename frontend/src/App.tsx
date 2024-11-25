// src/App.tsx
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/navbar";
import Home from "./pages/Home";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Users from "./pages/Users";
import Dashboard from "./pages/Dashboard";
import { Toaster } from "react-hot-toast";
import Connections from "./pages/Connections";

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
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/connections/user/:userId" element={<Connections />} />
      </Routes>
    </Router>
  );
}

export default App;