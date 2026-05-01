import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import { motion, AnimatePresence } from "framer-motion";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid } from "recharts";
import { LayoutDashboard, LogOut, Users, Menu, X, Sun, Moon, Search, Filter, GraduationCap, ChevronDown } from "lucide-react";

const STATUS_CFG = {
  pending:     { badge: "bg-amber-100 text-amber-700 border border-amber-200",   dot: "bg-amber-400" },
  in_progress: { badge: "bg-blue-100 text-blue-700 border border-blue-200",      dot: "bg-blue-400" },
  resolved:    { badge: "bg-emerald-100 text-emerald-700 border border-emerald-200", dot: "bg-emerald-400" },
  closed:      { badge: "bg-gray-100 text-gray-500 border border-gray-200",      dot: "bg-gray-400" },
};

const STAT_CARDS = [
  { label: "Pending",     key: "pending",     icon: "🕐", gradient: "from-amber-400 via-orange-400 to-red-400",     glow: "shadow-amber-300/40" },
  { label: "In Progress", key: "in_progress", icon: "⚡", gradient: "from-blue-400 via-cyan-400 to-teal-400",       glow: "shadow-blue-300/40" },
  { label: "Resolved",    key: "resolved",    icon: "✅", gradient: "from-emerald-400 via-green-400 to-lime-400",   glow: "shadow-emerald-300/40" },
  { label: "Closed",      key: "closed",      icon: "🔒", gradient: "from-gray-400 via-slate-400 to-gray-500",      glow: "shadow-gray-300/40" },
];

const BAR_COLORS = ["#f59e0b", "#3b82f6", "#10b981", "#6b7280"];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 px-4 py-3">
      <p className="text-xs text-gray-500 mb-1">{label}</p>
      <p className="text-lg font-bold text-red-500">{payload[0].value}</p>
    </div>
  );
  return null;
};

