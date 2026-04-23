import { useState, useEffect } from "react";
import API from "../services/api";
import Navbar from "../components/Navbar";
import { motion } from "framer-motion";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
} from "recharts";
import { LayoutDashboard, Wifi, Droplet, Fan, Trash2 } from "lucide-react";

function Dashboard() {
  const [complaints, setComplaints] = useState([]);
  const [darkMode, setDarkMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    fetchComplaints();
  }, []);

  const fetchComplaints = async () => {
    setLoading(true);
    try {
      const res = await API.get("/complaints/");
      setComplaints(res.data);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  const deleteComplaint = async (id) => {
    if (!window.confirm("Are you sure you want to delete this complaint?")) return;
    setDeletingId(id);
    try {
      await API.delete(`/complaints/${id}/delete/`);
      setComplaints((prev) => prev.filter((c) => c.id !== id));
    } catch (err) {
      console.log(err);
    } finally {
      setDeletingId(null);
    }
  };

  const getStatusColor = (status) => {
    if (status === "pending") return "bg-yellow-100 text-yellow-700";
    if (status === "resolved") return "bg-green-100 text-green-700";
    return "bg-blue-100 text-blue-700";
  };

  const getIcon = (title) => {
    if (title.toLowerCase().includes("water")) return <Droplet size={20} />;
    if (title.toLowerCase().includes("wifi")) return <Wifi size={20} />;
    if (title.toLowerCase().includes("fan")) return <Fan size={20} />;
    return <LayoutDashboard size={20} />;
  };

  const chartData = [
    { name: "Pending", value: complaints.filter((c) => c.status === "pending").length },
    { name: "In Progress", value: complaints.filter((c) => c.status === "in_progress").length },
    { name: "Resolved", value: complaints.filter((c) => c.status === "resolved").length },
    { name: "Closed", value: complaints.filter((c) => c.status === "closed").length },
  ];

  return (
    <div className={darkMode ? "dark" : ""}>
      <div className="flex min-h-screen bg-gray-100 dark:bg-gray-900 text-black dark:text-white">

        <Navbar darkMode={darkMode} setDarkMode={setDarkMode} />

        <div className="flex-1 p-6 pt-20 md:pt-8">
          <h1 className="text-3xl font-bold mb-6">Dashboard</h1>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow mb-6">
            <h2 className="text-lg font-semibold mb-4">Complaint Stats</h2>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={chartData}>
                <XAxis dataKey="name" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="value" fill="#6366f1" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {complaints.length === 0 && (
                <p className="text-gray-500 col-span-3">No complaints yet. Create one!</p>
              )}
              {complaints.map((c) => (
                <motion.div
                  key={c.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.3 }}
                  className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-5 transition"
                >
                  <div className="flex items-center gap-2 mb-2 text-indigo-600">
                    {getIcon(c.title)}
                    <h3 className="text-lg font-semibold flex-1">{c.title}</h3>
                    <button
                      onClick={() => deleteComplaint(c.id)}
                      disabled={deletingId === c.id}
                      className="text-red-400 hover:text-red-600 transition disabled:opacity-40"
                      title="Delete complaint"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  <p className="text-gray-600 dark:text-gray-300 mb-3 text-sm">{c.description}</p>

                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${getStatusColor(c.status)}`}>
                    {c.status}
                  </span>

                  {c.file && (
                    <p className="text-sm text-gray-500 mt-3">
                      📎 <a href={c.file} target="_blank" rel="noreferrer" className="underline text-indigo-500">
                        View Attachment
                      </a>
                    </p>
                  )}

                  <p className="text-xs text-gray-400 mt-3">
                    {new Date(c.created_at).toLocaleDateString()}
                  </p>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
