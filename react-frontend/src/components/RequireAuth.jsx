import { Navigate } from "react-router-dom";

// Sends visitors without a JWT to the login choice page.
export default function RequireAuth({ children }) {
    if (!sessionStorage.getItem("token")) {
        return <Navigate to="/login" replace />;
    }
    return children;
}
