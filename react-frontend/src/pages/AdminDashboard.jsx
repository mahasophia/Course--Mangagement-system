import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import PageCss from "../components/PageCss";
import { deleteCourseOnAPI, getCoursesFromAPI } from "../data/coursesStore";
import { clearAllEnrollments, getAllEnrollments } from "../data/enrollmentsStore";
import api, { apiErrorMessage } from "../services/api";

export default function AdminDashboard() {
    const [courses, setCourses] = useState([]);
    const [courseRequests, setCourseRequests] = useState([]);

    // Read every student's enrollments (admin view isn't scoped to one student)
    const [enrollments, setEnrollments] = useState([]);

    useEffect(() => {
        let cancelled = false;
        getAllEnrollments()
            .then((list) => { if (!cancelled) setEnrollments(list); })
            .catch((error) => console.error("Could not load enrollments:", apiErrorMessage(error)));
        return () => { cancelled = true; };
    }, []);

    // Courses come from MongoDB through the backend.
    useEffect(() => {
        let cancelled = false;
        getCoursesFromAPI()
            .then((list) => { if (!cancelled) setCourses(list); })
            .catch((error) => console.error("Could not load courses:", apiErrorMessage(error)));
        return () => { cancelled = true; };
    }, []);


    useEffect(() => {
        let cancelled = false;
        api.get("/course-requests")
            .then((response) => { if (!cancelled) setCourseRequests(response.data.data || []); })
            .catch((error) => console.error("Could not load course requests:", apiErrorMessage(error)));
        return () => { cancelled = true; };
    }, []);

    async function reviewRequest(id, status) {
        const note = status === "Rejected" ? (window.prompt("Optional reason for rejection:") || "") : "";
        try {
            await api.patch(`/course-requests/${id}/review`, { status, adminNote: note });
            const response = await api.get("/course-requests");
            setCourseRequests(response.data.data || []);
            if (status === "Approved") {
                const updatedCourses = await getCoursesFromAPI();
                setCourses(updatedCourses);
                alert("Request approved. The course is now added to the catalog.");
            } else {
                alert("Course request rejected.");
            }
        } catch (error) { alert(apiErrorMessage(error)); }
    }

    const totalEnrolled = enrollments.length;
    const totalCompleted = enrollments.filter((entry) => entry.status === "Completed").length;
    const progressPct = totalEnrolled > 0 ? Math.round((totalCompleted / totalEnrolled) * 100) : 0;

    async function handleClearAll() {
        if (!window.confirm("Clear all enrollment records? This cannot be undone.")) return;
        try {
            await clearAllEnrollments();
            setEnrollments([]);
        } catch (error) {
            alert(apiErrorMessage(error));
        }
    }

    async function handleDeleteCourse(id, title) {
        if (!window.confirm(`Delete "${title}"? This cannot be undone.`)) return;
        try {
            await deleteCourseOnAPI(id);
            setCourses((previous) => previous.filter((course) => course.id !== id));
            // Enrollments for the deleted course are removed by the backend too.
            setEnrollments((previous) => previous.filter((entry) => entry.courseId !== id));
        } catch (error) {
            alert(apiErrorMessage(error));
        }
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

                <div className="admin-table-wrap" style={{marginTop: "30px"}}>
                    <div className="admin-table-header">
                        <h2>Student Course Requests ({courseRequests.filter((item) => item.status === "Pending").length} pending)</h2>
                    </div>
                    <table className="admin-table">
                        <thead><tr><th>Course</th><th>Code</th><th>Requested By</th><th>Category</th><th>Level</th><th>Status</th><th>Action</th></tr></thead>
                        <tbody>
                            {courseRequests.length === 0 ? (
                                <tr><td colSpan="7" style={{textAlign: "center", padding: "24px"}}>No student course requests yet.</td></tr>
                            ) : courseRequests.map((request) => (
                                <tr key={request._id}>
                                    <td>{request.courseName}</td><td>{request.courseCode}</td>
                                    <td>{request.student?.name || request.student?.email || "Student"}<br/><small>{request.student?.email}</small></td>
                                    <td>{request.category}</td><td>{request.level}</td><td>{request.status}</td>
                                    <td style={{whiteSpace: "nowrap"}}>
                                        {request.status === "Pending" ? <>
                                            <button type="button" onClick={() => reviewRequest(request._id, "Approved")} style={{marginRight: "8px", color: "#15803d", cursor: "pointer"}}>Approve</button>
                                            <button type="button" onClick={() => reviewRequest(request._id, "Rejected")} style={{color: "#dc2626", cursor: "pointer"}}>Reject</button>
                                        </> : "Reviewed"}
                                    </td>
                                </tr>
                            ))}
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
