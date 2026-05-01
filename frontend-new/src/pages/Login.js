import { useState } from "react";
import API from "../services/api";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Lock, Mail, ArrowRight, GraduationCap } from "lucide-react";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => { setForm({ ...form, [e.target.name]: e.target.value }); setError(""); };

  const handleSubmit = async (e) => {
    e.preventDefault(); setError(""); setLoading(true);
    try {
      const res = await API.post("/login/", form);
      localStorage.setItem("token", res.data.access);
      localStorage.setItem("refresh", res.data.refresh);
      localStorage.setItem("username", res.data.username);
      localStorage.setItem("role", res.data.role);
      navigate(res.data.role === "admin" ? "/admin" : "/dashboard");
    } catch (err) { setError(err.response?.data?.error || "Invalid credentials."); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen mesh-bg flex items-center justify-center p-4 relative overflow-hidden">
      {/* Floating orbs */}
      <div className="absolute top-20 left-20 w-72 h-72 bg-indigo-600/20 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-20 right-20 w-96 h-96 bg-purple-600/15 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-pink-600/5 rounded-full blur-3xl" />

      <div className="w-full max-w-5xl grid lg:grid-cols-2 gap-8 items-center relative z-10">
        {/* Left */}
        <motion.div initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.7, ease: "easeOut" }}
          className="hidden lg:block text-white">
          <div className="flex items-center gap-3 mb-10">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <GraduationCap size={24} />
            </div>
            <span className="text-xl font-bold">CCMS</span>
          </div>
          <h1 className="text-5xl font-extrabold leading-tight mb-6">
            College Complaint<br />
            <span className="gradient-text">Management System</span>
          </h1>
          <p className="text-gray-400 text-lg mb-10 leading-relaxed">
            A centralized platform to submit, track, and resolve complaints efficiently with full transparency.
          </p>
          <div className="space-y-4">
            {[
              { icon: "🚀", title: "Instant Submission", desc: "Submit complaints in seconds" },
              { icon: "📊", title: "Real-time Tracking", desc: "Monitor status live" },
              { icon: "🔔", title: "Smart Notifications", desc: "Get notified on every update" },
            ].map((f) => (
              <motion.div key={f.title} whileHover={{ x: 6 }}
                className="flex items-center gap-4 glass rounded-2xl px-5 py-4">
                <span className="text-2xl">{f.icon}</span>
                <div>
                  <p className="font-semibold text-white">{f.title}</p>
                  <p className="text-gray-400 text-sm">{f.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Right — Login card */}
        <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }}>
          <div className="glass rounded-3xl p-8 shadow-2xl">
            <div className="flex items-center gap-3 mb-2 lg:hidden">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                <GraduationCap size={18} className="text-white" />
              </div>
              <span className="text-white font-bold">CCMS</span>
            </div>
            <h2 className="text-3xl font-bold text-white mb-1">Welcome back</h2>
            <p className="text-gray-400 mb-8">Sign in to continue</p>

            {error && (
              <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
                className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm px-4 py-3 rounded-xl mb-6 flex items-center gap-2">
                ⚠️ {error}
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="relative group">
                <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-indigo-400 transition" />
                <input type="email" name="email" placeholder="Email address" required onChange={handleChange}
                  className="w-full bg-white/5 border border-white/10 text-white placeholder-gray-500 pl-11 pr-4 py-3.5 rounded-xl focus:outline-none focus:border-indigo-500 focus:bg-white/8 transition" />
              </div>
              <div className="relative group">
                <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-indigo-400 transition" />
                <input type="password" name="password" placeholder="Password" required onChange={handleChange}
                  className="w-full bg-white/5 border border-white/10 text-white placeholder-gray-500 pl-11 pr-4 py-3.5 rounded-xl focus:outline-none focus:border-indigo-500 focus:bg-white/8 transition" />
              </div>
              <motion.button type="submit" disabled={loading} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white py-3.5 rounded-xl font-semibold flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/30 transition disabled:opacity-60 mt-2">
                {loading
                  ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  : <><span>Sign In</span><ArrowRight size={18} /></>}
              </motion.button>
            </form>

            <p className="text-center mt-6 text-gray-500 text-sm">
              No account?{" "}
              <span className="text-indigo-400 font-semibold cursor-pointer hover:text-indigo-300 transition" onClick={() => navigate("/register")}>
                Register here
              </span>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
