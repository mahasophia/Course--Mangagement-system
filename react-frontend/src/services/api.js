
import axios from "axios";

const api = axios.create({
  baseURL:
    import.meta.env.VITE_API_URL ||
    "http://localhost:5000/api/v1",
  headers: {
    "Content-Type": "application/json",
  },
});

// Automatically attach login token to API requests
api.interceptors.request.use(
  (config) => {
    const token =
      sessionStorage.getItem("token") ||
      localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Handle API errors
export function apiErrorMessage(error) {
  if (error?.isAxiosError && !error.response) {
    return "Cannot reach the backend. Please start the backend server.";
  }

  return (
    error?.response?.data?.message ||
    error?.message ||
    "Something went wrong. Please try again."
  );
}

export default api;
