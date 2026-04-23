import { useState } from "react";
import API from "../services/api";
import { useNavigate } from "react-router-dom";

function Login() {
  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await API.post("/login/", form);
      localStorage.setItem("token", res.data.access);
      localStorage.setItem("refresh", res.data.refresh);
      localStorage.setItem("username", res.data.username);
      localStorage.setItem("role", res.data.role);
      navigate(res.data.role === "admin" ? "/admin" : "/dashboard");
    } catch (err) {
      const msg = err.response?.data?.error || "Login failed. Try again.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-400 via-teal-400 to-cyan-300">
      <div className="bg-white rounded-3xl shadow-2xl w-96 p-8">

        {/* Logo */}
        <div className="flex flex-col items-center mb-6">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl flex items-center justify-center mb-3 shadow-lg">
            <span className="text-white text-3xl">🎓</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-800">University Portal</h1>
          <p className="text-gray-400 text-sm mt-1">Complaint Management System</p>
          <div className="flex items-center gap-1 mt-2 text-blue-500 text-xs">
            <span>🔒</span>
            <span>Secure Authentication</span>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 text-red-500 text-sm px-4 py-2 rounded-xl mb-4 border border-red-100">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="text-xs font-semibold text-gray-500 mb-1 flex items-center gap-1">
              <span>✉️</span> Username
            </label>
            <input
              type="text"
              name="username"
              placeholder="Enter your username"
              required
              onChange={handleChange}
              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:bg-white transition"
            />
          </div>

          <div className="mb-4">
            <label className="text-xs font-semibold text-gray-500 mb-1 flex items-center gap-1">
              <span>🔒</span> Password
            </label>
            <input
              type="password"
              name="password"
              placeholder="Enter your password"
              required
              onChange={handleChange}
              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:bg-white transition"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-500 to-blue-700 text-white py-3 rounded-xl font-semibold text-sm hover:opacity-90 transition disabled:opacity-60 flex items-center justify-center gap-2 mt-2"
          >
            {loading ? "Logging in..." : <>Login to Portal <span>→</span></>}
          </button>
        </form>

        <div className="flex items-center gap-2 my-4">
          <div className="flex-1 h-px bg-gray-200" />
          <span className="text-xs text-gray-400">or</span>
          <div className="flex-1 h-px bg-gray-200" />
        </div>

        <p className="text-center text-sm text-gray-500">
          Don't have an account?{" "}
          <span
            className="text-blue-500 font-semibold cursor-pointer hover:underline"
            onClick={() => navigate("/register")}
          >
            Register here
          </span>
        </p>

        <div className="mt-4 bg-blue-50 rounded-xl p-3 text-center">
          <p className="text-xs text-blue-500 font-medium">Students register themselves</p>
          <p className="text-xs text-gray-400">Admins are created by the system manager</p>
        </div>

        <p className="text-center text-xs text-gray-400 mt-4 flex items-center justify-center gap-1">
          <span>🔒</span> Your data is secure and encrypted
        </p>
      </div>
    </div>
  );
}

export default Login;
