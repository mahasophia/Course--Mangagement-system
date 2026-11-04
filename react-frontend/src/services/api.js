import axios from "axios";

// Base URL of the json-server mock API (see /mockapi). Override with
// VITE_API_URL in a .env file if you run it on another host/port.
const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || "http://localhost:3001",
    headers: { "Content-Type": "application/json" },
});

/** Turns an axios failure into a short, user-facing message. */
export function apiErrorMessage(error) {
    if (error?.isAxiosError && !error.response) {
        return "Cannot reach the server. Start the mock API (npm start inside the mockapi folder) and try again.";
    }
    return error?.message || "Something went wrong. Please try again.";
}

export default api;
