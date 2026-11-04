import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import LoginChoice from "./pages/LoginChoice";
import StuLogin from "./pages/StuLogin";
import AdminLogin from "./pages/AdminLogin";
import Register from "./pages/Register";
import AdminRegister from "./pages/AdminRegister";
import StudentDashboard from "./pages/StudentDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import Courses from "./pages/Courses";
import CourseDetails from "./pages/CourseDetails";
import Certificate from "./pages/Certificate";
import AddCourse from "./pages/AddCourse";
import AddCourseEdit from "./pages/AddCourseEdit";
import EditCourse from "./pages/EditCourse";
import EditCourseLogin from "./pages/EditCourseLogin";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Notifications from "./pages/Notifications";
import LearnCourse from "./pages/LearnCourse";

function App() {
    return (
        <Routes>
            {/* Home */}
            <Route path="/" element={<Home />} />
            <Route path="/index.html" element={<Home />} />

            {/* Authentication & Choice */}
            <Route path="/login" element={<LoginChoice />} />
            <Route path="/login-choice.html" element={<LoginChoice />} />
            <Route path="/stu-login" element={<StuLogin />} />
            <Route path="/stu-login.html" element={<StuLogin />} />
            <Route path="/admin-login" element={<AdminLogin />} />
            <Route path="/admin-login.html" element={<AdminLogin />} />

            {/* Registration */}
            <Route path="/register" element={<Register />} />
            <Route path="/stu-register.html" element={<Register />} />
            <Route path="/admin-register" element={<AdminRegister />} />
            <Route path="/admin-register.html" element={<AdminRegister />} />

            {/* Dashboards */}
            <Route path="/dashboard" element={<StudentDashboard />} />
            <Route path="/stu-dashboard.html" element={<StudentDashboard />} />
            <Route path="/admin-dashboard" element={<AdminDashboard />} />
            <Route path="/admin-dashboard.html" element={<AdminDashboard />} />

            {/* Courses & Details */}
            <Route path="/courses" element={<Courses />} />
            <Route path="/courses.html" element={<Courses />} />
            <Route path="/course-details" element={<CourseDetails />} />
            <Route path="/course.html" element={<CourseDetails />} />

            {/* Course Admin & Editing */}
            <Route path="/add-course" element={<AddCourse />} />
            <Route path="/add-course.html" element={<AddCourse />} />
            <Route path="/add-course-edit" element={<AddCourseEdit />} />
            <Route path="/add-course-edit.html" element={<AddCourseEdit />} />
            <Route path="/edit-course" element={<EditCourse />} />
            <Route path="/edit-course.html" element={<EditCourse />} />
            <Route path="/edit-course-login" element={<EditCourseLogin />} />
            <Route path="/edit-course-login.html" element={<EditCourseLogin />} />

            {/* Password & Alerts */}
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/forget-password.html" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/reset-password.html" element={<ResetPassword />} />
            <Route path="/certificate" element={<Certificate />} />
            <Route path="/certificate.html" element={<Certificate />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/notifications.html" element={<Notifications />} />
            <Route path="/learn" element={<LearnCourse />} />
        </Routes>
    );
}

export default App;