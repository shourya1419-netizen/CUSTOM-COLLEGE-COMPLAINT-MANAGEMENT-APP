import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import CreateComplaint from "./pages/CreateComplaint";
import AdminDashboard from "./pages/AdminDashboard";
import NotFound from "./pages/NotFound";
import ChangePassword from "./pages/ChangePassword";

function PrivateRoute({ children, requiredRole }) {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");
  if (!token) return <Navigate to="/" />;
  if (requiredRole && role !== requiredRole) {
    return <Navigate to={role === "admin" ? "/admin" : "/dashboard"} />;
  }
  return children;
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={
          <PrivateRoute requiredRole="student"><Dashboard /></PrivateRoute>
        } />
        <Route path="/create" element={
          <PrivateRoute requiredRole="student"><CreateComplaint /></PrivateRoute>
        } />
        <Route path="/change-password" element={
          <PrivateRoute requiredRole="student"><ChangePassword /></PrivateRoute>
        } />
        <Route path="/admin" element={
          <PrivateRoute requiredRole="admin"><AdminDashboard /></PrivateRoute>
        } />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

export default App;
