import { useState } from "react";
import API from "../services/api";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, AlignLeft, Tag, Building2, Paperclip, Send, CheckCircle, X } from "lucide-react";

const MAX_FILE_MB = 5;
const ALLOWED_TYPES = ["application/pdf", "image/jpeg", "image/png", "image/jpg"];

const CATEGORIES = [
  { value: "hostel",      label: "Hostel",       icon: "🏠", color: "from-orange-400 to-amber-400" },
  { value: "network",     label: "Network",      icon: "📶", color: "from-blue-400 to-cyan-400" },
  { value: "electricity", label: "Electricity",  icon: "⚡", color: "from-yellow-400 to-orange-400" },
  { value: "others",      label: "Others",       icon: "📌", color: "from-gray-400 to-slate-400" },
];

const DEPARTMENTS = [
  { value: "maintenance", label: "Maintenance", icon: "🔧" },
  { value: "it",          label: "IT",          icon: "💻" },
  { value: "admin",       label: "Admin",       icon: "🏛️" },
  { value: "others",      label: "Others",      icon: "📌" },
];

const STEPS = ["Details", "Category", "Attachment"];

export default function CreateComplaint() {
  const [form, setForm] = useState({ title: "", description: "", category: "", department: "", file: null });
  const [step, setStep] = useState(0);
  const [darkMode, setDarkMode] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => { setForm({ ...form, [e.target.name]: e.target.value }); setError(""); };

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!ALLOWED_TYPES.includes(file.type)) { setError("Only PDF, JPG, and PNG files are allowed."); e.target.value = ""; return; }
    if (file.size > MAX_FILE_MB * 1024 * 1024) { setError(`File must be under ${MAX_FILE_MB}MB.`); e.target.value = ""; return; }
    setForm({ ...form, file });
    setError("");
  };

  const nextStep = () => {
    if (step === 0) {
      if (!form.title.trim()) { setError("Title is required."); return; }
      if (!form.description.trim()) { setError("Description is required."); return; }
    }
    setError("");
    setStep(s => Math.min(s + 1, 2));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      const fd = new FormData();
      fd.append("title", form.title.trim());
      fd.append("description", form.description.trim());
      fd.append("category", form.category);
      fd.append("department", form.department);
      if (form.file) fd.append("file", form.file);
      await API.post("/complaints/", fd);
      setSubmitted(true);
      setTimeout(() => navigate("/dashboard"), 2000);
    } catch (err) {
      const data = err.response?.data;
      if (data?.error) setError(data.error);
      else if (data) { const k = Object.keys(data)[0]; const v = data[k]; setError(Array.isArray(v) ? v[0] : String(v)); }
      else setError("Failed to submit. Try again.");
    } finally { setLoading(false); }
  };

  return (
    <div className={darkMode ? "dark" : ""}>
      <div className="flex min-h-screen bg-[#f8f9ff] dark:bg-[#0a0a14] text-gray-900 dark:text-white">
        <Navbar darkMode={darkMode} setDarkMode={setDarkMode} />

        <div className="flex-1 flex items-center justify-center p-6 pt-20 md:pt-8">
          <div className="w-full max-w-2xl">

            {/* Success screen */}
            <AnimatePresence>
              {submitted && (
                <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-16">
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: "spring" }}
                    className="w-24 h-24 bg-gradient-to-br from-emerald-400 to-green-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-emerald-300/50">
                    <CheckCircle size={48} className="text-white" />
                  </motion.div>
                  <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">Complaint Submitted!</h2>
                  <p className="text-gray-400">Redirecting to dashboard...</p>
                </motion.div>
              )}
            </AnimatePresence>

            {!submitted && (
              <>
                {/* Header */}
                <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8 text-center">
                  <div className="inline-flex items-center gap-2 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 px-4 py-2 rounded-full text-sm font-medium mb-4 border border-indigo-100 dark:border-indigo-500/20">
                    <FileText size={14} /> New Complaint
                  </div>
                  <h1 className="text-3xl font-extrabold text-gray-800 dark:text-white">Submit a Complaint</h1>
                  <p className="text-gray-400 mt-2 text-sm">Fill in the details and we'll route it to the right department</p>
                </motion.div>

                {/* Step indicator */}
                <div className="flex items-center justify-center gap-0 mb-8">
                  {STEPS.map((s, i) => (
                    <div key={s} className="flex items-center">
                      <motion.div whileHover={{ scale: 1.05 }}
                        className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all cursor-pointer ${
                          i === step
                            ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-300/40"
                            : i < step
                            ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400"
                            : "bg-gray-100 dark:bg-white/5 text-gray-400"
                        }`}
                        onClick={() => i < step && setStep(i)}>
                        <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
                          i < step ? "bg-emerald-500 text-white" : i === step ? "bg-white/20 text-white" : "bg-gray-300 dark:bg-gray-600 text-gray-500"
                        }`}>
                          {i < step ? "✓" : i + 1}
                        </span>
                        {s}
                      </motion.div>
                      {i < STEPS.length - 1 && (
                        <div className={`w-8 h-0.5 mx-1 transition-all ${i < step ? "bg-emerald-400" : "bg-gray-200 dark:bg-white/10"}`} />
                      )}
                    </div>
                  ))}
                </div>

                {/* Card */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                  className="bg-white dark:bg-[#111120] rounded-3xl shadow-xl border border-gray-100 dark:border-white/5 overflow-hidden">

                  {/* Card top gradient bar */}
                  <div className="h-1.5 w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />

                  <div className="p-8">
                    <AnimatePresence mode="wait">
                      {error && (
                        <motion.div key="err" initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                          className="flex items-center gap-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-500/30 text-red-600 dark:text-red-400 text-sm px-4 py-3 rounded-xl mb-6">
                          ⚠️ {error}
                          <button onClick={() => setError("")} className="ml-auto"><X size={14} /></button>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <form onSubmit={handleSubmit}>
                      <AnimatePresence mode="wait">

                        {/* Step 0 — Details */}
                        {step === 0 && (
                          <motion.div key="step0" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}
                            className="space-y-5">
                            <div>
                              <label className="flex items-center gap-2 text-sm font-semibold text-gray-600 dark:text-gray-300 mb-2">
                                <FileText size={14} className="text-indigo-500" /> Complaint Title <span className="text-red-400">*</span>
                              </label>
                              <input type="text" name="title" value={form.title} onChange={handleChange}
                                placeholder="e.g. WiFi not working in Block B"
                                className="w-full px-4 py-3.5 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-gray-800 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition" />
                            </div>
                            <div>
                              <label className="flex items-center gap-2 text-sm font-semibold text-gray-600 dark:text-gray-300 mb-2">
                                <AlignLeft size={14} className="text-indigo-500" /> Description <span className="text-red-400">*</span>
                              </label>
                              <textarea name="description" value={form.description} onChange={handleChange} rows={5}
                                placeholder="Describe the issue in detail — when it started, how it affects you, what you've tried..."
                                className="w-full px-4 py-3.5 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-gray-800 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition resize-none" />
                              <p className="text-xs text-gray-400 mt-1.5 text-right">{form.description.length} characters</p>
                            </div>
                          </motion.div>
                        )}

                        {/* Step 1 — Category & Department */}
                        {step === 1 && (
                          <motion.div key="step1" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}
                            className="space-y-6">
                            <div>
                              <label className="flex items-center gap-2 text-sm font-semibold text-gray-600 dark:text-gray-300 mb-3">
                                <Tag size={14} className="text-indigo-500" /> Category
                              </label>
                              <div className="grid grid-cols-3 gap-3">
                                {CATEGORIES.map(c => (
                                  <motion.button key={c.value} type="button" whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
                                    onClick={() => setForm({ ...form, category: c.value })}
                                    className={`relative flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all ${
                                      form.category === c.value
                                        ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 shadow-lg shadow-indigo-200/40"
                                        : "border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/3 hover:border-indigo-300"
                                    }`}>
                                    {form.category === c.value && (
                                      <div className="absolute top-2 right-2 w-4 h-4 bg-indigo-500 rounded-full flex items-center justify-center">
                                        <span className="text-white text-[9px]">✓</span>
                                      </div>
                                    )}
                                    <span className="text-2xl">{c.icon}</span>
                                    <span className={`text-xs font-semibold ${form.category === c.value ? "text-indigo-600 dark:text-indigo-400" : "text-gray-500 dark:text-gray-400"}`}>
                                      {c.label}
                                    </span>
                                  </motion.button>
                                ))}
                              </div>
                            </div>

                            <div>
                              <label className="flex items-center gap-2 text-sm font-semibold text-gray-600 dark:text-gray-300 mb-3">
                                <Building2 size={14} className="text-indigo-500" /> Department
                              </label>
                              <div className="grid grid-cols-3 gap-3">
                                {DEPARTMENTS.map(d => (
                                  <motion.button key={d.value} type="button" whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
                                    onClick={() => setForm({ ...form, department: d.value })}
                                    className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all ${
                                      form.department === d.value
                                        ? "border-purple-500 bg-purple-50 dark:bg-purple-900/20 shadow-lg shadow-purple-200/40"
                                        : "border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/3 hover:border-purple-300"
                                    }`}>
                                    <span className="text-2xl">{d.icon}</span>
                                    <span className={`text-xs font-semibold ${form.department === d.value ? "text-purple-600 dark:text-purple-400" : "text-gray-500 dark:text-gray-400"}`}>
                                      {d.label}
                                    </span>
                                  </motion.button>
                                ))}
                              </div>
                            </div>
                          </motion.div>
                        )}

                        {/* Step 2 — Attachment */}
                        {step === 2 && (
                          <motion.div key="step2" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}
                            className="space-y-6">
                            <div>
                              <label className="flex items-center gap-2 text-sm font-semibold text-gray-600 dark:text-gray-300 mb-3">
                                <Paperclip size={14} className="text-indigo-500" /> Attach Evidence <span className="text-gray-400 font-normal">(optional)</span>
                              </label>

                              <label className={`relative flex flex-col items-center justify-center w-full h-44 rounded-2xl border-2 border-dashed cursor-pointer transition-all group ${
                                form.file
                                  ? "border-emerald-400 bg-emerald-50 dark:bg-emerald-900/10"
                                  : "border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/3 hover:border-indigo-400 hover:bg-indigo-50/50 dark:hover:bg-indigo-900/10"
                              }`}>
                                <input type="file" accept=".pdf,.jpg,.jpeg,.png" className="hidden" onChange={handleFile} />
                                {form.file ? (
                                  <div className="text-center">
                                    <div className="text-4xl mb-2">📎</div>
                                    <p className="font-semibold text-emerald-600 dark:text-emerald-400 text-sm">{form.file.name}</p>
                                    <p className="text-xs text-gray-400 mt-1">{(form.file.size / 1024 / 1024).toFixed(2)} MB</p>
                                    <button type="button" onClick={(e) => { e.preventDefault(); setForm({ ...form, file: null }); }}
                                      className="mt-3 text-xs text-red-400 hover:text-red-600 flex items-center gap-1 mx-auto">
                                      <X size={12} /> Remove file
                                    </button>
                                  </div>
                                ) : (
                                  <div className="text-center px-6">
                                    <div className="w-14 h-14 rounded-2xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition">
                                      <Paperclip size={24} className="text-indigo-500" />
                                    </div>
                                    <p className="font-semibold text-gray-600 dark:text-gray-300 text-sm">Drop file here or click to browse</p>
                                    <p className="text-xs text-gray-400 mt-1">PDF, JPG, PNG — max {MAX_FILE_MB}MB</p>
                                  </div>
                                )}
                              </label>
                            </div>

                            {/* Summary */}
                            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/10 dark:to-purple-900/10 rounded-2xl p-4 border border-indigo-100 dark:border-indigo-500/20">
                              <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">Complaint Summary</p>
                              <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                  <span className="text-gray-400">Title</span>
                                  <span className="font-semibold text-gray-700 dark:text-gray-200 truncate max-w-[200px]">{form.title || "—"}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                  <span className="text-gray-400">Category</span>
                                  <span className="font-semibold text-gray-700 dark:text-gray-200 capitalize">{form.category || "Not selected"}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                  <span className="text-gray-400">Department</span>
                                  <span className="font-semibold text-gray-700 dark:text-gray-200 capitalize">{form.department || "Not selected"}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                  <span className="text-gray-400">Attachment</span>
                                  <span className="font-semibold text-gray-700 dark:text-gray-200">{form.file ? "✅ Attached" : "None"}</span>
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {/* Navigation buttons */}
                      <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-100 dark:border-white/5">
                        <motion.button type="button" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                          onClick={() => step > 0 ? setStep(s => s - 1) : navigate("/dashboard")}
                          className="px-5 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 text-gray-500 dark:text-gray-400 text-sm font-medium hover:bg-gray-50 dark:hover:bg-white/5 transition">
                          {step === 0 ? "← Cancel" : "← Back"}
                        </motion.button>

                        {step < 2 ? (
                          <motion.button type="button" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                            onClick={nextStep}
                            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm font-semibold shadow-lg shadow-indigo-300/30 hover:shadow-indigo-300/50 transition">
                            Continue →
                          </motion.button>
                        ) : (
                          <motion.button type="submit" disabled={loading} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm font-semibold shadow-lg shadow-indigo-300/30 hover:shadow-indigo-300/50 transition disabled:opacity-60">
                            {loading
                              ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Submitting...</>
                              : <><Send size={15} /> Submit Complaint</>}
                          </motion.button>
                        )}
                      </div>
                    </form>
                  </div>
                </motion.div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
