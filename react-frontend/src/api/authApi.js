
import api from "../services/api";

export function authErrorMessage(error, fallback = "Login failed. Please try again.") {
    return (
        error?.response?.data?.message ||
        error?.message ||
        fallback
    );
}

// Login using the Express backend and MongoDB
export async function loginStudent({ email, password }) {
    const response = await api.post("/auth/login", {
        email: email.trim().toLowerCase(),
        password,
    });

    return response.data;
}

// Register a student using the Express backend
export async function registerStudent({
    username,
    fullName,
    name,
    email,
    department,
    password,
}) {
    const response = await api.post("/auth/register", {
        name: name || fullName || username,
        email: email.trim().toLowerCase(),
        department,
        password,
    });

    return response.data;
}
