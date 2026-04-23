import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";

const STATUS_PROGRESS = { pending: 20, in_progress: 60, resolved: 100, closed: 100 };
const STATUS_COLOR = {
  pending: "bg-orange-400",
  in_progress: "bg-blue-400",
  resolved: "bg-green-400",
  closed: "bg-gray-400",
};
const STATUS_BG = {
  pending: "bg-orange-50",
  in_progress: "bg-blue-50",
  resolved: "bg-green-50",
  closed: "bg-gray-50",
};

function BottomTab({ active, navigate }) {
  const tabs = [
    { label: "Home", icon: "🏠", path: "/dashboard" },
    { label: "Submit", icon: "📄", path: "/create" },
    { label: "Status", icon: "☰", path: "/status" },
    { label: "Settings", icon: "⚙️", path: "/change-password" },
  ];
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 flex justify-around py-2 z-10">
      {tabs.map((t) => (
        <button
          key={t.label}
          onClick={() => navigate(t.path)}
          className={`flex flex-col items-center px-4 py-1 text-xs transition ${
            active === t.path ? "text-blue-500 font-semibold" : "text-gray-400"
          }`}
        >
          <span className="text-xl mb-0.5">{t.icon}</span>
          {t.label}
          {active === t.path && <div className="w-1 h-1 rounded-full bg-blue-500 mt-0.5" />}
        </button>
      ))}
    </div>
  );
}

