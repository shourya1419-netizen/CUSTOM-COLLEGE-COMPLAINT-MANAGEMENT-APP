import { useState } from "react";
import API from "../services/api";
import { useNavigate } from "react-router-dom";

const CATEGORIES = [
  { value: "hostel", label: "Hostel", emoji: "🏠" },
  { value: "faculty", label: "Faculty", emoji: "🏫" },
  { value: "mess", label: "Mess/Canteen", emoji: "🍽️" },
  { value: "infrastructure", label: "Infrastructure", emoji: "🏗️" },
  { value: "network", label: "Network", emoji: "📶" },
  { value: "transport", label: "Transport", emoji: "🚌" },
];

function CreateComplaint() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: "", description: "", category: "", department: "", file: null,
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("title", form.title);
      formData.append("description", form.description);
      formData.append("category", form.category);
      formData.append("department", form.department);
      if (form.file) formData.append("file", form.file);
      await API.post("/complaints/", formData);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.error || "Failed to submit complaint.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24">

      {/* Gradient Header */}
      <div className="bg-gradient-to-br from-purple-500 to-pink-400 px-6 pt-10 pb-8 rounded-b-3xl relative">
        <button
          onClick={() => navigate("/dashboard")}
          className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center text-white mb-4"
        >
          ←
        </button>
        <h1 className="text-white text-2xl font-bold">Submit Complaint</h1>
        <p className="text-purple-100 text-sm mt-1">We're here to help you</p>
      </div>

      <div className="px-4 mt-6 space-y-4">

        {error && (
          <div className="bg-red-50 text-red-500 text-sm px-4 py-3 rounded-2xl border border-red-100">
            {error}
          </div>
        )}

        {/* Category Grid */}
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <span>🏷️</span> Select Category
          </h3>
          <div className="grid grid-cols-2 gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.value}
                type="button"
                onClick={() => setForm({ ...form, category: cat.value })}
                className={`p-3 rounded-xl border text-center transition ${
                  form.category === cat.value
                    ? "border-purple-400 bg-purple-50"
                    : "border-gray-100 bg-gray-50 hover:border-purple-200"
                }`}
              >
                <div className="text-2xl mb-1">{cat.emoji}</div>
                <p className="text-xs text-gray-600 font-medium">{cat.label}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Department */}
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <span>🏢</span> Department
          </h3>
          <select
            onChange={(e) => setForm({ ...form, department: e.target.value })}
            className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-300"
          >
            <option value="">Choose a department</option>
            <option value="maintenance">Maintenance</option>
            <option value="it">IT</option>
            <option value="admin">Admin</option>
            <option value="canteen">Canteen</option>
            <option value="hostel">Hostel Management</option>
          </select>
        </div>

        {/* Title */}
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <span>📝</span> Complaint Title
          </h3>
          <input
            type="text"
            placeholder="Brief description of the issue"
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-300"
          />
        </div>

        {/* Description */}
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <span>💬</span> Detailed Description
          </h3>
          <textarea
            rows="4"
            placeholder="Provide detailed information about your complaint..."
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-300 resize-none"
          />
          <p className="text-xs text-gray-400 mt-1">Be specific to help us resolve faster</p>
        </div>

        {/* File Upload */}
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <span>📎</span> Attach Evidence (Optional)
          </h3>
          <label className="w-full border-2 border-dashed border-gray-200 rounded-xl p-6 flex flex-col items-center cursor-pointer hover:border-purple-300 transition">
            <span className="text-2xl mb-1">⬆️</span>
            <p className="text-sm text-gray-500">Upload Image</p>
            <p className="text-xs text-gray-400">JPG, PNG up to 5MB</p>
            <input
              type="file"
              className="hidden"
              onChange={(e) => setForm({ ...form, file: e.target.files[0] })}
            />
          </label>
          {form.file && (
            <p className="text-xs text-purple-500 mt-2 text-center">📎 {form.file.name}</p>
          )}
        </div>

        {/* Submit Button */}
        <button
          onClick={handleSubmit}
          disabled={loading || !form.title || !form.description}
          className="w-full bg-gradient-to-r from-purple-500 to-pink-400 text-white py-4 rounded-2xl font-semibold flex items-center justify-center gap-2 hover:opacity-90 transition disabled:opacity-50"
        >
          <span>✈️</span>
          {loading ? "Submitting..." : "Submit Complaint"}
        </button>

        <div className="bg-blue-50 rounded-2xl p-3 text-center">
          <p className="text-xs text-blue-500">
            📧 Note: You'll receive updates via email and dashboard notifications
          </p>
        </div>
      </div>
    </div>
  );
}

export default CreateComplaint;
