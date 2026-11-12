import { Navigate } from "react-router-dom";

// Use the real backend-backed admin login instead of the old hardcoded demo password.
export default function AddCourseEdit() {
    return <Navigate to="/admin-login?redirect=%2Fadd-course" replace />;
}