function Dashboard() {
  const navigate = useNavigate();
  const username = localStorage.getItem("username") || "Student";
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => { fetchComplaints(); }, []);

  const fetchComplaints = async () => {
    setLoading(true);
    try {
      const res = await API.get("/complaints/");
      setComplaints(res.data);
    } catch (err) { console.log(err); }
    finally { setLoading(false); }
  };

  const deleteComplaint = async (id) => {
    if (!window.confirm("Delete this complaint?")) return;
    setDeletingId(id);
    try {
      await API.delete(`/complaints/${id}/delete/`);
      setComplaints((prev) => prev.filter((c) => c.id !== id));
    } catch (err) { console.log(err); }
    finally { setDeletingId(null); }
  };

  const total = complaints.length;
  const pending = complaints.filter((c) => c.status === "pending").length;
  const resolved = complaints.filter((c) => c.status === "resolved").length;
  const recent = complaints.slice(0, 3);

  return (
    <div className="min-h-screen bg-gray-50 pb-20">

      {/* Gradient Header */}
      <div className="bg-gradient-to-br from-blue-500 via-blue-600 to-teal-400 px-6 pt-10 pb-16 rounded-b-3xl">
        <p className="text-blue-100 text-sm flex items-center gap-1">✨ Welcome Back</p>
        <h1 className="text-white text-3xl font-bold mt-1">{username}</h1>
        <p className="text-blue-100 text-sm mt-1">Student • Complaint Portal</p>
      </div>

      {/* Stats Cards */}
      <div className="px-4 -mt-8 grid grid-cols-3 gap-3 mb-6">
        <div className="bg-white rounded-2xl p-4 shadow-md">
          <div className="w-9 h-9 bg-blue-100 rounded-xl flex items-center justify-center mb-2">
            <span className="text-blue-500 text-lg">📋</span>
          </div>
          <p className="text-2xl font-bold text-gray-800">{total}</p>
          <p className="text-xs text-gray-400">Total</p>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-md">
          <div className="w-9 h-9 bg-orange-100 rounded-xl flex items-center justify-center mb-2">
            <span className="text-orange-500 text-lg">🕐</span>
          </div>
          <p className="text-2xl font-bold text-gray-800">{pending}</p>
          <p className="text-xs text-gray-400">Pending</p>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-md">
          <div className="w-9 h-9 bg-green-100 rounded-xl flex items-center justify-center mb-2">
            <span className="text-green-500 text-lg">✅</span>
          </div>
          <p className="text-2xl font-bold text-gray-800">{resolved}</p>
          <p className="text-xs text-gray-400">Resolved</p>
        </div>
      </div>

      <div className="px-4">
        {/* Quick Actions */}
        <div className="flex justify-between items-center mb-3">
          <h2 className="font-bold text-gray-800">Quick Actions</h2>
          <span className="text-xs text-gray-400">Get started</span>
        </div>

        <div className="space-y-3 mb-6">
          <button
            onClick={() => navigate("/create")}
            className="w-full bg-white rounded-2xl p-4 flex items-center gap-4 shadow-sm hover:shadow-md transition"
          >
            <div className="w-11 h-11 bg-blue-500 rounded-xl flex items-center justify-center">
              <span className="text-white text-xl">📄</span>
            </div>
            <div className="flex-1 text-left">
              <p className="font-semibold text-gray-800 text-sm">Submit Complaint</p>
              <p className="text-xs text-gray-400">Report a new issue or concern</p>
            </div>
            <span className="text-gray-300 text-lg">›</span>
          </button>

          <button
            onClick={() => navigate("/status")}
            className="w-full bg-white rounded-2xl p-4 flex items-center gap-4 shadow-sm hover:shadow-md transition"
          >
            <div className="w-11 h-11 bg-teal-500 rounded-xl flex items-center justify-center">
              <span className="text-white text-xl">📊</span>
            </div>
            <div className="flex-1 text-left">
              <p className="font-semibold text-gray-800 text-sm">Track Status</p>
              <p className="text-xs text-gray-400">Monitor your complaint progress</p>
            </div>
            <span className="text-gray-300 text-lg">›</span>
          </button>

          <button
            onClick={() => navigate("/change-password")}
            className="w-full bg-white rounded-2xl p-4 flex items-center gap-4 shadow-sm hover:shadow-md transition"
          >
            <div className="w-11 h-11 bg-orange-400 rounded-xl flex items-center justify-center">
              <span className="text-white text-xl">🔒</span>
            </div>
            <div className="flex-1 text-left">
              <p className="font-semibold text-gray-800 text-sm">Settings</p>
              <p className="text-xs text-gray-400">Change password & preferences</p>
            </div>
            <span className="text-gray-300 text-lg">›</span>
          </button>
        </div>

        {/* Recent Activity */}
        <div className="flex justify-between items-center mb-3">
          <h2 className="font-bold text-gray-800">Recent Activity</h2>
          <button onClick={() => navigate("/status")} className="text-xs text-blue-500">View All</button>
        </div>

        {loading ? (
          <div className="flex justify-center py-8">
            <div className="w-8 h-8 border-4 border-blue-400 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            {recent.length === 0 && (
              <p className="text-center text-gray-400 text-sm py-8">No complaints yet. Submit one!</p>
            )}
            {recent.map((c, i) => (
              <div
                key={c.id}
                className={`flex items-start gap-3 p-4 ${i < recent.length - 1 ? "border-b border-gray-50" : ""}`}
              >
                <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${
                  c.status === "resolved" ? "bg-green-100" :
                  c.status === "in_progress" ? "bg-blue-100" : "bg-orange-100"
                }`}>
                  <span className="text-sm">
                    {c.status === "resolved" ? "✅" : c.status === "in_progress" ? "🔄" : "🕐"}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-800 text-sm truncate">{c.title}</p>
                  <p className="text-xs text-gray-400 truncate">{c.description}</p>
                  <p className="text-xs text-gray-300 mt-0.5">{new Date(c.created_at).toLocaleDateString()}</p>
                </div>
                <button
                  onClick={() => deleteComplaint(c.id)}
                  disabled={deletingId === c.id}
                  className="text-gray-300 hover:text-red-400 transition text-xs disabled:opacity-40"
                >
                  🗑
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Logout */}
        <button
          onClick={() => { localStorage.clear(); navigate("/"); }}
          className="w-full mt-4 py-3 rounded-2xl border border-red-200 text-red-400 text-sm font-medium hover:bg-red-50 transition"
        >
          Logout
        </button>
      </div>

      <BottomTab active="/dashboard" navigate={navigate} />
    </div>
  );
}

export default Dashboard;
