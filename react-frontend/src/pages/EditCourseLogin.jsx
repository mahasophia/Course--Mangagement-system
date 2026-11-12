import { Navigate, useSearchParams } from "react-router-dom";

// Use the real backend-backed admin login instead of the old hardcoded demo password.
export default function EditCourseLogin() {
    const [searchParams] = useSearchParams();
    const courseId = searchParams.get("course");
    const target = courseId ? `/edit-course?course=${encodeURIComponent(courseId)}` : "/edit-course";
    return <Navigate to={`/admin-login?redirect=${encodeURIComponent(target)}`} replace />;
}
