import { Button } from "../components/ui/button";
import { Link } from "react-router-dom";

export default function Landing() {
  return (
    <main className="flex flex-col lg:flex-row items-center justify-center lg:space-x-40 min-h-screen bg-wbd-background text-wbd-text px-6">
      {/* Logo */}
      <div className="mb-10">
        <img 
            src="person.svg" 
            alt="saly" 
            className="w-[300px] lg:w-[400px]"
        />
      </div>

      {/* Content */}
      <div className="flex flex-col justify-center lg:justify-start">
        {/* Title */}
        <h1 className="text-4xl xl:text-5xl font-bold mb-4">
          Welcome to LinkinPurry
        </h1>

        {/* Description */}
        <p className="text-lg xl:text-xl max-w-xl mx-auto mb-8 leading-relaxed drop-shadow-sm">
          Discover a community of professionals, share ideas, and grow your
          connections. Start building your network today!
        </p>

        {/* Buttons */}
        <div className="flex lg:flex-row sm:flex-row gap-4">
          <Link to="/login">
            <Button variant="secondary" className="px-10 xl:text-lg">
              Login
            </Button>
          </Link>
          <Link to="/register">
            <Button className="px-10 xl:text-lg">
              Register
            </Button>
          </Link>
        </div>
      </div>
    </main>
  );
}