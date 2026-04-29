import { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { LayoutDashboard, PlusCircle, KeyRound, Menu, X, ClipboardList, Bell, LogOut, Sun, Moon } from "lucide-react";
import API from "../services/api";

function Navbar({ darkMode, setDarkMode }) {
  const location = useLocation();
  const navigate = useNavigate();
  const username = localStorage.getItem("username") || "User";
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [showNotif, setShowNotif] = useState(false);
  const notifRef = useRef(null);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handler = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) setShowNotif(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await API.get("/notifications/");
      setNotifications(res.data);
    } catch { }
  };

  const markAllRead = async () => {
    try {
      await API.patch("/notifications/");
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    } catch { }
  };

  const unreadCount = notifications.filter((n) => !n.is_read).length;
  const handleLogout = () => { localStorage.clear(); navigate("/"); };

  const navLinks = (
    <>
      <div className="mb-6 flex items-center gap-3">
        <div className="w-10 h-10 bg-indigo-500 text-white flex items-center justify-center rounded-full font-semibold">
          {username.charAt(0).toUpperCase()}
        </div>
        <div>
          <p className="font-semibold">{username}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">Student</p>
        </div>
      </div>
      <ul className="space-y-2">
        {[
          { path: "/dashboard", label: "Dashboard", icon: <LayoutDashboard size={20} /> },
          { path: "/create", label: "Create Complaint", icon: <PlusCircle size={20} /> },
          { path: "/status", label: "Track Status", icon: <ClipboardList size={20} /> },
          { path: "/change-password", label: "Change Password", icon: <KeyRound size={20} /> },
        ].map((item) => (
          <li
            key={item.path}
            className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition ${
              location.pathname === item.path
                ? "bg-indigo-100 text-indigo-600"
                : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
            }`}
            onClick={() => { navigate(item.path); setMobileOpen(false); }}
          >
            {item.icon} {item.label}
          </li>
        ))}
      </ul>
    </>
  );

  const notificationBell = (
    <div className="relative" ref={notifRef}>
      <button
        onClick={() => { setShowNotif(!showNotif); if (!showNotif && unreadCount > 0) markAllRead(); }}
        className="relative p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition"
      >
        <Bell size={20} className="text-gray-600 dark:text-gray-300" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>
      {showNotif && (
        <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border dark:border-gray-700 z-50">
          <div className="flex items-center justify-between px-4 py-3 border-b dark:border-gray-700">
            <p className="font-semibold text-sm">Notifications</p>
            {notifications.some((n) => !n.is_read) && (
              <button onClick={markAllRead} className="text-xs text-indigo-500 hover:underline">Mark all read</button>
            )}
          </div>
          <div className="max-h-72 overflow-y-auto">
            {notifications.length === 0 ? (
              <p className="text-center text-gray-400 text-sm py-6">No notifications yet</p>
            ) : (
              notifications.map((n) => (
                <div key={n.id} className={`px-4 py-3 border-b dark:border-gray-700 last:border-0 ${!n.is_read ? "bg-indigo-50 dark:bg-indigo-900/20" : ""}`}>
                  <p className="text-sm text-gray-700 dark:text-gray-200">{n.message}</p>
                  <p className="text-xs text-gray-400 mt-1">{new Date(n.created_at).toLocaleString()}</p>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* Mobile top bar */}
      <div className="md:hidden flex items-center justify-between p-4 bg-white dark:bg-gray-800 shadow z-20 w-full fixed top-0 left-0">
        <h1 className="text-lg font-bold text-indigo-600">Complaint System</h1>
        <div className="flex items-center gap-1">
          {notificationBell}
          <button onClick={() => setDarkMode(!darkMode)} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition">
            {darkMode ? <Sun size={20} className="text-yellow-400" /> : <Moon size={20} className="text-gray-500" />}
          </button>
          <button onClick={handleLogout} className="p-2 rounded-full hover:bg-red-50 transition">
            <LogOut size={20} className="text-red-500" />
          </button>
          <button onClick={() => setMobileOpen(!mobileOpen)} className="p-2">
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-10 bg-black bg-opacity-40" onClick={() => setMobileOpen(false)}>
          <div className="w-64 h-full bg-white dark:bg-gray-800 shadow-lg p-6" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-2xl font-bold text-indigo-600 mb-8">Complaint System</h2>
            {navLinks}
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <div className="hidden md:flex w-64 bg-white dark:bg-gray-800 shadow-lg p-6 flex-col h-screen sticky top-0">
        {/* Top: title + actions */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-indigo-600">Complaint System</h2>
          <div className="flex items-center gap-1">
            {notificationBell}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition"
              title={darkMode ? "Light Mode" : "Dark Mode"}
            >
              {darkMode ? <Sun size={18} className="text-yellow-400" /> : <Moon size={18} className="text-gray-500" />}
            </button>
            <button
              onClick={handleLogout}
              className="p-2 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20 transition"
              title="Logout"
            >
              <LogOut size={18} className="text-red-500" />
            </button>
          </div>
        </div>

        {/* Nav links */}
        {navLinks}
      </div>
    </>
  );
}

export default Navbar;
