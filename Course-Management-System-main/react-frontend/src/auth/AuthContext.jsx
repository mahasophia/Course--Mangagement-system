import { createContext, useContext, useState } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    // Synchronize student state with localStorage keys used by registration/login
    const [student, setStudent] = useState(() => {
        const data = localStorage.getItem("loggedInStudent") || localStorage.getItem("currentStudent");
        if (!data) return null;
        try { return JSON.parse(data); } catch { return data; }
    });

    const [admin, setAdmin] = useState(() => {
        const data = localStorage.getItem("loggedInAdmin");
        if (!data) return null;
        try { return JSON.parse(data); } catch { return data; }
    });

    function loginStudent(studentData) {
        setStudent(studentData);
        localStorage.setItem("loggedInStudent", JSON.stringify(studentData));
        localStorage.setItem("currentStudent", JSON.stringify(studentData));
    }

    function loginAdmin(adminData) {
        setAdmin(adminData);
        localStorage.setItem("loggedInAdmin", JSON.stringify(adminData));
    }

    function logoutStudent() {
        setStudent(null);
        localStorage.removeItem("loggedInStudent");
        localStorage.removeItem("currentStudent");
    }

    function logoutAdmin() {
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
