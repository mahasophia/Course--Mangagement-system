import { useState } from "react";
import PageShell from "../components/PageShell";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import PageCss from "../components/PageCss";
import { deleteCourse, getCourseById, updateCourse } from "../data/coursesStore";

function loadInitialCourse(courseId) {
    if (!courseId) return null;
    return getCourseById(courseId);
}

export default function EditCourse() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const courseId = searchParams.get("course");

    const [initialCourse] = useState(() => loadInitialCourse(courseId));
    const notFound = !initialCourse;

    const [form, setForm] = useState({
        title: initialCourse?.title || "",
        instructor: initialCourse?.instructor || "",
        weeks: initialCourse?.weeks || "",
        hours: initialCourse?.hours || "",
        rating: initialCourse?.rating || "",
        level: initialCourse?.level || "Beginner",
        category: initialCourse?.category || "",
        image: initialCourse?.image || "",
        topics: initialCourse?.topics || "",
        prerequisites: initialCourse?.prerequisites || "",
    });
    const [learnItems, setLearnItems] = useState(() =>
        Array.isArray(initialCourse?.learnItems) && initialCourse.learnItems.length > 0
            ? initialCourse.learnItems
            : initialCourse?.outcome
                ? [initialCourse.outcome]
                : []
    );
    const [newLearnItem, setNewLearnItem] = useState("");

    function update(field, value) {
        setForm((prev) => ({ ...prev, [field]: value }));
    }

    function handleAddLearnItem() {
        const text = newLearnItem.trim();
        if (!text) return;
        setLearnItems((prev) => [...prev, text]);
        setNewLearnItem("");
    }

    function handleRemoveLearnItem(index) {
        setLearnItems((prev) => prev.filter((_, i) => i !== index));
    }

    function handleSubmit(e) {
        e.preventDefault();
        if (!courseId) return;

        updateCourse(courseId, {
            title: form.title.trim(),
            instructor: form.instructor.trim(),
            weeks: form.weeks.trim(),
            hours: form.hours.trim(),
            rating: form.rating.trim(),
            level: form.level,
            category: form.category.trim(),
            image: form.image.trim(),
            topics: form.topics.trim(),
            prerequisites: form.prerequisites.trim(),
            learnItems,
            outcome: learnItems[0] || "",
        });

        navigate("/courses");
    }

    function handleDelete() {
        if (!courseId) return;
        if (!window.confirm("Delete this course? This cannot be undone.")) return;
        deleteCourse(courseId);
        navigate("/courses");
    }

    if (notFound) {
        return (
            <PageShell variant="admin">
                <PageCss href="/css/edit_courses.css" />
                <div className="ec-page-header">
                    <h1>Course not found</h1>
                    <p>We couldn't find that course. It may have been removed.</p>
                    <Link to="/courses" className="ec-cancel-btn">Back to Courses</Link>
                </div>
            </PageShell>
        );
    }

    return (
        <PageShell variant="admin">
            <PageCss href="/css/edit_courses.css" />
            {/* ================= PAGE HEADER ================= */}
            <div className="ec-page-header">
                <div className="ec-breadcrumb">
                    <Link to="/courses">
                        <i className="fa-solid fa-arrow-left"></i>
                        Back to Courses
                    </Link>
                </div>
                <h1 id="ecPageTitle">Edit Course</h1>
                <p id="ecPageSubtitle">Update the details for this course.</p>
            </div>
            {/* ================= EDIT FORM ================= */}
            <main className="ec-main">
                <form className="ec-form" id="editCourseForm" onSubmit={handleSubmit}>
                    {/* ===== BASIC INFO ===== */}
                    <div className="ec-section">
                        <h2>
                            <i className="fa-solid fa-circle-info"></i>
                            Basic Information
                        </h2>
                        <div className="ec-grid-2">
                            <div className="ec-field">
                                <label htmlFor="ecTitle">Course Title</label>
                                <input
                                    type="text"
                                    id="ecTitle"
                                    placeholder="e.g. Introduction to AI"
                                    value={form.title}
                                    onChange={(e) => update("title", e.target.value)}
                                />
                            </div>
                            <div className="ec-field">
                                <label htmlFor="ecInstructor">Instructor Name</label>
                                <input
                                    type="text"
                                    id="ecInstructor"
                                    placeholder="e.g. Dr. Alan Turing"
                                    value={form.instructor}
                                    onChange={(e) => update("instructor", e.target.value)}
                                />
                            </div>
                            <div className="ec-field">
                                <label htmlFor="ecWeeks">Duration (Weeks)</label>
                                <input
                                    type="number"
                                    id="ecWeeks"
                                    min="1"
                                    placeholder="e.g. 8"
                                    value={form.weeks}
                                    onChange={(e) => update("weeks", e.target.value)}
                                />
                            </div>
                            <div className="ec-field">
                                <label htmlFor="ecHours">Total Hours</label>
                                <input
                                    type="number"
                                    id="ecHours"
                                    min="1"
                                    placeholder="e.g. 40"
                                    value={form.hours}
                                    onChange={(e) => update("hours", e.target.value)}
                                />
                            </div>
                            <div className="ec-field">
                                <label htmlFor="ecRating">Rating</label>
                                <input
                                    type="text"
                                    id="ecRating"
                                    placeholder="e.g. 4.8"
                                    value={form.rating}
                                    onChange={(e) => update("rating", e.target.value)}
                                />
                            </div>
                            <div className="ec-field">
                                <label htmlFor="ecLevel">Difficulty Level</label>
                                <select id="ecLevel" value={form.level} onChange={(e) => update("level", e.target.value)}>
                                    <option value="Beginner">Beginner</option>
                                    <option value="Intermediate">Intermediate</option>
                                    <option value="Advanced">Advanced</option>
                                </select>
                            </div>
                            <div className="ec-field">
                                <label htmlFor="ecSection">Section / Category</label>
                                <input
                                    type="text"
                                    id="ecSection"
                                    placeholder="e.g. Cybersecurity, Cloud Computing"
                                    value={form.category}
                                    onChange={(e) => update("category", e.target.value)}
                                />
                            </div>
                        </div>
                    </div>
                    {/* ===== COURSE IMAGE ===== */}
                    <div className="ec-section">
                        <h2>
                            <i className="fa-solid fa-image"></i>
                            Course Image
                        </h2>
                        <div className="ec-grid-2">
                            <div className="ec-field">
                                <label htmlFor="ecImage">Image URL</label>
                                <input
                                    type="text"
                                    id="ecImage"
                                    placeholder="https://..."
                                    value={form.image}
                                    onChange={(e) => update("image", e.target.value)}
                                />
                            </div>
                            <div className="ec-img-preview">
                                {form.image ? (
                                    <img id="ecImgPreview" src={form.image} alt="Preview" />
                                ) : (
                                    <span id="ecImgPlaceholder">
                                        <i className="fa-solid fa-image"></i>
                                        Preview
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                    {/* ===== WHAT YOU'LL LEARN ===== */}
                    <div className="ec-section">
                        <h2>
                            <i className="fa-solid fa-bullseye"></i>
                            What You'll Learn
                        </h2>
                        <div className="ec-learn-list" id="ecLearnList">
                            {learnItems.map((item, i) => (
                                <div key={i} className="form-group" style={{ display: "flex", gap: "8px", alignItems: "center", marginBottom: "8px" }}>
                                    <span style={{ flex: 1 }}>{item}</span>
                                    <button
                                        type="button"
                                        className="secondary-form-btn"
                                        onClick={() => handleRemoveLearnItem(i)}
                                    >
                                        Remove
                                    </button>
                                </div>
                            ))}
                        </div>
                        <div style={{ display: "flex", gap: "8px", marginBottom: "10px" }}>
                            <input
                                type="text"
                                placeholder="e.g. Build and train a neural network from scratch"
                                value={newLearnItem}
                                onChange={(e) => setNewLearnItem(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                        e.preventDefault();
                                        handleAddLearnItem();
                                    }
                                }}
                                style={{ flex: 1 }}
                            />
                        </div>
                        <button type="button" className="ec-add-btn" onClick={handleAddLearnItem}>
                            <i className="fa-solid fa-plus"></i>
                            Add Learning Outcome
                        </button>
                    </div>
                    {/* ===== TOPICS COVERED ===== */}
                    <div className="ec-section">
                        <h2>
                            <i className="fa-solid fa-list-check"></i>
                            Topics Covered
                        </h2>
                        <div className="ec-field">
                            <label htmlFor="ecTopics">
                                Topics
                                <span className="ec-hint">(comma separated)</span>
                            </label>
                            <input
                                type="text"
                                id="ecTopics"
                                placeholder="e.g. CNNs, RNNs, Transfer Learning"
                                value={form.topics}
                                onChange={(e) => update("topics", e.target.value)}
                            />
                        </div>
                    </div>
                    {/* ===== PREREQUISITES ===== */}
                    <div className="ec-section">
                        <h2>
                            <i className="fa-solid fa-circle-check"></i>
                            Prerequisites
                        </h2>
                        <div className="ec-field">
                            <label htmlFor="ecPrereqs">Prerequisites</label>
                            <textarea
                                id="ecPrereqs"
                                rows="2"
                                placeholder="e.g. Basic Python and high school mathematics required."
                                value={form.prerequisites}
                                onChange={(e) => update("prerequisites", e.target.value)}
                            ></textarea>
                        </div>
                    </div>
                    {/* ===== ACTIONS ===== */}
                    <div className="ec-actions">
                        <button type="submit" className="ec-save-btn">
                            <i className="fa-solid fa-floppy-disk"></i>
                            Save Changes
                        </button>
                        <Link to="/courses" className="ec-cancel-btn">
                            Cancel
                        </Link>
                        <button type="button" id="ecDeleteBtn" className="ec-delete-btn" onClick={handleDelete}>
                            <i className="fa-solid fa-trash"></i>
                            Delete Course
                        </button>
                    </div>
                </form>
            </main>
        </PageShell>
    );
}
