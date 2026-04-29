import { useState, useEffect } from "react";
import API from "../services/api";
import Navbar from "../components/Navbar";

const STATUS_CONFIG = {
  pending:     { color: "bg-orange-400", text: "text-orange-500", bg: "bg-orange-50",  border: "border-orange-100", icon: "🕐", progress: 20,  label: "Pending" },
  in_progress: { color: "bg-blue-400",   text: "text-blue-500",   bg: "bg-blue-50",    border: "border-blue-100",   icon: "🔄", progress: 60,  label: "In Progress" },
  resolved:    { color: "bg-green-400",  text: "text-green-500",  bg: "bg-green-50",   border: "border-green-100",  icon: "✅", progress: 100, label: "Resolved" },
  closed:      { color: "bg-gray-400",   text: "text-gray-500",   bg: "bg-gray-50",    border: "border-gray-100",   icon: "🔒", progress: 100, label: "Closed" },
};

function StatusPage() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const fetchComplaints = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await API.get("/complaints/");
        setComplaints(res.data);
      } catch {
        setError("Failed to load complaints. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    fetchComplaints();
  }, []);

  const filtered = filter === "all" ? complaints : complaints.filter((c) => c.status === filter);

  const counts = {
    all: complaints.length,
    pending: complaints.filter((c) => c.status === "pending").length,
    in_progress: complaints.filter((c) => c.status === "in_progress").length,
    resolved: complaints.filter((c) => c.status === "resolved").length,
  };

  return (
    <div className={darkMode ? "dark" : ""}>
      <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
        <Navbar darkMode={darkMode} setDarkMode={setDarkMode} />

        <div className="flex-1 pb-24 pt-20 md:pt-0">
          {/* Header */}
          <div className="bg-gradient-to-br from-blue-500 to-purple-500 px-6 pt-10 pb-8 rounded-b-3xl">
            <h1 className="text-white text-2xl font-bold">Track Status</h1>
            <p className="text-blue-100 text-sm mt-1">Monitor your complaints</p>
          </div>

          {error && (
            <div className="mx-4 mt-4 bg-red-100 text-red-600 px-4 py-3 rounded-lg">{error}</div>
          )}

          {/* Filter Tabs */}
          <div className="px-4 mt-4 flex gap-2 overflow-x-auto pb-1">
            {[
              { key: "all", label: "All" },
              { key: "pending", label: "Pending" },
              { key: "in_progress", label: "In Progress" },
              { key: "resolved", label: "Resolved" },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setFilter(tab.key)}
                className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition flex items-center gap-1 ${
                  filter === tab.key
                    ? "bg-blue-500 text-white shadow-md"
                    : "bg-white text-gray-500 border border-gray-200"
                }`}
              >
                {tab.label}
                <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                  filter === tab.key ? "bg-white text-blue-500" : "bg-gray-100 text-gray-500"
                }`}>
                  {counts[tab.key]}
                </span>
              </button>
            ))}
          </div>

          {/* Complaints */}
          <div className="px-4 mt-4 space-y-4">
            {loading ? (
              <div className="flex justify-center py-12">
                <div className="w-8 h-8 border-4 border-blue-400 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <p className="text-4xl mb-2">📭</p>
                <p className="text-sm">No complaints found</p>
              </div>
            ) : (
              filtered.map((c) => {
                const cfg = STATUS_CONFIG[c.status] || STATUS_CONFIG.pending;
                return (
                  <div key={c.id} className={`rounded-2xl p-4 border ${cfg.bg} ${cfg.border}`}>
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="text-xs text-gray-400 capitalize mb-0.5">
                          {c.category || "General"}
                        </p>
                        <h3 className={`font-bold text-sm ${cfg.text}`}>{c.title}</h3>
                        <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
                          <span>📅</span>
                          {new Date(c.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                          {c.department && <><span>•</span><span className="capitalize">{c.department}</span></>}
                        </p>
                      </div>
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${cfg.color}`}>
                        <span className="text-white text-lg">{cfg.icon}</span>
                      </div>
                    </div>

                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold text-white ${cfg.color} mb-3`}>
                      {cfg.label}
                    </span>

                    <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
                      <span>Progress</span>
                      <span className={`font-semibold ${cfg.text}`}>{cfg.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-500 ${cfg.color}`}
                        style={{ width: `${cfg.progress}%` }}
                      />
                    </div>

                    {c.status === "resolved" && (
                      <div className="mt-3 bg-white rounded-xl p-2 flex items-center gap-2">
                        <span className="text-green-400">✅</span>
                        <p className="text-xs text-gray-500">Successfully resolved! Thank you for reporting.</p>
                      </div>
                    )}
                    {c.status === "in_progress" && (
                      <div className="mt-3 bg-white rounded-xl p-2 flex items-center gap-2">
                        <span className="text-blue-400">🔵</span>
                        <p className="text-xs text-gray-500">Currently being reviewed by {c.department || "the team"}.</p>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default StatusPage;
