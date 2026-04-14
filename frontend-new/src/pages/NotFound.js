import { useNavigate } from "react-router-dom";

function NotFound() {
  const navigate = useNavigate();
  const role = localStorage.getItem("role");

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 text-center px-4">
      <h1 className="text-8xl font-bold text-indigo-500 mb-4">404</h1>
      <p className="text-2xl font-semibold text-gray-700 mb-2">Page not found</p>
      <p className="text-gray-400 mb-8">The page you're looking for doesn't exist.</p>
      <button
        onClick={() => navigate(role === "admin" ? "/admin" : role === "student" ? "/dashboard" : "/")}
        className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition"
      >
        Go back home
      </button>
    </div>
  );
}

export default NotFound;
