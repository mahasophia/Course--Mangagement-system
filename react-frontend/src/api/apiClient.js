// Single Axios client for the whole app. It lives in services/api.js (base URL from
// VITE_BACKEND_URL, JWT attached from sessionStorage); this file keeps the old import path working.
import api from "../services/api";

export default api;
