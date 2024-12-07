import { Link } from "react-router-dom";
import LinkinPurryLogo from "./image/linkinpurry-logo";

function Footer() {
  return (
    <footer className="bg-wbd-secondary py-8">
      <div className="max-w-7xl mx-auto px-4 space-y-20">
        <div className="flex flex-col sm:flex-row justify-between items-center">
          <div className="mb-4 sm:mb-0">
            <Link to="/home">
              <LinkinPurryLogo width={170} />
            </Link>
          </div>

          <div className="flex flex-wrap justify-center sm:justify-end space-x-24 text-med text-wbd-primary">
            <div className="flex flex-col items-center sm:items-start">
              <h3 className="font-bold">General</h3>
              <Link to="/about" className="hover:underline">
                About
              </Link>
            </div>
            <div className="flex flex-col items-center sm:items-start">
              <h3 className="font-bold">Directories</h3>
              <Link to="" className="hover:underline">
                Feeds
              </Link>
              <Link to="" className="hover:underline">
                Explore People
              </Link>
            </div>
          </div>
        </div>
        <div className="text-center mt-4 text-xs text-wbd-primary">
          &copy; LinkinPurry 2024
        </div>
      </div>
    </footer>
  );
}

export default Footer;
