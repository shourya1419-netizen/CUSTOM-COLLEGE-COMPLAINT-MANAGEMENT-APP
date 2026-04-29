import { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { LayoutDashboard, PlusCircle, KeyRound, Menu, X, ClipboardList, Bell } from "lucide-react";
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
    const interval = setInterval(fetchNotifications, 30000); // poll every 30s
    return () => clearInterval(interval);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotif(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await API.get("/notifications/");
      setNotifications(res.data);
    } catch {
      // silent
    }
  };

  const markAllRead = async () => {
    try {
      await API.patch("/notifications/");
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    } catch {
      // silent
    }
  };

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  const navLinks = (
    <>
      <div className="mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-500 text-white flex items-center justify-center rounded-full font-semibold">
            {username.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="font-semibold">{username}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Student</p>
          </div>
        </div>
      </div>

      <ul className="space-y-4">
        {[
          { path: "/dashboard", label: "Dashboard", icon: <LayoutDashboard size={20} /> },
          { path: "/create", label: "Create Complaint", icon: <PlusCircle size={20} /> },
          { path: "/status", label: "Track Status", icon: <ClipboardList size={20} /> },
          { path: "/change-password", label: "Change Password", icon: <KeyRound size={20} /> },
        ].map((item) => (
          <li
            key={item.path}
            className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer ${
              location.pathname === item.path
                ? "bg-indigo-100 text-indigo-600"
                : "text-gray-700 dark:text-gray-300 hover:text-indigo-600"
            }`}
            onClick={() => { navigate(item.path); setMobileOpen(false); }}
          >
            {item.icon} {item.label}
          </li>
        ))}
      </ul>
    </>
  );

  const bottomButtons = (
    <div className="flex flex-col gap-3">
      <button
        onClick={() => setDarkMode(!darkMode)}
        className="w-full bg-gray-200 dark:bg-gray-700 px-3 py-2 rounded text-sm"
      >
        {darkMode ? "Light Mode ☀️" : "Dark Mode 🌙"}
      </button>
      <button
        onClick={handleLogout}
        className="flex items-center justify-center gap-2 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 w-full"
      >
        Logout
      </button>
    </div>
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
              <button onClick={markAllRead} className="text-xs text-indigo-500 hover:underline">
                Mark all read
              </button>
            )}
          </div>
          <div className="max-h-72 overflow-y-auto">
            {notifications.length === 0 ? (
              <p className="text-center text-gray-400 text-sm py-6">No notifications yet</p>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  className={`px-4 py-3 border-b dark:border-gray-700 last:border-0 ${
                    !n.is_read ? "bg-indigo-50 dark:bg-indigo-900/20" : ""
                  }`}
                >
                  <p className="text-sm text-gray-700 dark:text-gray-200">{n.message}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(n.created_at).toLocaleString()}
                  </p>
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
        <div className="flex items-center gap-2">
          {notificationBell}
          <button onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-10 bg-black bg-opacity-40" onClick={() => setMobileOpen(false)}>
          <div
            className="w-64 h-full bg-white dark:bg-gray-800 shadow-lg p-6 flex flex-col justify-between"
            onClick={(e) => e.stopPropagation()}
          >
            <div>
              <h2 className="text-2xl font-bold text-indigo-600 mb-8">Complaint System</h2>
              {navLinks}
            </div>
            {bottomButtons}
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <div className="hidden md:flex w-64 bg-white dark:bg-gray-800 shadow-lg p-6 flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-indigo-600">Complaint System</h2>
            {notificationBell}
          </div>
          {navLinks}
        </div>
        {bottomButtons}
      </div>
    </>
  );
}

export default Navbar;
