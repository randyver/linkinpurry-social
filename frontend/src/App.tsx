import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Register from "./pages/Register";

const App = () => {
  return (
    <Router>
      <h1 className="text-blue-600">Register User</h1>
      <nav>
        <Link to="/register">Register</Link> |{" "}
        <Link to="/users">User List</Link>
      </nav>
      <Routes>
        <Route path="/register" element={<Register />} />
      </Routes>
    </Router>
  );
};

export default App;
