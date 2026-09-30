import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import PageShell from "../components/PageShell";
import PageCss from "../components/PageCss";
import { addCourse } from "../data/coursesStore";
import { addCourseAddedNotification } from "../data/notificationsStore";

export default function AddCourse() {
    const navigate = useNavigate();

    const [form, setForm] = useState({
        title: "",
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

    function update(field, value) {
        setForm((prev) => ({ ...prev, [field]: value }));
    }

    function handleSubmit(e) {
        e.preventDefault();

        const required = [form.title, form.category, form.level, form.weeks, form.hours, form.instructor, form.topics, form.outcome];
        if (required.some((value) => !String(value).trim())) {
            setShowError(true);
            return;
        }
        setShowError(false);

        const newCourse = addCourse({
            title: form.title.trim(),
            category: form.category.trim(),
            level: form.level,
            weeks: form.weeks.trim(),
            hours: form.hours.trim(),
            rating: form.rating.trim() || "New",
            instructor: form.instructor.trim(),
            topics: form.topics.trim(),
            outcome: form.outcome.trim(),
        });

        // Notify every student that a new course just went live.
        addCourseAddedNotification(newCourse);

        navigate("/admin-dashboard");
    }

    return (
        <PageShell variant="admin">
            <PageCss href="/css/add_course.css" />
            <main className="admin-main admin-main-narrow">
                <Link to="/admin-dashboard" className="form-back-link">
                    <i className="fa-solid fa-arrow-left"></i>
                    Back to Dashboard
                </Link>
                <div className="admin-form-card">
                    <h1>Add New Course</h1>
                    <p className="admin-form-subtitle">Fill in the details below. New courses appear on the dashboard immediately.</p>
                    <p id="formError" className="auth-error" hidden={!showError}>
                        <i className="fa-solid fa-circle-exclamation"></i>
                        Please fill in all required fields.
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
                            <Link to="/admin-dashboard" className="secondary-form-btn">
                                Cancel
                            </Link>
                            <button type="submit" className="primary-btn">Save Course</button>
                        </div>
                    </form>
                </div>
            </main>
        </PageShell>
    );
}
