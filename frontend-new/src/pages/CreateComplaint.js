import { useState } from "react";
import API from "../services/api";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";

function CreateComplaint() {
  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "",
    department: "",
    file: null,
  });

  const navigate = useNavigate();
  const [darkMode, setDarkMode] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

 
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
      const msg = err.response?.data?.error || "Failed to submit complaint.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };
  

  


  return (
    <div className={darkMode ? "dark" : ""}>
      <div className="flex min-h-screen bg-gray-100 dark:bg-gray-900 text-black dark:text-white">
        <Navbar darkMode={darkMode} setDarkMode={setDarkMode} />

        <div className="flex-1 flex items-center justify-center p-8">
          <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg w-[400px]">

            <h2 className="text-2xl font-bold text-center mb-6 dark:text-white">
              Create Complaint
            </h2>

            {error && (
              <div className="bg-red-100 text-red-600 text-sm px-4 py-2 rounded-lg mb-4">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>

              <input
                type="text"
                name="title"
                placeholder="Complaint Title"
                className="w-full mb-4 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 dark:bg-gray-700 dark:text-white dark:border-gray-600"
                onChange={handleChange}
              />

              <textarea
                name="description"
                placeholder="Complaint Description"
                className="w-full mb-4 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 dark:bg-gray-700 dark:text-white dark:border-gray-600"
                rows="4"
                onChange={handleChange}
              />

              <select
                name="category"
                onChange={handleChange}
                className="w-full mb-4 p-3 border rounded-lg dark:bg-gray-700 dark:text-white dark:border-gray-600"
              >
                <option value="">Select Category</option>
                <option value="hostel">Hostel</option>
                <option value="network">Network</option>
                <option value="electricity">Electricity</option>
              </select>

              <select
                name="department"
                onChange={handleChange}
                className="w-full mb-4 p-3 border rounded-lg dark:bg-gray-700 dark:text-white dark:border-gray-600"
              >
                <option value="">Select Department</option>
                <option value="maintenance">Maintenance</option>
                <option value="it">IT</option>
                <option value="admin">Admin</option>
              </select>

              <input
                type="file"
                name="file"
                className="w-full mb-4 dark:text-white"
                onChange={(e) => setForm({ ...form, file: e.target.files[0] })}
              />

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-purple-600 text-white p-3 rounded-lg hover:bg-purple-700 transition disabled:opacity-60"
              >
                {loading ? "Submitting..." : "Submit Complaint"}
              </button>

            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CreateComplaint;
