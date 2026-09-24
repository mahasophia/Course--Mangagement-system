import { useState } from "react";
import PageShell from "../components/PageShell";
import { Link, useNavigate } from "react-router-dom";
import PageCss from "../components/PageCss";
import { useAuth } from "../auth/AuthContext";
import { getCourses, getSections } from "../data/coursesStore";
import { addEnrollmentNotification } from "../data/notificationsStore";
import { addEnrollment, findEnrollment } from "../data/enrollmentsStore";

function normalize(value) {
    return (value || "").toString().trim().toLowerCase();
}

export default function Courses() {
    const { student } = useAuth();
    const navigate = useNavigate();

    const [courses] = useState(() => getCourses());

    // Bumped after every enroll purely to force a re-render, so the
    // Enroll/Start Learning/Completed buttons re-read localStorage and
    // reflect the new state immediately.
    const [, setEnrollmentVersion] = useState(0);

    // Modal states
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedCourse, setSelectedCourse] = useState(null);
    const [fullName, setFullName] = useState(student?.fullName || student?.username || "");
    const [rollNo, setRollNo] = useState("");
    const [isSuccessStep, setIsSuccessStep] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Returns "not-enrolled" | "in-progress" | "completed" for this course,
    // scoped to the logged-in student. enrollmentVersion is read (but
    // unused directly) purely to force this to recompute after an enroll.
    function getCourseStatus(course) {
        if (!student) return "not-enrolled";
        const entry = findEnrollment(course.id, course.title, student);
        if (!entry) return "not-enrolled";
        return entry.status === "Completed" ? "completed" : "in-progress";
    }

    function handleOpenModal(course) {
        if (!student) {
            alert("Please login first to enroll in a course.");
            navigate("/login");
            return;
        }
        if (getCourseStatus(course) !== "not-enrolled") {
            alert(`You're already enrolled in "${course.title}". Check your dashboard to continue learning.`);
            return;
        }
        setSelectedCourse(course);
        setIsSuccessStep(false);
        setErrorMessage("");
        setFullName(student?.fullName || student?.username || "");
        setRollNo("");
        setIsModalOpen(true);
    }

    function handleCloseModal() {
        setIsModalOpen(false);
    }

    function handleEnrollSubmit(e) {
        e.preventDefault();
        if (isSubmitting || !selectedCourse) return;

        if (!fullName.trim() || !rollNo.trim()) {
            setErrorMessage("Please fill in all required fields.");
            return;
        }

        // Guard against duplicate enrollment (e.g. submitted from another tab
        // while this modal was already open, or a double-click on Submit).
        if (findEnrollment(selectedCourse.id, selectedCourse.title, student)) {
            setErrorMessage(`You're already enrolled in "${selectedCourse.title}".`);
            return;
        }

        setIsSubmitting(true);

        const email = student?.email || "student@learnhub.com";
        addEnrollment({
            courseId: selectedCourse.id,
            courseName: selectedCourse.title,
            studentName: fullName,
            rollNo,
            email,
        });

        // Let the student know their enrollment went through — shows up on
        // the Notifications page (and the navbar bell badge).
        addEnrollmentNotification({ courseName: selectedCourse.title, email });

        setIsSubmitting(false);
        setEnrollmentVersion((v) => v + 1);
        // Switch modal view to success confirmation
        setIsSuccessStep(true);
    }

    const coursesBySection = getSections(courses).map((section) => ({
        ...section,
        courses: courses.filter((c) => normalize(c.category) === normalize(section.label)),
    }));

    return (
        <PageShell variant="student">
            <PageCss href="/css/courses.css" />

            {/* ================= PAGE HEADER ================= */}
            <section className="courses-hero">
                <h1>Explore Our Courses</h1>
                <p>Handpicked courses across the most in-demand tech domains — start learning today.</p>
                <div className="courses-search-box">
                    <i className="fa-solid fa-magnifying-glass"></i>
                    <input type="text" id="courseSearch" placeholder="Search courses..." />
                </div>
            </section>

            {/* ================= COURSES CONTENT ================= */}
            <main className="courses-main">
                {coursesBySection.map((section) => (
                    <section className="course-section" data-section={section.label} key={section.label}>
                        <div className="section-header">
                            <div className="section-title-group">
                                <div className="section-icon">
                                    <i className={section.icon}></i>
                                </div>
                                <div>
                                    <h2>
                                        {section.label}
                                        <span className="section-tag">{section.tag}</span>
                                    </h2>
                                    <p className="section-count">{section.courses.length} Courses</p>
                                </div>
                            </div>
                            <Link to="/add-course-edit" className="admin-section-btn">
                                <i className="fa-solid fa-plus"></i>
                                Add Course
                            </Link>
                        </div>
                        {section.courses.length === 0 ? (
                            <p style={{ color: "var(--text-muted)", padding: "12px 0" }}>No courses in this section yet.</p>
                        ) : (
                            <div className="courses-grid">
                                {section.courses.map((course) => {
                                    const status = getCourseStatus(course);
                                    return (
                                        <div className="c-card" key={course.id} data-id={course.id}>
                                            <div className="c-card-body">
                                                <span className={`c-badge ${course.level === "Intermediate" ? "c-badge-inter" : course.level === "Advanced" ? "c-badge-adv" : ""}`}>{course.level}</span>
                                                <h3>{course.title}</h3>
                                                <div className="c-duration">
                                                    <i className="fa-regular fa-clock"></i>
                                                    {course.weeks} Weeks
                                                </div>
                                                <div className="c-meta">
                                                    <span>
                                                        <i className="fa-solid fa-star"></i>
                                                        {course.rating}
                                                    </span>
                                                </div>
                                                <div className="c-card-actions">
                                                    {status === "not-enrolled" && (
                                                        <button type="button" className="enroll-btn" onClick={() => handleOpenModal(course)}>
                                                            <i className="fa-solid fa-graduation-cap"></i>
                                                            Enroll
                                                        </button>
                                                    )}
                                                    {status === "in-progress" && (
                                                        <Link to={`/learn?course=${course.id}`} className="enroll-btn">
                                                            <i className="fa-solid fa-play"></i>
                                                            Start Learning
                                                        </Link>
                                                    )}
                                                    {status === "completed" && (
                                                        <Link
                                                            to={`/learn?course=${course.id}`}
                                                            className="enroll-btn"
                                                            style={{ background: "#16a34a" }}
                                                        >
                                                            <i className="fa-solid fa-circle-check"></i>
                                                            Completed
                                                        </Link>
                                                    )}
                                                    <Link to={`/edit-course-login?course=${course.id}`} className="admin-edit-btn" title="Edit Course">
                                                        <i className="fa-solid fa-pen-to-square"></i>
                                                    </Link>
                                                </div>
                                                <details className="c-details">
                                                    <summary className="view-details-btn">
                                                        <i className="fa-solid fa-chevron-down"></i>
                                                        View Details
                                                    </summary>
                                                    <div className="c-details-body">
                                                        <p><strong>Instructor:</strong> {course.instructor}</p>
                                                        <p><strong>Duration:</strong> {course.weeks} Weeks · {course.hours} Hours</p>
                                                        <p><strong>Topics:</strong> {course.topics}</p>
                                                        <p><strong>Outcome:</strong> {course.outcome}</p>
                                                    </div>
                                                </details>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </section>
                ))}
            </main>

            {/* ================= ENROLLMENT MODAL ================= */}
            {isModalOpen && selectedCourse && (
                <div className="enroll-modal-overlay active">
                    <div className="enroll-modal">
                        <button type="button" className="enroll-modal-close" onClick={handleCloseModal} aria-label="Close">
                            <i className="fa-solid fa-xmark"></i>
                        </button>

                        {!isSuccessStep ? (
                            <div className="enroll-modal-step">
                                <div className="enroll-modal-icon">
                                    <i className="fa-solid fa-graduation-cap"></i>
                                </div>
                                <h2>Enroll in Course</h2>
                                <p className="enroll-modal-course-name">{selectedCourse.title}</p>

                                {errorMessage && (
                                    <p style={{ color: "red", fontSize: "13px", marginBottom: "10px", fontWeight: "bold" }}>
                                        {errorMessage}
                                    </p>
                                )}

                                <form onSubmit={handleEnrollSubmit}>
                                    <div className="form-group" style={{ marginBottom: "15px", textAlign: "left" }}>
                                        <label htmlFor="enrollStudentName">Full Name</label>
                                        <input
                                            type="text"
                                            id="enrollStudentName"
                                            value={fullName}
                                            onChange={(e) => setFullName(e.target.value)}
                                            placeholder="Enter your full name"
                                            required
                                            style={{ width: "100%", padding: "8px", marginTop: "5px" }}
                                        />
                                    </div>
                                    <div className="form-group" style={{ marginBottom: "15px", textAlign: "left" }}>
                                        <label htmlFor="enrollRollNo">Roll Number</label>
                                        <input
                                            type="text"
                                            id="enrollRollNo"
                                            value={rollNo}
                                            onChange={(e) => setRollNo(e.target.value)}
                                            placeholder="Enter your roll number"
                                            required
                                            style={{ width: "100%", padding: "8px", marginTop: "5px" }}
                                        />
                                    </div>
                                    <button type="submit" className="enroll-submit-btn" disabled={isSubmitting} style={{ width: "100%", padding: "10px", cursor: "pointer" }}>
                                        <i className="fa-solid fa-paper-plane"></i> Submit
                                    </button>
                                </form>
                            </div>
                        ) : (
                            <div className="enroll-modal-step">
                                <div className="enroll-modal-icon enroll-modal-icon-success">
                                    <i className="fa-solid fa-circle-check"></i>
                                </div>
                                <h2>Enrolled Successfully!</h2>
                                <p className="enroll-modal-success-text">
                                    Thanks, <span>{fullName}</span> — you're now enrolled in <strong>{selectedCourse.title}</strong>.
                                </p>
                                <div className="enroll-modal-actions" style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
                                    <button type="button" onClick={handleCloseModal} className="enroll-modal-btn enroll-modal-btn-primary" style={{ cursor: "pointer" }}>
                                        <i className="fa-solid fa-book"></i> Browse More
                                    </button>
                                    <Link to="/dashboard" onClick={handleCloseModal} className="enroll-modal-btn enroll-modal-btn-secondary">
                                        <i className="fa-solid fa-gauge"></i> View Dashboard
                                    </Link>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </PageShell>
    );
}
