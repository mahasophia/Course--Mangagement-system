import PageShell from "../components/PageShell";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import PageCss from "../components/PageCss";
import { useAuth } from "../auth/AuthContext";
import { getCourseById } from "../data/coursesStore";
import { findEnrollment, markEnrollmentComplete } from "../data/enrollmentsStore";

export default function LearnCourse() {
    const { student } = useAuth();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const courseId = searchParams.get("course");

    const course = getCourseById(courseId);
    const enrollment = course ? findEnrollment(course.id, course.title, student) : null;
    const isCompleted = enrollment?.status === "Completed";

    const topics = (course?.topics || "")
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);

    function handleMarkComplete() {
        if (!enrollment) return;
        const updated = markEnrollmentComplete(enrollment);
        if (updated?.certificateId) {
            navigate(`/certificate?id=${updated.certificateId}`);
        }
    }

    // ----- Guard states -----
    if (!course) {
        return (
            <PageShell variant="student3">
                <PageCss href="/css/course_details.css" />
                <div className="db-empty-state" style={{ margin: "60px auto" }}>
                    <div className="db-empty-icon">
                        <i className="fa-solid fa-circle-question"></i>
                    </div>
                    <h3>Course not found</h3>
                    <p>We couldn't find that course. It may have been removed by an admin.</p>
                    <Link to="/courses" className="db-empty-btn">Browse Courses</Link>
                </div>
            </PageShell>
        );
    }

    if (!student) {
        return (
            <PageShell variant="student3">
                <PageCss href="/css/course_details.css" />
                <div className="db-empty-state" style={{ margin: "60px auto" }}>
                    <div className="db-empty-icon">
                        <i className="fa-solid fa-lock"></i>
                    </div>
                    <h3>Please log in to continue</h3>
                    <p>Log in as a student to access "{course.title}".</p>
                    <Link to="/login" className="db-empty-btn">Log In</Link>
                </div>
            </PageShell>
        );
    }

    if (!enrollment) {
        return (
            <PageShell variant="student3">
                <PageCss href="/css/course_details.css" />
                <div className="db-empty-state" style={{ margin: "60px auto" }}>
                    <div className="db-empty-icon">
                        <i className="fa-solid fa-graduation-cap"></i>
                    </div>
                    <h3>You're not enrolled in this course yet</h3>
                    <p>Enroll in "{course.title}" from the Courses page to start learning.</p>
                    <Link to="/courses" className="db-empty-btn">Go to Courses</Link>
                </div>
            </PageShell>
        );
    }

    // ----- Main learning view -----
    return (
        <PageShell variant="student3">
            <PageCss href="/css/course_details.css" />
            <section className="course-page-hero">
                <Link to="/dashboard" className="course-back-link">
                    <i className="fa-solid fa-arrow-left"></i>
                    Back to Dashboard
                </Link>
                <span className="course-page-category">{course.category}</span>
                <h1>{course.title}</h1>
                <p>{course.instructor} &middot; {course.weeks} Weeks &middot; {course.hours} Hours</p>
            </section>

            <div className="course-page-grid">
                <div className="course-page-content">
                    {isCompleted && (
                        <div className="video-complete-card" style={{ marginBottom: "22px", background: "#f0fdf4", borderColor: "#bbf7d0" }}>
                            <div className="video-complete-left" style={{ color: "#15803d" }}>
                                <i className="fa-solid fa-circle-check"></i>
                                <span>You've completed this course. Great work!</span>
                            </div>
                        </div>
                    )}

                    <div className="course-overview-text">{course.outcome}</div>

                    <h2 className="course-section-title">
                        <i className="fa-solid fa-list-ol"></i>
                        Course Content
                    </h2>
                    {topics.length === 0 ? (
                        <p style={{ color: "var(--text-muted)" }}>No modules listed for this course yet.</p>
                    ) : (
                        <div className="unit-accordion">
                            {topics.map((topic, i) => (
                                <details className="c-details" key={topic} open={i === 0} style={{ marginBottom: "10px" }}>
                                    <summary className="view-details-btn">
                                        <i className="fa-solid fa-chevron-down"></i>
                                        Unit {i + 1}: {topic}
                                    </summary>
                                    <div className="c-details-body">
                                        <p>
                                            Work through the "{topic}" module at your own pace. When you've covered
                                            everything in this course, mark it complete below to unlock your certificate.
                                        </p>
                                    </div>
                                </details>
                            ))}
                        </div>
                    )}

                    <div className="video-complete-card" style={{ marginTop: "24px" }}>
                        <div className="video-complete-left">
                            <i className="fa-solid fa-flag-checkered"></i>
                            {isCompleted ? "Course completed" : "Finished everything above?"}
                        </div>
                        {isCompleted ? (
                            <Link
                                to={enrollment.certificateId ? `/certificate?id=${enrollment.certificateId}` : "/certificate"}
                                className="db-complete-btn"
                            >
                                <i className="fa-solid fa-certificate"></i> View Certificate
                            </Link>
                        ) : (
                            <button type="button" className="db-complete-btn" onClick={handleMarkComplete}>
                                <i className="fa-solid fa-check"></i> Mark Complete
                            </button>
                        )}
                    </div>
                </div>

                <aside className="course-sidebar">
                    <div className="course-info-card">
                        <h3>
                            <i className="fa-solid fa-circle-info"></i>
                            Course Details
                        </h3>
                        <div className="course-info-row">
                            <i className="fa-regular fa-clock"></i>
                            Duration
                            <strong>{course.weeks} Weeks</strong>
                        </div>
                        <div className="course-info-row">
                            <i className="fa-solid fa-signal"></i>
                            Level
                            <strong>{course.level}</strong>
                        </div>
                        <div className="course-info-row">
                            <i className="fa-solid fa-tag"></i>
                            Category
                            <strong>{course.category}</strong>
                        </div>
                        <div className="course-info-row">
                            <i className="fa-solid fa-user"></i>
                            Instructor
                            <strong>{course.instructor}</strong>
                        </div>
                    </div>
                    {topics.length > 0 && (
                        <div className="course-info-card">
                            <h3>
                                <i className="fa-solid fa-graduation-cap"></i>
                                What You'll Learn
                            </h3>
                            <ul className="course-topics-list">
                                {topics.map((topic) => (
                                    <li key={topic}>{topic}</li>
                                ))}
                            </ul>
                        </div>
                    )}
                </aside>
            </div>
        </PageShell>
    );
}
