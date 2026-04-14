import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { LayoutDashboard, PlusCircle, KeyRound, Menu, X } from "lucide-react";

function Navbar({ darkMode, setDarkMode }) {
  const location = useLocation();
  const navigate = useNavigate();
  const username = localStorage.getItem("username") || "User";
  const [mobileOpen, setMobileOpen] = useState(false);

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
        <li
          className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer ${
            location.pathname === "/dashboard"
              ? "bg-indigo-100 text-indigo-600"
              : "text-gray-700 dark:text-gray-300 hover:text-indigo-600"
          }`}
          onClick={() => { navigate("/dashboard"); setMobileOpen(false); }}
        >
          <LayoutDashboard size={20} /> Dashboard
        </li>
        <li
          className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer ${
            location.pathname === "/create"
              ? "bg-indigo-100 text-indigo-600"
              : "text-gray-700 dark:text-gray-300 hover:text-indigo-600"
          }`}
          onClick={() => { navigate("/create"); setMobileOpen(false); }}
        >
          <PlusCircle size={20} /> Create Complaint
        </li>
        <li
          className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer ${
            location.pathname === "/change-password"
              ? "bg-indigo-100 text-indigo-600"
              : "text-gray-700 dark:text-gray-300 hover:text-indigo-600"
          }`}
          onClick={() => { navigate("/change-password"); setMobileOpen(false); }}
        >
          <KeyRound size={20} /> Change Password
        </li>
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

  return (
    <>
      {/* Mobile top bar */}
      <div className="md:hidden flex items-center justify-between p-4 bg-white dark:bg-gray-800 shadow z-20 w-full fixed top-0 left-0">
        <h1 className="text-lg font-bold text-indigo-600">Complaint System</h1>
        <button onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
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
          <h2 className="text-2xl font-bold text-indigo-600 mb-8">Complaint System</h2>
          {navLinks}
        </div>
        {bottomButtons}
      </div>
    </>
  );
}

export default Navbar;
