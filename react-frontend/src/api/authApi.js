import apiClient from "./apiClient";

export async function registerStudent(studentData) {
    const response = await apiClient.post("/auth/register", studentData);
    return response.data;
}

export async function loginStudent(credentials) {
    const response = await apiClient.post("/auth/login", credentials);
    return response.data;
}

/** Turns a failed request into a short message for the UI. */
export function authErrorMessage(error, fallback) {
    if (error?.response?.data?.message) return error.response.data.message;
    if (error?.isAxiosError && !error.response) {
        return "Cannot reach the backend. Start it with npm run dev inside the backend folder.";
    }
    if (error && !error.isAxiosError && error.message) return error.message;
    return fallback;
}
