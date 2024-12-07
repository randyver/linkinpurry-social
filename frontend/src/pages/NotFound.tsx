import { Frown } from "lucide-react";
import { Button } from "../components/ui/button";
import { useNavigate } from "react-router-dom";

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-center min-h-screen bg-wbd-background p-6">
      <div className="text-center max-w-md w-full text-wbd-text">
        <Frown className="text-6xl text-wbd-tertiary mb-4 mx-auto w-40 h-40" />
        <h1 className="text-4xl font-semibold mb-4">404 - Not Found</h1>
        <p className="text-lg mb-6">
          Oops! The page you are looking for does not exist.
        </p>
        <Button
          onClick={() => {
            navigate("/home");
          }}
        >
          Go Home
        </Button>
      </div>
    </div>
  );
}
