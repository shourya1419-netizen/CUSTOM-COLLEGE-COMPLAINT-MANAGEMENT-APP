import axios from "axios";

const BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:8000/api/";

const API = axios.create({ baseURL: BASE_URL });

// Attach access token to every request
API.interceptors.request.use((req) => {
  const token = localStorage.getItem("token");
  if (token) req.headers.Authorization = `Bearer ${token}`;
  return req;
});

// Auto-refresh access token on 401
API.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      const refresh = localStorage.getItem("refresh");
      if (refresh) {
        try {
          const res = await axios.post(`${BASE_URL}token/refresh/`, { refresh });
          const newAccess = res.data.access;
          localStorage.setItem("token", newAccess);
          original.headers.Authorization = `Bearer ${newAccess}`;
          return API(original);
        } catch {
          localStorage.clear();
          window.location.href = "/";
        }
      } else {
        localStorage.clear();
        window.location.href = "/";
      }
    }
    return Promise.reject(error);
  }
);

export default API;
