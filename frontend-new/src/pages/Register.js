import { useState } from "react";
import API from "../services/api";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { User, Mail, Lock, ArrowRight, GraduationCap } from "lucide-react";

export default function Register() {
  const [form, setForm] = useState({ username: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => { setForm({ ...form, [e.target.name]: e.target.value }); setError(""); };

  const handleSubmit = async (e) => {
    e.preventDefault(); setError(""); setLoading(true);
    try { await API.post("/register/", form); navigate("/"); }
    catch (err) {
      const data = err.response?.data;
      let msg = "Registration failed.";
      if (data?.error) msg = data.error;
      else if (data) { const k = Object.keys(data)[0]; const v = data[k]; msg = Array.isArray(v) ? v[0] : String(v); }
      setError(msg);
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen mesh-bg flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-20 right-20 w-72 h-72 bg-blue-600/20 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-20 left-20 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />

      <div className="w-full max-w-md relative z-10">
        <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <div className="glass rounded-3xl p-8 shadow-2xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
                <GraduationCap size={20} className="text-white" />
              </div>
              <span className="text-white font-bold text-lg">CCMS</span>
            </div>

            <h2 className="text-3xl font-bold text-white mb-1">Create account</h2>
            <p className="text-gray-400 mb-8">Join as a student</p>

            {error && (
              <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
                className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm px-4 py-3 rounded-xl mb-6 flex items-center gap-2">
                ⚠️ {error}
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {[
                { icon: <User size={16} />, name: "username", type: "text", placeholder: "Username" },
                { icon: <Mail size={16} />, name: "email", type: "email", placeholder: "Email address" },
                { icon: <Lock size={16} />, name: "password", type: "password", placeholder: "Password (min 6 chars)" },
              ].map((f) => (
                <div key={f.name} className="relative group">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-blue-400 transition">{f.icon}</span>
                  <input type={f.type} name={f.name} placeholder={f.placeholder} required onChange={handleChange}
                    className="w-full bg-white/5 border border-white/10 text-white placeholder-gray-500 pl-11 pr-4 py-3.5 rounded-xl focus:outline-none focus:border-blue-500 focus:bg-white/8 transition" />
                </div>
              ))}
              <motion.button type="submit" disabled={loading} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white py-3.5 rounded-xl font-semibold flex items-center justify-center gap-2 shadow-lg shadow-blue-500/30 transition disabled:opacity-60 mt-2">
                {loading
                  ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  : <><span>Create Account</span><ArrowRight size={18} /></>}
              </motion.button>
            </form>

            <p className="text-center mt-6 text-gray-500 text-sm">
              Already have an account?{" "}
              <span className="text-blue-400 font-semibold cursor-pointer hover:text-blue-300 transition" onClick={() => navigate("/")}>Sign in</span>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
