import axios from "axios";

// Express backend (see /backend). Override with VITE_BACKEND_URL in a .env file.
// (Named differently from VITE_API_URL, which the json-server mock API uses.)
const apiClient = axios.create({
    baseURL: import.meta.env.VITE_BACKEND_URL || "http://localhost:5000/api/v1",
    headers: {
        "Content-Type": "application/json",
    },
});

// Attach the JWT (stored in sessionStorage at login) to every request.
apiClient.interceptors.request.use((config) => {
    const token = sessionStorage.getItem("token");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default apiClient;
