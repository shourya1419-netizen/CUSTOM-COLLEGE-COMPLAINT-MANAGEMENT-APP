import { useState, useEffect } from "react";
import API from "../services/api";
import Navbar from "../components/Navbar";
import { motion, AnimatePresence } from "framer-motion";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { Wifi, Droplet, Fan, Trash2, FileText, Plus, AlertCircle, TrendingUp } from "lucide-react";
import { useNavigate } from "react-router-dom";

const STATUS_CFG = {
  pending:     { gradient: "from-amber-400 to-orange-500",  light: "bg-amber-50 border-amber-100",   badge: "bg-amber-100 text-amber-700",  dot: "bg-amber-400",  glow: "shadow-amber-200/50" },
  in_progress: { gradient: "from-blue-400 to-cyan-500",     light: "bg-blue-50 border-blue-100",     badge: "bg-blue-100 text-blue-700",    dot: "bg-blue-400",   glow: "shadow-blue-200/50" },
  resolved:    { gradient: "from-emerald-400 to-green-500", light: "bg-emerald-50 border-emerald-100", badge: "bg-emerald-100 text-emerald-700", dot: "bg-emerald-400", glow: "shadow-emerald-200/50" },
  closed:      { gradient: "from-gray-400 to-slate-500",    light: "bg-gray-50 border-gray-100",     badge: "bg-gray-100 text-gray-600",    dot: "bg-gray-400",   glow: "shadow-gray-200/50" },
};

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 px-4 py-3">
      <p className="text-xs text-gray-500 mb-1">{label}</p>
      <p className="text-lg font-bold text-indigo-600">{payload[0].value}</p>
    </div>
  );
  return null;
};

