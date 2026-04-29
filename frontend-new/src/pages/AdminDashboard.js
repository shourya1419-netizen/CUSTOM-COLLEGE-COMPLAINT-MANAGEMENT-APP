import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import { motion } from "framer-motion";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
} from "recharts";
import { LayoutDashboard, LogOut, Users, Menu, X } from "lucide-react";

const STATUS_COLORS = {
  pending: "bg-yellow-100 text-yellow-700",
  in_progress: "bg-blue-100 text-blue-700",
  resolved: "bg-green-100 text-green-700",
  closed: "bg-gray-100 text-gray-600",
};

function AdminDashboard() {
  const navigate = useNavigate();
  const username = localStorage.getItem("username") || "Admin";
  const [complaints, setComplaints] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [darkMode, setDarkMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [filters, setFilters] = useState({ status: "", category: "", department: "", search: "" });

  useEffect(() => {
    fetchComplaints();
  }, []);

  useEffect(() => {
    let data = [...complaints];
    if (filters.status) data = data.filter((c) => c.status === filters.status);
    if (filters.category) data = data.filter((c) => c.category === filters.category);
    if (filters.department) data = data.filter((c) => c.department === filters.department);
    if (filters.search) data = data.filter((c) =>
      c.title.toLowerCase().includes(filters.search.toLowerCase()) ||
      c.student.toLowerCase().includes(filters.search.toLowerCase())
    );
    setFiltered(data);
  }, [complaints, filters]);

  const fetchComplaints = async () => {
    setLoading(true);
    try {
      const res = await API.get("/complaints/");
      setComplaints(res.data);
    } catch {
      setNotification("Failed to load complaints. Please refresh.");
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, newStatus) => {
    try {
      await API.put(`/complaints/${id}/status/`, { status: newStatus });
      setNotification("Status updated successfully");
      setTimeout(() => setNotification(""), 3000);
      fetchComplaints();
    } catch {
      setNotification("Failed to update status. Try again.");
      setTimeout(() => setNotification(""), 3000);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  const chartData = [
    { name: "Pending", value: complaints.filter((c) => c.status === "pending").length },
    { name: "In Progress", value: complaints.filter((c) => c.status === "in_progress").length },
    { name: "Resolved", value: complaints.filter((c) => c.status === "resolved").length },
    { name: "Closed", value: complaints.filter((c) => c.status === "closed").length },
  ];

  const sidebar = (
    <div className="flex flex-col justify-between h-full">
      <div>
        <h2 className="text-2xl font-bold text-red-600 mb-2">Admin Panel</h2>
        <p className="text-xs text-gray-400 mb-8">College Complaint System</p>
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-red-500 text-white flex items-center justify-center rounded-full font-bold">
            {username.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="font-semibold">{username}</p>
            <p className="text-xs text-red-500 font-medium">Administrator</p>
          </div>
        </div>
        <ul className="space-y-4">
          <li className="flex items-center gap-3 p-2 rounded-lg bg-red-50 text-red-600 cursor-pointer">
            <LayoutDashboard size={20} /> Dashboard
          </li>
          <li className="flex items-center gap-3 p-2 rounded-lg text-gray-600 dark:text-gray-300 cursor-pointer hover:text-red-600"
            onClick={() => document.getElementById('complaints-table').scrollIntoView({ behavior: 'smooth' })}
          >
            <Users size={20} /> All Complaints ({complaints.length})
          </li>
        </ul>
      </div>
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
          <LogOut size={16} /> Logout
        </button>
      </div>
    </div>
  );

  return (
    <div className={darkMode ? "dark" : ""}>
      <div className="flex min-h-screen bg-gray-100 dark:bg-gray-900 text-black dark:text-white">

        {/* Mobile top bar */}
        <div className="md:hidden flex items-center justify-between p-4 bg-white dark:bg-gray-800 shadow z-20 w-full fixed top-0 left-0">
          <h1 className="text-lg font-bold text-red-600">Admin Panel</h1>
          <button onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile drawer */}
        {mobileOpen && (
          <div className="md:hidden fixed inset-0 z-10 bg-black bg-opacity-40" onClick={() => setMobileOpen(false)}>
            <div
              className="w-64 h-full bg-white dark:bg-gray-800 shadow-lg p-6"
              onClick={(e) => e.stopPropagation()}
            >
              {sidebar}
            </div>
          </div>
        )}

        {/* Desktop sidebar */}
        <div className="hidden md:flex w-64 bg-white dark:bg-gray-800 shadow-lg p-6">
          {sidebar}
        </div>

        {/* Main */}
        <div className="flex-1 p-6 pt-20 md:pt-8">
          <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>

          {notification && (
            <div className="bg-green-100 text-green-700 px-4 py-2 rounded mb-4">{notification}</div>
          )}

          {/* Stats */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow mb-6">
            <h2 className="text-lg font-semibold mb-4">Complaint Overview</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              {chartData.map((d) => (
                <div key={d.name} className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4 text-center">
                  <p className="text-2xl font-bold text-indigo-600">{d.value}</p>
                  <p className="text-sm text-gray-500">{d.name}</p>
                </div>
              ))}
            </div>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={chartData}>
                <XAxis dataKey="name" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="value" fill="#ef4444" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Filters */}
          <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow mb-6 flex flex-wrap gap-3">
            <input
              type="text"
              placeholder="Search by title or student..."
              className="flex-1 min-w-[200px] p-2 border rounded-lg text-sm dark:bg-gray-700 dark:text-white dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-red-400"
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            />
            <select
              className="p-2 border rounded-lg text-sm dark:bg-gray-700 dark:text-white dark:border-gray-600"
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            >
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option>
              <option value="closed">Closed</option>
            </select>
            <select
              className="p-2 border rounded-lg text-sm dark:bg-gray-700 dark:text-white dark:border-gray-600"
              onChange={(e) => setFilters({ ...filters, category: e.target.value })}
            >
              <option value="">All Categories</option>
              <option value="hostel">Hostel</option>
              <option value="network">Network</option>
              <option value="electricity">Electricity</option>
            </select>
            <select
              className="p-2 border rounded-lg text-sm dark:bg-gray-700 dark:text-white dark:border-gray-600"
              onChange={(e) => setFilters({ ...filters, department: e.target.value })}
            >
              <option value="">All Departments</option>
              <option value="maintenance">Maintenance</option>
              <option value="it">IT</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          {/* Table */}
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="w-10 h-10 border-4 border-red-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <div id="complaints-table" className="bg-white dark:bg-gray-800 rounded-2xl shadow overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                  <tr>
                    <th className="px-4 py-3 text-left">#</th>
                    <th className="px-4 py-3 text-left">Student</th>
                    <th className="px-4 py-3 text-left">Title</th>
                    <th className="px-4 py-3 text-left">Category</th>
                    <th className="px-4 py-3 text-left">Department</th>
                    <th className="px-4 py-3 text-left">File</th>
                    <th className="px-4 py-3 text-left">Status</th>
                    <th className="px-4 py-3 text-left">Date</th>
                    <th className="px-4 py-3 text-left">Update</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 && (
                    <tr>
                      <td colSpan="9" className="text-center py-8 text-gray-400">No complaints found</td>
                    </tr>
                  )}
                  {filtered.map((c, i) => (
                    <motion.tr
                      key={c.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="border-t dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      <td className="px-4 py-3 text-gray-400">{i + 1}</td>
                      <td className="px-4 py-3 font-medium">{c.student}</td>
                      <td className="px-4 py-3">
                        <p className="font-medium">{c.title}</p>
                        <p className="text-xs text-gray-400 truncate max-w-[160px]">{c.description}</p>
                      </td>
                      <td className="px-4 py-3 capitalize">{c.category || "—"}</td>
                      <td className="px-4 py-3 capitalize">{c.department || "—"}</td>
                      <td className="px-4 py-3">
                        {c.file ? (
                          <a
                            href={c.file}
                            target="_blank"
                            rel="noreferrer"
                            className="text-indigo-500 underline text-xs"
                          >
                            📎 View
                          </a>
                        ) : (
                          <span className="text-gray-400 text-xs">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[c.status]}`}>
                          {c.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-400 text-xs">
                        {new Date(c.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3">
                        <select
                          value={c.status}
                          onChange={(e) => updateStatus(c.id, e.target.value)}
                          className="p-1 border rounded text-xs dark:bg-gray-600 dark:text-white dark:border-gray-500 focus:outline-none focus:ring-1 focus:ring-red-400"
                        >
                          <option value="pending">Pending</option>
                          <option value="in_progress">In Progress</option>
                          <option value="resolved">Resolved</option>
                          <option value="closed">Closed</option>
                        </select>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
