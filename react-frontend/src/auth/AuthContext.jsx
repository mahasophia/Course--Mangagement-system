import { createContext, useContext, useState } from "react";

const AuthContext = createContext(null);

// JWT session data lives in sessionStorage (Task 10.6): it is cleared when the tab closes.
function saveSession(token, user) {
    if (token) sessionStorage.setItem("token", token);
    if (user?.role) sessionStorage.setItem("role", user.role);
    if (user?.id) sessionStorage.setItem("userId", String(user.id));
}

function clearSession() {
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("role");
    sessionStorage.removeItem("userId");
}

// A stored profile is only trusted while its JWT is still in this browser session.
function readStoredAccount(keys) {
    if (!sessionStorage.getItem("token")) return null;
    const data = keys.map((key) => localStorage.getItem(key)).find(Boolean);
    if (!data) return null;
    try { return JSON.parse(data); } catch { return data; }
}

export function AuthProvider({ children }) {
    const [student, setStudent] = useState(() =>
        readStoredAccount(["loggedInStudent", "currentStudent"])
    );

    const [admin, setAdmin] = useState(() => readStoredAccount(["loggedInAdmin"]));

    // token is optional so older call sites keep working; pass it to start a JWT session.
    function loginStudent(studentData, token) {
        saveSession(token, studentData);
        setStudent(studentData);
        localStorage.setItem("loggedInStudent", JSON.stringify(studentData));
        localStorage.setItem("currentStudent", JSON.stringify(studentData));
    }

    function loginAdmin(adminData, token) {
        saveSession(token, adminData);
        setAdmin(adminData);
        localStorage.setItem("loggedInAdmin", JSON.stringify(adminData));
    }

    function logoutStudent() {
        clearSession();
        setStudent(null);
        localStorage.removeItem("loggedInStudent");
        localStorage.removeItem("currentStudent");
    }

    function logoutAdmin() {
        clearSession();
        setAdmin(null);
        localStorage.removeItem("loggedInAdmin");
    }

    return (
        <AuthContext.Provider value={{ student, admin, loginStudent, loginAdmin, logoutStudent, logoutAdmin }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}