export default function Dashboard() {
  const [complaints, setComplaints] = useState([]);
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem("darkMode") === "true");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState(null);
  const navigate = useNavigate();
  const username = localStorage.getItem("username") || "Student";

  useEffect(() => { fetchComplaints(); }, []);

  useEffect(() => { localStorage.setItem("darkMode", darkMode); }, [darkMode]);

  const fetchComplaints = async () => {
    setLoading(true); setError("");
    try { const r = await API.get("/complaints/"); setComplaints(r.data); }
    catch { setError("Failed to load complaints."); }
    finally { setLoading(false); }
  };

  const deleteComplaint = async (id) => {
    if (!window.confirm("Delete this complaint?")) return;
    setDeletingId(id);
    try { await API.delete(`/complaints/${id}/delete/`); setComplaints(p => p.filter(c => c.id !== id)); }
    catch { alert("Failed to delete."); }
    finally { setDeletingId(null); }
  };

  const getIcon = (title) => {
    const t = title.toLowerCase();
    if (t.includes("water")) return <Droplet size={16} />;
    if (t.includes("wifi") || t.includes("network")) return <Wifi size={16} />;
    if (t.includes("fan")) return <Fan size={16} />;
    return <FileText size={16} />;
  };

  const counts = {
    total: complaints.length,
    pending: complaints.filter(c => c.status === "pending").length,
    in_progress: complaints.filter(c => c.status === "in_progress").length,
    resolved: complaints.filter(c => c.status === "resolved").length,
    closed: complaints.filter(c => c.status === "closed").length,
  };

  const chartData = [
    { name: "Pending", value: counts.pending },
    { name: "In Progress", value: counts.in_progress },
    { name: "Resolved", value: counts.resolved },
    { name: "Closed", value: counts.closed },
  ];

  const STAT_CARDS = [
    { label: "Total Complaints", value: counts.total, icon: "📋", gradient: "from-indigo-500 via-purple-500 to-pink-500", glow: "shadow-indigo-300/40" },
    { label: "Pending",          value: counts.pending, icon: "🕐", gradient: "from-amber-400 via-orange-400 to-red-400", glow: "shadow-amber-300/40" },
    { label: "In Progress",      value: counts.in_progress, icon: "⚡", gradient: "from-blue-400 via-cyan-400 to-teal-400", glow: "shadow-blue-300/40" },
    { label: "Resolved",         value: counts.resolved, icon: "✅", gradient: "from-emerald-400 via-green-400 to-lime-400", glow: "shadow-emerald-300/40" },
  ];

  return (
    <div className={darkMode ? "dark" : ""}>
      <div className="flex min-h-screen bg-[#f8f9ff] dark:bg-[#0a0a14] text-gray-900 dark:text-white">
        <Navbar darkMode={darkMode} setDarkMode={setDarkMode} />

        <div className="flex-1 overflow-auto">
          {/* Top header bar */}
          <div className="sticky top-0 z-10 bg-white/80 dark:bg-[#0a0a14]/80 backdrop-blur border-b border-gray-100 dark:border-white/5 px-6 py-4 flex items-center justify-between mt-14 md:mt-0">
            <div>
              <h1 className="text-xl font-bold text-gray-800 dark:text-white">
                Good day, <span className="gradient-text">{username}</span> 👋
              </h1>
              <p className="text-xs text-gray-400 mt-0.5">Here's your complaint overview</p>
            </div>
            <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
              onClick={() => navigate("/create")}
              className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-2.5 rounded-xl text-sm font-semibold shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 transition">
              <Plus size={16} /> New Complaint
            </motion.button>
          </div>

          <div className="p-6">
            {error && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-500/30 text-red-600 dark:text-red-400 px-4 py-3 rounded-xl mb-6 flex items-center gap-2 text-sm">
                <AlertCircle size={15} /> {error}
                <button onClick={fetchComplaints} className="ml-auto underline">Retry</button>
              </motion.div>
            )}

            {/* Stat cards */}
            <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
              {STAT_CARDS.map((s, i) => (
                <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
                  className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${s.gradient} p-5 shadow-xl ${s.glow} text-white`}>
                  <div className="absolute -top-4 -right-4 w-20 h-20 bg-white/10 rounded-full" />
                  <div className="absolute -bottom-6 -right-2 w-28 h-28 bg-white/5 rounded-full" />
                  <div className="relative">
                    <span className="text-2xl">{s.icon}</span>
                    <p className="text-4xl font-extrabold mt-2">{s.value}</p>
                    <p className="text-white/70 text-sm mt-1 font-medium">{s.label}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Chart */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
              className="bg-white dark:bg-[#111120] rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm p-6 mb-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="font-bold text-gray-800 dark:text-white">Complaint Trends</h2>
                  <p className="text-xs text-gray-400 mt-0.5">Status distribution overview</p>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 px-3 py-1.5 rounded-full">
                  <TrendingUp size={12} /> Live data
                </div>
              </div>
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.04)" />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="value" stroke="#6366f1" strokeWidth={2.5} fill="url(#grad)" dot={{ fill: "#6366f1", strokeWidth: 2, r: 4 }} activeDot={{ r: 6, fill: "#6366f1" }} />
                </AreaChart>
              </ResponsiveContainer>
            </motion.div>

            {/* Complaints */}
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-bold text-gray-800 dark:text-white">My Complaints
                <span className="ml-2 text-xs font-normal text-gray-400 bg-gray-100 dark:bg-white/5 px-2 py-0.5 rounded-full">{complaints.length}</span>
              </h2>
            </div>

            {loading ? (
              <div className="flex justify-center items-center py-24">
                <div className="relative">
                  <div className="w-12 h-12 border-4 border-indigo-100 dark:border-indigo-900 rounded-full" />
                  <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin absolute top-0 left-0" />
                </div>
              </div>
            ) : complaints.length === 0 && !error ? (
              <div className="text-center py-24">
                <div className="text-6xl mb-4">📭</div>
                <p className="text-lg font-semibold text-gray-600 dark:text-gray-300">No complaints yet</p>
                <p className="text-sm text-gray-400 mt-1 mb-6">Submit your first complaint to get started</p>
                <motion.button whileHover={{ scale: 1.04 }} onClick={() => navigate("/create")}
                  className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold shadow-lg shadow-indigo-500/25">
                  Create Complaint
                </motion.button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                <AnimatePresence>
                  {complaints.map((c, i) => {
                    const cfg = STATUS_CFG[c.status] || STATUS_CFG.pending;
                    return (
                      <motion.div key={c.id}
                        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ delay: i * 0.05 }} whileHover={{ y: -5 }}
                        className={`relative bg-white dark:bg-[#111120] rounded-2xl border ${cfg.light} dark:border-white/5 shadow-sm hover:shadow-xl ${cfg.glow} transition-all overflow-hidden`}>
                        {/* Top accent bar */}
                        <div className={`h-1 w-full bg-gradient-to-r ${cfg.gradient}`} />
                        <div className="p-5">
                          <div className="flex items-start justify-between mb-3">
                            <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${cfg.gradient} flex items-center justify-center text-white shadow-md`}>
                              {getIcon(c.title)}
                            </div>
                            <button onClick={() => deleteComplaint(c.id)} disabled={deletingId === c.id}
                              className="p-1.5 rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition disabled:opacity-40">
                              <Trash2 size={14} />
                            </button>
                          </div>

                          <h3 className="font-bold text-gray-800 dark:text-white capitalize mb-1 leading-snug">{c.title}</h3>
                          <p className="text-gray-400 text-sm line-clamp-2 mb-4 leading-relaxed">{c.description}</p>

                          <div className="flex items-center gap-2 flex-wrap mb-4">
                            <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${cfg.badge}`}>
                              {c.status.replace("_", " ")}
                            </span>
                            {c.category && (
                              <span className="text-xs px-2.5 py-1 rounded-full bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-gray-400 capitalize border border-gray-200 dark:border-white/5">
                                {c.category}
                              </span>
                            )}
                          </div>

                          <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-white/5">
                            <p className="text-xs text-gray-400">
                              {new Date(c.created_at).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" })}
                            </p>
                            {c.file && (
                              <a href={c.file} target="_blank" rel="noreferrer"
                                className="text-xs text-indigo-500 hover:text-indigo-700 flex items-center gap-1 transition font-medium">
                                📎 Attachment
                              </a>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
