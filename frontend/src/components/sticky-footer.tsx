import { Link } from "react-router-dom";

function StickyFooter() {
  return (
    <footer
      className="bg-wbd-secondary text-wbd-primary text-center py-2 fixed bottom-0 left-0 right-0 shadow-md"
    >
      <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row justify-between items-center">
        <span>&copy; LinkinPurry 2024</span>
        <Link
          to="#"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="hover:underline text-med font-medium"
        >
          Back to Top
        </Link>
      </div>
    </footer>
  );
}

export default StickyFooter;