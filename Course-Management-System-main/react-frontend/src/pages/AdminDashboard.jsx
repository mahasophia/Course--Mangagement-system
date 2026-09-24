import { useState } from "react";
import { Link } from "react-router-dom";
import PageCss from "../components/PageCss";
import { deleteCourse, getCourses } from "../data/coursesStore";
import { clearAllEnrollments, getAllEnrollments } from "../data/enrollmentsStore";

export default function AdminDashboard() {
    const [courses, setCourses] = useState(() => getCourses());

    // Read every student's enrollments (admin view isn't scoped to one student)
    const [enrollments, setEnrollments] = useState(() => getAllEnrollments());

    const totalEnrolled = enrollments.length;
    const totalCompleted = enrollments.filter((entry) => entry.status === "Completed").length;
    const progressPct = totalEnrolled > 0 ? Math.round((totalCompleted / totalEnrolled) * 100) : 0;

    function handleClearAll() {
        if (!window.confirm("Clear all enrollment records? This cannot be undone.")) return;
        clearAllEnrollments();
        setEnrollments([]);
    }

    function handleDeleteCourse(id, title) {
        if (!window.confirm(`Delete "${title}"? This cannot be undone.`)) return;
        deleteCourse(id);
        setCourses(getCourses());
    }

    return (
        <>
            <PageCss href="/css/admin_dashboard.css" />
                        {/* ================= NAVBAR ================= */}
            <nav className="navbar">
                <div className="logo">
                    <i className="fa-solid fa-graduation-cap"></i>
                    <span>
                        SkillMatrix
                        <span className="admin-tag">Admin</span>
                    </span>
                </div>
                <ul className="nav-links">
                    <li>
                        <Link to="/admin-dashboard" className="active-nav">
                            Dashboard
                        </Link>
                    </li>
                    <li>
                        <Link to="/courses">
                            View Courses Page
                        </Link>
                    </li>
                </ul>
                <div className="nav-buttons">
                    <Link to="/courses" className="login-btn" id="logoutBtn" type="button">
                        <i className="fa-solid fa-right-from-bracket"></i>
                        Logout
                    </Link>
                </div>
            </nav>
            <main className="admin-main">
                <div className="admin-header">
                    <div>
                        <h1>Welcome back, Admin</h1>
                        <p>Here's what's happening across your course catalog.</p>
                    </div>
                    <Link to="/add-course" className="primary-btn admin-add-btn">
                        <i className="fa-solid fa-plus"></i>
                        Add New Course
                    </Link>
                </div>
                <div id="adminBanner" className="admin-banner" hidden=""></div>
                {/* ========== STATS ========== */}
                <div className="admin-stats">
                    <div className="admin-stat-card">
                        <div className="admin-stat-icon">
                            <i className="fa-solid fa-book"></i>
                        </div>
                        <div>
                            <h3 id="statTotalCourses">{courses.length}</h3>
                            <p>Total Courses</p>
                        </div>
                    </div>
                    <div className="admin-stat-card">
                        <div className="admin-stat-icon" style={{background: "#f0fdf4"}}>
                            <i className="fa-solid fa-user-graduate" style={{color: "#22c55e"}}></i>
                        </div>
                        <div>
                            <h3>{totalEnrolled}</h3>
                            <p>Total Enrolled</p>
                        </div>
                    </div>
                    <div className="admin-stat-card">
                        <div className="admin-stat-icon" style={{background: "#eff6ff"}}>
                            <i className="fa-solid fa-circle-check" style={{color: "#3b82f6"}}></i>
                        </div>
                        <div>
                            <h3>{totalCompleted}</h3>
                            <p>Completed</p>
                        </div>
                    </div>
                    <div className="admin-stat-card admin-stat-progress">
                        <div className="admin-stat-icon" style={{background: "#f5ede4"}}>
                            <i className="fa-solid fa-chart-line" style={{color: "#9a6f49"}}></i>
                        </div>
                        <div className="admin-stat-progress-body">
                            <p>Overall Progress</p>
                            <div className="progress-track">
                                <div className="progress-fill" style={{width: `${progressPct}%`}}></div>
                            </div>
                            <span style={{fontSize: "12px", color: "var(--text-muted)"}}>{progressPct}%</span>
                        </div>
                    </div>
                </div>
                {/* ========== COURSES TABLE ========== */}
                <div className="admin-table-wrap">
                    <div className="admin-table-header">
                        <h2>All Courses</h2>
                    </div>
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Course</th>
                                <th>Category</th>
                                <th>Level</th>
                                <th>Duration</th>
                                <th>Rating</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody id="coursesTableBody">
                            {courses.length === 0 ? (
                                <tr>
                                    <td colSpan="6" style={{textAlign: "center", padding: "24px", color: "var(--text-muted)"}}>
                                        No courses yet. Click "Add New Course" to create one.
                                    </td>
                                </tr>
                            ) : (
                                courses.map((course) => (
                                    <tr key={course.id}>
                                        <td>{course.title}</td>
                                        <td>{course.category}</td>
                                        <td>{course.level}</td>
                                        <td>{course.weeks} Weeks · {course.hours} Hours</td>
                                        <td>{course.rating}</td>
                                        <td style={{display: "flex", gap: "10px"}}>
                                            <Link to={`/edit-course-login?course=${course.id}`} title="Edit Course">
                                                <i className="fa-solid fa-pen-to-square"></i>
                                            </Link>
                                            <button
                                                type="button"
                                                onClick={() => handleDeleteCourse(course.id, course.title)}
                                                title="Delete Course"
                                                style={{background: "none", border: "none", cursor: "pointer", color: "#dc2626"}}
                                            >
                                                <i className="fa-solid fa-trash"></i>
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
                {/* NEW ENROLLMENT SECTION */}
                <div className="admin-table-wrap" style={{marginTop: "30px"}}>
                    <div className="admin-table-header">
                        <h2>Enrollment Details</h2>
                        <button className="clear-all-btn" onClick={handleClearAll}>
                            <i className="fa-solid fa-trash"></i>
                            Clear All
                        </button>
                    </div>
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Course Name</th>
                                <th>Student Name</th>
                                <th>Roll No</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {enrollments.length === 0 ? (
                                <tr>
                                    <td colSpan="4" style={{textAlign: "center", padding: "24px", color: "var(--text-muted)"}}>
                                        No enrollments yet.
                                    </td>
                                </tr>
                            ) : (
                                enrollments.map((entry, i) => (
                                    <tr key={`${entry.courseName}-${entry.rollNo}-${i}`}>
                                        <td>{entry.courseName}</td>
                                        <td>{entry.studentName}</td>
                                        <td>{entry.rollNo}</td>
                                        <td>
                                            <span className={`db-course-status ${entry.status === "Completed" ? "db-status--done" : "db-status--progress"}`}>
                                                {entry.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </main>
        </>
    );
}
