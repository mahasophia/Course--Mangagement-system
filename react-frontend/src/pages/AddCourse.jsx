
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import PageShell from "../components/PageShell";
import PageCss from "../components/PageCss";
import api from "../services/api";
import { addCourseAddedNotification } from "../data/notificationsStore";

export default function AddCourse() {
    const navigate = useNavigate();
    const isStudent = sessionStorage.getItem("role") === "student";
    const backPath = isStudent ? "/dashboard" : "/admin-dashboard";

    const [form, setForm] = useState({
        title: "",
        courseCode: "",
        category: "",
        instructor: "",
        level: "Beginner",
        weeks: "",
        hours: "",
        rating: "",
        topics: "",
        outcome: "",
    });

    const [showError, setShowError] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [isSaving, setIsSaving] = useState(false);

    function update(field, value) {
        setForm((prev) => ({ ...prev, [field]: value }));
    }

    async function handleSubmit(e) {
        e.preventDefault();

        const required = [
            form.title,
            form.courseCode,
            form.category,
            form.level,
            form.weeks,
            form.hours,
            form.instructor,
            form.topics,
            form.outcome,
        ];

        if (required.some((value) => !String(value).trim())) {
            setShowError(true);
            setErrorMessage("Please fill in all required fields.");
            return;
        }

        setShowError(false);
        setErrorMessage("");
        setIsSaving(true);

        try {
            const courseData = {
                courseName: form.title.trim(),
                courseCode: form.courseCode.trim().toUpperCase(),
                instructor: form.instructor.trim(),
                duration: `${form.weeks.trim()} Weeks`,
                category: form.category.trim(),
                description: form.outcome.trim(),
                level: form.level,
                hours: form.hours.trim(),
                topics: form.topics.trim(),
                outcome: form.outcome.trim(),
                status: "Active",
            };

            if (isStudent) {
                const response = await api.post("/course-requests", courseData);
                alert(response.data.message || "Course request submitted successfully!");
                navigate("/dashboard");
            } else {
                const response = await api.post("/courses", courseData);
                const savedCourse = response.data.data;
                addCourseAddedNotification({ ...savedCourse, id: savedCourse._id, title: savedCourse.courseName });
                alert("Course added successfully!");
                navigate("/admin-dashboard");
            }
        } catch (error) {
            console.error("Add course error:", error);

            setShowError(true);
            setErrorMessage(
                error.response?.data?.message ||
                "Unable to save course. Please check the backend server."
            );
        } finally {
            setIsSaving(false);
        }
    }

    return (
        <PageShell variant={isStudent ? "student" : "admin"}>
            <PageCss href="/css/add_course.css" />

            <main className="admin-main admin-main-narrow">
                <Link to={backPath} className="form-back-link">
                    <i className="fa-solid fa-arrow-left"></i>
                    Back to Dashboard
                </Link>

                <div className="admin-form-card">
                    <h1>{isStudent ? "Request a New Course" : "Add New Course"}</h1>
                    <p className="admin-form-subtitle">
                        {isStudent ? "Submit your course idea. The admin will review and approve or reject your request." : "Fill in the details below. New courses appear on the dashboard immediately."}
                    </p>

                    <p id="formError" className="auth-error" hidden={!showError}>
                        <i className="fa-solid fa-circle-exclamation"></i>
                        {errorMessage}
                    </p>

                    <form id="addCourseForm" className="admin-form" onSubmit={handleSubmit}>
                        <div className="form-group form-group-full">
                            <label htmlFor="courseName">Course Name *</label>
                            <input
                                type="text"
                                id="courseName"
                                placeholder="e.g. Computer Vision Basics"
                                value={form.title}
                                onChange={(e) => update("title", e.target.value)}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="courseCode">Course Code *</label>
                            <input
                                type="text"
                                id="courseCode"
                                placeholder="e.g. CS101"
                                value={form.courseCode}
                                onChange={(e) => update("courseCode", e.target.value)}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="courseCategory">Section / Category *</label>
                            <input
                                type="text"
                                id="courseCategory"
                                placeholder="e.g. Cybersecurity, Cloud Computing"
                                value={form.category}
                                onChange={(e) => update("category", e.target.value)}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="courseLevel">Level *</label>
                            <select
                                id="courseLevel"
                                value={form.level}
                                onChange={(e) => update("level", e.target.value)}
                                required
                            >
                                <option value="Beginner">Beginner</option>
                                <option value="Intermediate">Intermediate</option>
                                <option value="Advanced">Advanced</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label htmlFor="courseWeeks">Duration (Weeks) *</label>
                            <input
                                type="number"
                                id="courseWeeks"
                                min="1"
                                placeholder="8"
                                value={form.weeks}
                                onChange={(e) => update("weeks", e.target.value)}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="courseHours">Total Hours *</label>
                            <input
                                type="number"
                                id="courseHours"
                                min="1"
                                placeholder="40"
                                value={form.hours}
                                onChange={(e) => update("hours", e.target.value)}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="courseInstructor">Instructor *</label>
                            <input
                                type="text"
                                id="courseInstructor"
                                placeholder="e.g. Dr. Jane Smith"
                                value={form.instructor}
                                onChange={(e) => update("instructor", e.target.value)}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="courseRating">Rating (out of 5)</label>
                            <input
                                type="number"
                                id="courseRating"
                                min="1"
                                max="5"
                                step="0.1"
                                placeholder="4.8"
                                value={form.rating}
                                onChange={(e) => update("rating", e.target.value)}
                            />
                        </div>

                        <div className="form-group form-group-full">
                            <label htmlFor="courseTopics">Topics Covered *</label>
                            <input
                                type="text"
                                id="courseTopics"
                                placeholder="Comma-separated, e.g. Topic A, Topic B, Topic C"
                                value={form.topics}
                                onChange={(e) => update("topics", e.target.value)}
                                required
                            />
                        </div>

                        <div className="form-group form-group-full">
                            <label htmlFor="courseOutcome">Learning Outcome *</label>
                            <textarea
                                id="courseOutcome"
                                rows="3"
                                placeholder="What will students be able to do after this course?"
                                value={form.outcome}
                                onChange={(e) => update("outcome", e.target.value)}
                                required
                            ></textarea>
                        </div>

                        <div className="form-actions form-group-full">
                            <Link to={backPath} className="secondary-form-btn">
                                Cancel
                            </Link>

                            <button
                                type="submit"
                                className="primary-btn"
                                disabled={isSaving}
                            >
                                {isSaving ? "Submitting..." : isStudent ? "Submit Course Request" : "Save Course"}
                            </button>
                        </div>
                    </form>
                </div>
            </main>
        </PageShell>
    );
}
