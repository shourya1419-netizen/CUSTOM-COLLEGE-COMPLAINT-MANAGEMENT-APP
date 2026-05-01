import { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { LayoutDashboard, PlusCircle, KeyRound, Menu, X, ClipboardList, Bell, LogOut, Sun, Moon, GraduationCap } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import API from "../services/api";

const NAV_ITEMS = [
  { path: "/dashboard",       label: "Dashboard",       icon: LayoutDashboard },
  { path: "/create",          label: "New Complaint",   icon: PlusCircle },
  { path: "/status",          label: "Track Status",    icon: ClipboardList },
  { path: "/change-password", label: "Change Password", icon: KeyRound },
];

export default function Navbar({ darkMode, setDarkMode }) {
  const location = useLocation();
  const navigate = useNavigate();
  const username = localStorage.getItem("username") || "User";
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [showNotif, setShowNotif] = useState(false);
  const notifRef = useRef(null);

  useEffect(() => {
    fetchNotifications();
    const iv = setInterval(fetchNotifications, 30000);
    return () => clearInterval(iv);
  }, []);

  useEffect(() => {
    const h = (e) => { if (notifRef.current && !notifRef.current.contains(e.target)) setShowNotif(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const fetchNotifications = async () => {
    try { const r = await API.get("/notifications/"); setNotifications(r.data); } catch {}
  };
  const markAllRead = async () => {
    try { await API.patch("/notifications/"); setNotifications(p => p.map(n => ({ ...n, is_read: true }))); } catch {}
  };

  const unread = notifications.filter(n => !n.is_read).length;
  const logout = () => { localStorage.clear(); navigate("/"); };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
          <GraduationCap size={18} className="text-white" />
        </div>
        <span className="font-bold text-gray-800 dark:text-white">CCMS</span>
      </div>

      {/* User card */}
      <div className="relative mb-6 p-4 rounded-2xl overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 rounded-2xl border border-indigo-200/30 dark:border-indigo-500/20" />
        <div className="relative flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-indigo-500/30">
            {username.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="font-semibold text-sm text-gray-800 dark:text-white">{username}</p>
            <p className="text-xs font-medium bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">Student</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-1">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const active = location.pathname === item.path;
          return (
            <motion.button key={item.path} whileHover={{ x: 4 }} whileTap={{ scale: 0.97 }}
              onClick={() => { navigate(item.path); setMobileOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                active
                  ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/25"
                  : "text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 hover:text-gray-800 dark:hover:text-white"
              }`}>
              <Icon size={17} />
              {item.label}
              {active && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white/60" />}
            </motion.button>
          );
        })}
      </nav>

      {/* Bottom actions */}
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

  const NotifBell = () => (
    <div className="relative z-[9999]" ref={notifRef}>
      <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
        onClick={() => { setShowNotif(!showNotif); if (!showNotif && unread > 0) markAllRead(); }}
        className="relative p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-white/5 transition">
        <Bell size={17} className="text-gray-500 dark:text-gray-400" />
        <AnimatePresence>
          {unread > 0 && (
            <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
              className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-gradient-to-br from-red-500 to-rose-600 text-white text-[9px] rounded-full flex items-center justify-center font-bold shadow">
              {unread > 9 ? "9+" : unread}
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>

      <AnimatePresence>
        {showNotif && (
          <motion.div initial={{ opacity: 0, y: 8, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 8, scale: 0.95 }}
            className="absolute left-0 mt-2 w-80 bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-100 dark:border-white/10 z-[9999] overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-white/5 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20">
              <div className="flex items-center gap-2">
                <Bell size={14} className="text-indigo-500" />
                <p className="font-semibold text-sm text-gray-700 dark:text-white">Notifications</p>
                {unread > 0 && <span className="text-xs bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 px-1.5 py-0.5 rounded-full">{unread} new</span>}
              </div>
              {notifications.some(n => !n.is_read) && (
                <button onClick={markAllRead} className="text-xs text-indigo-500 hover:text-indigo-700 transition">Mark all read</button>
              )}
            </div>
            <div className="max-h-72 overflow-y-auto scrollbar-hide">
              {notifications.length === 0 ? (
                <div className="text-center py-10 text-gray-400">
                  <div className="text-4xl mb-3">🔔</div>
                  <p className="text-sm font-medium">All caught up!</p>
                  <p className="text-xs mt-1">No notifications yet</p>
                </div>
              ) : notifications.map((n, i) => (
                <motion.div key={n.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}
                  className={`px-4 py-3.5 border-b border-gray-50 dark:border-white/5 last:border-0 ${!n.is_read ? "bg-indigo-50/50 dark:bg-indigo-900/10" : ""}`}>
                  <div className="flex items-start gap-3">
                    <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${!n.is_read ? "bg-indigo-500" : "bg-gray-300 dark:bg-gray-600"}`} />
                    <div>
                      <p className="text-sm text-gray-700 dark:text-gray-200 leading-snug">{n.message}</p>
                      <p className="text-xs text-gray-400 mt-1">{new Date(n.created_at).toLocaleString()}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  return (
    <>
      {/* Mobile top bar */}
      <div className="md:hidden flex items-center justify-between px-4 py-3 bg-white/95 dark:bg-gray-900/95 backdrop-blur border-b border-gray-100 dark:border-white/5 z-20 w-full fixed top-0 left-0">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
            <GraduationCap size={14} className="text-white" />
          </div>
          <span className="font-bold text-gray-800 dark:text-white text-sm">CCMS</span>
        </div>
        <div className="flex items-center gap-1">
          <NotifBell />
          <button onClick={() => setDarkMode(!darkMode)} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-white/5 transition">
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

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="md:hidden fixed inset-0 z-10 bg-black/50 backdrop-blur-sm" onClick={() => setMobileOpen(false)}>
            <motion.div initial={{ x: -280 }} animate={{ x: 0 }} exit={{ x: -280 }} transition={{ type: "spring", damping: 25 }}
              className="w-72 h-full bg-white dark:bg-gray-900 shadow-2xl p-6" onClick={e => e.stopPropagation()}>
              <SidebarContent />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Desktop sidebar */}
      <div className="hidden md:flex w-64 sidebar-glass flex-col h-screen sticky top-0 p-5 overflow-visible z-10">
        <div className="flex items-center justify-between mb-1">
          <div className="flex-1"><SidebarContent /></div>
        </div>
        {/* Notification bell overlay at top */}
        <div className="absolute top-5 right-5">
          <NotifBell />
        </div>
      </div>
    </>
  );
}