export default function AdminDashboard() {
  const navigate = useNavigate();
  const username = localStorage.getItem("username") || "Admin";
  const [complaints, setComplaints] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [darkMode, setDarkMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ msg: "", type: "" });
  const [mobileOpen, setMobileOpen] = useState(false);
  const [filters, setFilters] = useState({ status: "", category: "", department: "", search: "" });

  useEffect(() => { fetchComplaints(); }, []);

  useEffect(() => {
    let data = [...complaints];
    if (filters.status) data = data.filter(c => c.status === filters.status);
    if (filters.category) data = data.filter(c => c.category === filters.category);
    if (filters.department) data = data.filter(c => c.department === filters.department);
    if (filters.search) data = data.filter(c =>
      c.title.toLowerCase().includes(filters.search.toLowerCase()) ||
      c.student.toLowerCase().includes(filters.search.toLowerCase())
    );
    setFiltered(data);
  }, [complaints, filters]);

  const fetchComplaints = async () => {
    setLoading(true);
    try { const r = await API.get("/complaints/"); setComplaints(r.data); }
    catch { showToast("Failed to load complaints.", "error"); }
    finally { setLoading(false); }
  };

  const showToast = (msg, type) => {
    setToast({ msg, type });
    setTimeout(() => setToast({ msg: "", type: "" }), 3000);
  };

  const updateStatus = async (id, newStatus) => {
    try {
      await API.put(`/complaints/${id}/status/`, { status: newStatus });
      showToast("Status updated successfully ✓", "success");
      fetchComplaints();
    } catch (err) { showToast(err.response?.data?.error || "Failed to update.", "error"); }
  };

  const logout = () => { localStorage.clear(); navigate("/"); };

  const chartData = STAT_CARDS.map(s => ({
    name: s.label,
    value: complaints.filter(c => c.status === s.key).length,
  }));

  const Sidebar = () => (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center shadow-lg shadow-red-500/30">
          <GraduationCap size={18} className="text-white" />
        </div>
        <div>
          <p className="font-bold text-gray-800 dark:text-white text-sm">CCMS Admin</p>
          <p className="text-xs text-gray-400">Management Panel</p>
        </div>
      </div>

      {/* Admin card */}
      <div className="relative mb-6 p-4 rounded-2xl overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-red-500/10 to-rose-500/10 rounded-2xl border border-red-200/30 dark:border-red-500/20" />
        <div className="relative flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-red-500/30">
            {username.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="font-semibold text-sm text-gray-800 dark:text-white">{username}</p>
            <p className="text-xs font-medium gradient-text-red">Administrator</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 space-y-1">
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-gradient-to-r from-red-500 to-rose-600 text-white shadow-lg shadow-red-500/25 cursor-pointer">
          <LayoutDashboard size={17} /> <span className="text-sm font-medium">Dashboard</span>
          <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white/60" />
        </div>
        <div onClick={() => document.getElementById("complaints-table").scrollIntoView({ behavior: "smooth" })}
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 hover:text-gray-800 dark:hover:text-white cursor-pointer transition">
          <Users size={17} /> <span className="text-sm">All Complaints</span>
          <span className="ml-auto text-xs bg-gray-100 dark:bg-white/10 px-2 py-0.5 rounded-full">{complaints.length}</span>
        </div>
      </nav>

      <div className="pt-4 border-t border-gray-100 dark:border-white/5 flex items-center justify-between">
        <span className="text-xs text-gray-400">v1.0.0</span>
        <div className="flex items-center gap-1">
          <button onClick={() => setDarkMode(!darkMode)} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-white/5 transition">
            {darkMode ? <Sun size={15} className="text-yellow-400" /> : <Moon size={15} className="text-gray-400" />}
          </button>
          <button onClick={logout} className="p-2 rounded-xl hover:bg-red-50 dark:hover:bg-red-500/10 transition" title="Logout">
            <LogOut size={15} className="text-red-400" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className={darkMode ? "dark" : ""}>
      <div className="flex min-h-screen bg-[#f8f9ff] dark:bg-[#0a0a14] text-gray-900 dark:text-white">

        {/* Mobile top bar */}
        <div className="md:hidden flex items-center justify-between px-4 py-3 bg-white/95 dark:bg-gray-900/95 backdrop-blur border-b border-gray-100 dark:border-white/5 z-20 w-full fixed top-0 left-0">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center">
              <GraduationCap size={14} className="text-white" />
            </div>
            <span className="font-bold text-gray-800 dark:text-white text-sm">CCMS Admin</span>
          </div>
          <div className="flex items-center gap-1">
            <button onClick={() => setDarkMode(!darkMode)} className="p-2 rounded-xl hover:bg-gray-100 transition">
              {darkMode ? <Sun size={17} className="text-yellow-400" /> : <Moon size={17} className="text-gray-500" />}
            </button>
            <button onClick={logout} className="p-2 rounded-xl hover:bg-red-50 transition">
              <LogOut size={17} className="text-red-400" />
            </button>
            <button onClick={() => setMobileOpen(!mobileOpen)} className="p-2">
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        <AnimatePresence>
          {mobileOpen && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="md:hidden fixed inset-0 z-10 bg-black/50 backdrop-blur-sm" onClick={() => setMobileOpen(false)}>
              <motion.div initial={{ x: -280 }} animate={{ x: 0 }} exit={{ x: -280 }} transition={{ type: "spring", damping: 25 }}
                className="w-72 h-full bg-white dark:bg-gray-900 shadow-2xl p-6" onClick={e => e.stopPropagation()}>
                <Sidebar />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Desktop sidebar */}
        <div className="hidden md:flex w-64 sidebar-glass flex-col h-screen sticky top-0 p-5 z-10">
          <Sidebar />
        </div>

        {/* Main */}
        <div className="flex-1 overflow-auto">
          {/* Header */}
          <div className="sticky top-0 z-10 bg-white/80 dark:bg-[#0a0a14]/80 backdrop-blur border-b border-gray-100 dark:border-white/5 px-6 py-4 mt-14 md:mt-0">
            <h1 className="text-xl font-bold text-gray-800 dark:text-white">Admin Dashboard</h1>
            <p className="text-xs text-gray-400 mt-0.5">Manage and resolve student complaints</p>
          </div>

          <div className="p-6">
            {/* Toast */}
            <AnimatePresence>
              {toast.msg && (
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                  className={`px-4 py-3 rounded-xl mb-6 text-sm font-medium flex items-center gap-2 border ${
                    toast.type === "error"
                      ? "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-500/30 text-red-600 dark:text-red-400"
                      : "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-500/30 text-emerald-600 dark:text-emerald-400"
                  }`}>
                  {toast.type === "error" ? "⚠️" : "✅"} {toast.msg}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Stat cards */}
            <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
              {STAT_CARDS.map((s, i) => {
                const value = complaints.filter(c => c.status === s.key).length;
                const isActive = filters.status === s.key;
                return (
                  <motion.button key={s.key} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
                    whileHover={{ y: -4 }} whileTap={{ scale: 0.97 }}
                    onClick={() => {
                      setFilters({ ...filters, status: isActive ? "" : s.key });
                      document.getElementById("complaints-table").scrollIntoView({ behavior: "smooth" });
                    }}
                    className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${s.gradient} p-5 shadow-xl ${s.glow} text-white text-left transition-all ${isActive ? "ring-4 ring-white/40 scale-105" : ""}`}>
                    <div className="absolute -top-4 -right-4 w-20 h-20 bg-white/10 rounded-full" />
                    <div className="absolute -bottom-6 -right-2 w-28 h-28 bg-white/5 rounded-full" />
                    <div className="relative">
                      <span className="text-2xl">{s.icon}</span>
                      <p className="text-4xl font-extrabold mt-2">{value}</p>
                      <p className="text-white/70 text-sm mt-1 font-medium">{s.label}</p>
                      {isActive && <p className="text-white/50 text-xs mt-1">Filtering ✓</p>}
                    </div>
                  </motion.button>
                );
              })}
            </div>

            {/* Chart */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
              className="bg-white dark:bg-[#111120] rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm p-6 mb-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="font-bold text-gray-800 dark:text-white">Complaint Overview</h2>
                  <p className="text-xs text-gray-400 mt-0.5">Click stat cards to filter table</p>
                </div>
                {filters.status && (
                  <button onClick={() => setFilters({ ...filters, status: "" })}
                    className="flex items-center gap-1 text-xs text-red-500 hover:text-red-700 bg-red-50 dark:bg-red-900/20 px-3 py-1.5 rounded-full transition">
                    <X size={11} /> Clear filter
                  </button>
                )}
              </div>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={chartData} barSize={40}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.04)" />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                    {chartData.map((_, i) => <Cell key={i} fill={BAR_COLORS[i]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </motion.div>

            {/* Filters */}
            <div className="bg-white dark:bg-[#111120] rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm p-4 mb-6">
              <div className="flex items-center gap-2 mb-3">
                <Filter size={14} className="text-gray-400" />
                <span className="text-sm font-semibold text-gray-600 dark:text-gray-300">Filter & Search</span>
              </div>
              <div className="flex flex-wrap gap-3">
                <div className="relative flex-1 min-w-[200px]">
                  <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input type="text" placeholder="Search by title or student..."
                    className="w-full pl-9 pr-4 py-2.5 border border-gray-200 dark:border-white/10 rounded-xl text-sm bg-gray-50 dark:bg-white/5 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-300 dark:focus:ring-red-500/30 transition"
                    onChange={e => setFilters({ ...filters, search: e.target.value })} />
                </div>
                {[
                  { key: "status", opts: [["", "All Status"], ["pending", "Pending"], ["in_progress", "In Progress"], ["resolved", "Resolved"], ["closed", "Closed"]] },
                  { key: "category", opts: [["", "All Categories"], ["hostel", "Hostel"], ["network", "Network"], ["electricity", "Electricity"]] },
                  { key: "department", opts: [["", "All Depts"], ["maintenance", "Maintenance"], ["it", "IT"], ["admin", "Admin"]] },
                ].map(f => (
                  <div key={f.key} className="relative">
                    <select value={filters[f.key]}
                      className="appearance-none py-2.5 pl-3 pr-8 border border-gray-200 dark:border-white/10 rounded-xl text-sm bg-gray-50 dark:bg-white/5 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-300 dark:focus:ring-red-500/30 transition cursor-pointer"
                      onChange={e => setFilters({ ...filters, [f.key]: e.target.value })}>
                      {f.opts.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                    </select>
                    <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  </div>
                ))}
              </div>
            </div>

            {/* Table */}
            {loading ? (
              <div className="flex justify-center items-center py-24">
                <div className="relative">
                  <div className="w-12 h-12 border-4 border-red-100 dark:border-red-900 rounded-full" />
                  <div className="w-12 h-12 border-4 border-red-500 border-t-transparent rounded-full animate-spin absolute top-0 left-0" />
                </div>
              </div>
            ) : (
              <motion.div id="complaints-table" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="bg-white dark:bg-[#111120] rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 dark:border-white/5 flex items-center justify-between bg-gradient-to-r from-gray-50 to-white dark:from-white/2 dark:to-transparent">
                  <h2 className="font-bold text-gray-700 dark:text-white">All Complaints</h2>
                  <span className="text-xs text-gray-400 bg-gray-100 dark:bg-white/5 px-3 py-1 rounded-full">
                    {filtered.length} result{filtered.length !== 1 ? "s" : ""}
                  </span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gray-50/80 dark:bg-white/2">
                        {["#", "Student", "Complaint", "Category", "Dept", "File", "Status", "Date", "Action"].map(h => (
                          <th key={h} className="px-4 py-3.5 text-left text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50 dark:divide-white/3">
                      {filtered.length === 0 && (
                        <tr><td colSpan="9" className="text-center py-16 text-gray-400">
                          <div className="text-5xl mb-3">🔍</div>
                          <p className="font-medium">No complaints found</p>
                          <p className="text-xs mt-1">Try adjusting your filters</p>
                        </td></tr>
                      )}
                      {filtered.map((c, i) => {
                        const cfg = STATUS_CFG[c.status] || STATUS_CFG.pending;
                        return (
                          <motion.tr key={c.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }}
                            className="hover:bg-gray-50/80 dark:hover:bg-white/2 transition group">
                            <td className="px-4 py-4 text-gray-300 dark:text-gray-600 text-xs font-mono">{String(i + 1).padStart(2, "0")}</td>
                            <td className="px-4 py-4">
                              <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-400 to-purple-500 text-white text-xs flex items-center justify-center font-bold shadow-md shadow-indigo-200/50 flex-shrink-0">
                                  {c.student.charAt(0).toUpperCase()}
                                </div>
                                <span className="font-semibold text-gray-700 dark:text-gray-200 text-sm">{c.student}</span>
                              </div>
                            </td>
                            <td className="px-4 py-4 max-w-[200px]">
                              <p className="font-semibold text-gray-800 dark:text-white truncate capitalize">{c.title}</p>
                              <p className="text-xs text-gray-400 truncate mt-0.5">{c.description}</p>
                            </td>
                            <td className="px-4 py-4">
                              {c.category ? (
                                <span className="text-xs px-2.5 py-1 rounded-full bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 border border-purple-100 dark:border-purple-500/20 capitalize font-medium">
                                  {c.category}
                                </span>
                              ) : <span className="text-gray-300 text-xs">—</span>}
                            </td>
                            <td className="px-4 py-4">
                              {c.department ? (
                                <span className="text-xs text-gray-500 dark:text-gray-400 capitalize">{c.department}</span>
                              ) : <span className="text-gray-300 text-xs">—</span>}
                            </td>
                            <td className="px-4 py-4">
                              {c.file ? (
                                <a href={c.file} target="_blank" rel="noreferrer"
                                  className="text-xs text-indigo-500 hover:text-indigo-700 flex items-center gap-1 font-medium transition">
                                  📎 View
                                </a>
                              ) : <span className="text-gray-300 text-xs">—</span>}
                            </td>
                            <td className="px-4 py-4">
                              <div className="flex items-center gap-2">
                                <div className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                                <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${cfg.badge}`}>
                                  {c.status.replace("_", " ")}
                                </span>
                              </div>
                            </td>
                            <td className="px-4 py-4 text-gray-400 text-xs whitespace-nowrap">
                              {new Date(c.created_at).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "2-digit" })}
                            </td>
                            <td className="px-4 py-4">
                              <div className="relative">
                                <select value={c.status} onChange={e => updateStatus(c.id, e.target.value)}
                                  className="appearance-none py-2 pl-3 pr-7 border border-gray-200 dark:border-white/10 rounded-xl text-xs bg-white dark:bg-white/5 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-300 dark:focus:ring-red-500/30 cursor-pointer font-medium transition hover:border-red-300">
                                  <option value="pending">Pending</option>
                                  <option value="in_progress">In Progress</option>
                                  <option value="resolved">Resolved</option>
                                  <option value="closed">Closed</option>
                                </select>
                                <ChevronDown size={11} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                              </div>
                            </td>
                          </motion.tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
