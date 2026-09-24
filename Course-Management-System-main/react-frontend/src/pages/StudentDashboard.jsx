import { useState } from "react";
import PageShell from "../components/PageShell";
import { Link, useNavigate } from "react-router-dom";
import PageCss from "../components/PageCss";
import { useAuth } from "../auth/AuthContext";
import { getEnrollmentsForStudent, markEnrollmentComplete } from "../data/enrollmentsStore";

export default function StudentDashboard() {
    const { student } = useAuth();
    const navigate = useNavigate();

    // Load this student's enrollments from localStorage (written by the
    // enroll modal on the Courses page) and keep them in state so marking a
    // course complete can update the UI immediately.
    const [enrollments, setEnrollments] = useState(() => getEnrollmentsForStudent(student));

    const inProgress = enrollments.filter((entry) => entry.status !== "Completed");
    const completed = enrollments.filter((entry) => entry.status === "Completed");
    const totalCount = enrollments.length;
    const completedCount = completed.length;
    const overallPct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

    function goToLearningPage(entry) {
        if (entry.courseId) navigate(`/learn?course=${entry.courseId}`);
    }

    function handleMarkComplete(e, target) {
        e.stopPropagation();
        const updated = markEnrollmentComplete(target);
        if (!updated) return;
        setEnrollments((prev) =>
            prev.map((entry) => (entry === target ? { ...entry, ...updated } : entry))
        );
    }

    return (
        <PageShell variant="student">
            <PageCss href="/css/student_dashboard.css" />
            {/* ================= DASHBOARD HEADER ================= */}
            <div className="db-header">
                <div className="db-header-inner">
                    <div className="db-welcome">
                        <div className="db-avatar">
                            <i className="fa-solid fa-user-graduate"></i>
                        </div>
                        <div>
                            <p className="db-greeting">Welcome back,</p>
                            <h1 className="db-name" id="studentNameHeading">
                                {student?.fullName || student?.username || "Student"}
                            </h1>
                            <p className="db-meta">
                                <i className="fa-solid fa-envelope"></i>
                                <span id="studentEmailMeta">{student?.email || "-"}</span>
                            </p>
                        </div>
                    </div>
                    <div style={{display: "flex", gap: "12px", flexWrap: "wrap"}}>
                        <Link to="/courses" className="db-explore-btn">
                            <i className="fa-solid fa-magnifying-glass"></i>
                            Explore Courses
                        </Link>
                    </div>
                </div>
            </div>
            {/* ================= MAIN CONTENT ================= */}
            <main className="db-main">
                {/* ===== OVERALL PROGRESS ===== */}
                <section className="db-section db-section--full" style={{marginBottom: "24px"}}>
                    <div className="db-section-header">
                        <h2>
                            <i className="fa-solid fa-bullseye"></i>
                            Overall Completion
                        </h2>
                    </div>
                    <div style={{display: "flex", alignItems: "center", gap: "28px", flexWrap: "wrap", padding: "6px 2px"}}>
                        <svg width="76" height="76" viewBox="0 0 76 76" style={{flexShrink: "0"}}>
                            <circle cx="38" cy="38" r="32" fill="none" stroke="var(--bg)" strokeWidth="8" />
                            <circle
                                cx="38" cy="38" r="32" fill="none" stroke="var(--accent)" strokeWidth="8"
                                strokeDasharray={2 * Math.PI * 32}
                                strokeDashoffset={2 * Math.PI * 32 * (1 - overallPct / 100)}
                                strokeLinecap="round"
                                transform="rotate(-90 38 38)"
                                style={{ transition: "stroke-dashoffset .3s ease" }}
                            />
                            <text x="38" y="43" textAnchor="middle" fontSize="16" fontWeight="600" fill="var(--navy)">{overallPct}%</text>
                        </svg>
                        <div style={{flex: "1", minWidth: "220px"}}>
                            <div className="course-progress-card" style={{marginBottom: "0"}}>
                                <div className="course-progress-card-top">
                                    <span>{completedCount} of {totalCount} courses completed</span>
                                    <small>{overallPct}%</small>
                                </div>
                                <div className="progress-track">
                                    <div className="progress-fill" style={{width: `${overallPct}%`}}></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
                {/* ===== STAT CARDS ===== */}
                <div className="db-stats-row">
                    <div className="db-stat-card">
                        <div className="db-stat-icon db-stat-icon--blue">
                            <i className="fa-solid fa-book-open"></i>
                        </div>
                        <div className="db-stat-info">
                            <span className="db-stat-label">Enrolled Courses</span>
                            <span className="db-stat-value">{totalCount}</span>
                        </div>
                    </div>
                    <div className="db-stat-card">
                        <div className="db-stat-icon db-stat-icon--green">
                            <i className="fa-solid fa-circle-check"></i>
                        </div>
                        <div className="db-stat-info">
                            <span className="db-stat-label">Completed</span>
                            <span className="db-stat-value">{completedCount}</span>
                        </div>
                    </div>
                    <div className="db-stat-card">
                        <div className="db-stat-icon db-stat-icon--amber">
                            <i className="fa-solid fa-spinner"></i>
                        </div>
                        <div className="db-stat-info">
                            <span className="db-stat-label">In Progress</span>
                            <span className="db-stat-value">{inProgress.length}</span>
                        </div>
                    </div>
                    <div className="db-stat-card">
                        <div className="db-stat-icon db-stat-icon--accent">
                            <i className="fa-solid fa-certificate"></i>
                        </div>
                        <div className="db-stat-info">
                            <span className="db-stat-label">Certificates</span>
                            <span className="db-stat-value">{completedCount}</span>
                        </div>
                    </div>
                </div>
                {/* ===== TWO COLUMN LAYOUT ===== */}
                <div className="db-grid">
                    {/* LEFT: Learning Progress */}
                    <section className="db-section">
                        <div className="db-section-header" style={{display: "flex", alignItems: "center", justifyContent: "space-between"}}>
                            <h2>
                                <i className="fa-solid fa-chart-line"></i>
                                Learning Progress
                            </h2>
                        </div>
                        {inProgress.length === 0 ? (
                            <div className="db-empty-state">
                                <div className="db-empty-icon">
                                    <i className="fa-solid fa-chart-line"></i>
                                </div>
                                <h3>Nothing in progress</h3>
                                <p>Enroll in a course to start tracking your progress here.</p>
                                <Link to="/courses" className="db-empty-btn">Browse Courses</Link>
                            </div>
                        ) : (
                            inProgress.map((entry, i) => (
                                <div
                                    className="db-course-item"
                                    key={`${entry.courseName}-${i}`}
                                    onClick={() => goToLearningPage(entry)}
                                    style={{ cursor: entry.courseId ? "pointer" : "default" }}
                                >
                                    <div className="db-course-item-left">
                                        <div className="db-course-item-icon">
                                            <i className="fa-solid fa-book-open"></i>
                                        </div>
                                        <div>
                                            <div className="db-course-item-name">{entry.courseName}</div>
                                            <div className="db-course-item-meta">
                                                <i className="fa-regular fa-clock"></i>
                                                Enrolled {entry.date}
                                            </div>
                                        </div>
                                    </div>
                                    <button type="button" className="db-complete-btn" onClick={(e) => handleMarkComplete(e, entry)}>
                                        <i className="fa-solid fa-check"></i> Mark Complete
                                    </button>
                                </div>
                            ))
                        )}
                    </section>
                    {/* RIGHT: My Courses */}
                    <section className="db-section">
                        <div className="db-section-header">
                            <h2>
                                <i className="fa-solid fa-book-open"></i>
                                My Courses
                            </h2>
                        </div>
                        {enrollments.length === 0 ? (
                            <div className="db-empty-state">
                                <div className="db-empty-icon">
                                    <i className="fa-solid fa-book-open"></i>
                                </div>
                                <h3>No courses yet</h3>
                                <p>You haven't enrolled in any courses yet.</p>
                                <Link to="/courses" className="db-empty-btn">Browse Courses</Link>
                            </div>
                        ) : (
                            enrollments.map((entry, i) => (
                                <div
                                    className="db-course-item"
                                    key={`${entry.courseName}-${i}`}
                                    onClick={() =>
                                        entry.status === "Completed"
                                            ? navigate(entry.certificateId ? `/certificate?id=${entry.certificateId}` : "/certificate")
                                            : goToLearningPage(entry)
                                    }
                                    style={{ cursor: "pointer" }}
                                >
                                    <div className="db-course-item-left">
                                        <div className={`db-course-item-icon ${entry.status === "Completed" ? "db-course-item-icon--done" : ""}`}>
                                            <i className={`fa-solid ${entry.status === "Completed" ? "fa-circle-check" : "fa-book-open"}`}></i>
                                        </div>
                                        <div>
                                            <div className="db-course-item-name">{entry.courseName}</div>
                                            <div className="db-course-item-meta">
                                                <i className="fa-regular fa-id-badge"></i>
                                                Roll No: {entry.rollNo}
                                            </div>
                                        </div>
                                    </div>
                                    <span className={`db-course-status ${entry.status === "Completed" ? "db-status--done" : "db-status--progress"}`}>
                                        {entry.status}
                                    </span>
                                </div>
                            ))
                        )}
                    </section>
                </div>
                {/* ===== COMPLETED COURSES ===== */}
                <section className="db-section db-section--full">
                    <div className="db-section-header">
                        <h2>
                            <i className="fa-solid fa-trophy"></i>
                            Completed Courses
                        </h2>
                    </div>
                    {completed.length === 0 ? (
                        <div className="db-empty-state">
                            <div className="db-empty-icon">
                                <i className="fa-solid fa-trophy"></i>
                            </div>
                            <h3>No completed courses yet</h3>
                            <p>Finish a course to see it here and unlock your certificate.</p>
                        </div>
                    ) : (
                        completed.map((entry, i) => (
                            <div className="db-course-item" key={`${entry.courseName}-${i}`}>
                                <div className="db-course-item-left">
                                    <div className="db-course-item-icon db-course-item-icon--done">
                                        <i className="fa-solid fa-circle-check"></i>
                                    </div>
                                    <div>
                                        <div className="db-course-item-name">{entry.courseName}</div>
                                        <div className="db-course-item-meta">
                                            <i className="fa-regular fa-id-badge"></i>
                                            Roll No: {entry.rollNo}
                                        </div>
                                    </div>
                                </div>
                                <Link
                                    to={entry.certificateId ? `/certificate?id=${entry.certificateId}` : "/certificate"}
                                    className="db-cert-badge"
                                >
                                    <i className="fa-solid fa-certificate"></i> View Certificate
                                </Link>
                            </div>
                        ))
                    )}
                </section>
            </main>
        </PageShell>
    );
}