import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Register from "./pages/Register";
import { Button } from "./components/ui/button";

const App = () => {
  return (
    <Router>
      <h1 className="text-blue-600">Register User</h1>
      <nav>
        <Link to="/register">Register</Link> |{" "}
        <Link to="/users">User List</Link>
        <Button>Click me!</Button>
      </nav>
      <Routes>
        <Route path="/register" element={<Register />} />
      </Routes>
    </Router>
  );
};

export default App;
