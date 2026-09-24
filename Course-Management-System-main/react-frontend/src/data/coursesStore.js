// Shared course catalog, persisted in localStorage under the "courses" key.
//
// Every page that reads or writes courses (Courses.jsx, AddCourse.jsx,
// EditCourse.jsx, AdminDashboard.jsx) goes through this module so that
// adding or editing a course in one place is immediately visible
// everywhere else.

const STORAGE_KEY = "courses";

// Section/category is now free text typed by the admin (not a fixed
// dropdown), so a brand-new category can be created just by typing it on
// the Add/Edit Course form. This table only supplies a nicer icon + short
// tag for categories we recognize by name; anything else falls back to a
// generic icon and an auto-generated tag (see getSectionMeta below).
const KNOWN_SECTION_META = [
    { match: "artificial intelligence", tag: "AI", icon: "fa-solid fa-robot" },
    { match: "machine learning", tag: "ML", icon: "fa-solid fa-brain" },
    { match: "data science", tag: "DS", icon: "fa-solid fa-chart-simple" },
    { match: "natural language processing", tag: "NLP", icon: "fa-solid fa-comments" },
];
const DEFAULT_SECTION_ICON = "fa-solid fa-layer-group";

/** Builds display metadata (label, short tag, icon) for a category name. */
export function getSectionMeta(category) {
    const label = (category || "").trim() || "Uncategorized";
    const known = KNOWN_SECTION_META.find((s) => s.match === label.toLowerCase());
    if (known) return { label, tag: known.tag, icon: known.icon };

    const tag = label
        .split(/\s+/)
        .filter(Boolean)
        .map((word) => word[0])
        .join("")
        .slice(0, 4)
        .toUpperCase() || "GEN";
    return { label, tag, icon: DEFAULT_SECTION_ICON };
}

/**
 * Returns the distinct categories present across the given courses, each
 * with display metadata, in the order they first appear. New categories
 * typed into Add/Edit Course show up here automatically — nothing needs
 * to be predefined.
 */
export function getSections(courses) {
    const seen = new Map();
    for (const course of courses) {
        const key = (course.category || "Uncategorized").trim().toLowerCase();
        if (!seen.has(key)) seen.set(key, getSectionMeta(course.category));
    }
    return Array.from(seen.values());
}

// The catalog the app originally shipped with (previously hardcoded
// directly inside Courses.jsx). Used to seed localStorage the first time
// the app runs so existing students still see the same starter courses.
const DEFAULT_COURSES = [
    { id: "ai1", title: "Introduction to AI", category: "Artificial Intelligence", level: "Beginner", weeks: "8", hours: "40", rating: "4.8", instructor: "Dr. Alan Turing", topics: "History of AI, Search Algorithms, Knowledge Representation, Expert Systems", outcome: "Understand the foundations of AI and build simple intelligent agents." },
    { id: "ai2", title: "Machine Perception", category: "Artificial Intelligence", level: "Intermediate", weeks: "10", hours: "50", rating: "4.7", instructor: "Prof. Yann LeCun", topics: "Computer Vision Basics, Image Processing, Object Detection, CNNs", outcome: "Build systems that perceive and interpret visual data." },
    { id: "ai3", title: "AI for Healthcare", category: "Artificial Intelligence", level: "Advanced", weeks: "12", hours: "60", rating: "4.9", instructor: "Dr. Eric Topol", topics: "Medical Imaging, Diagnostics, Drug Discovery, Ethics in Healthcare AI", outcome: "Apply AI techniques to solve real-world healthcare problems." },
    { id: "ai4", title: "Reinforcement Learning", category: "Artificial Intelligence", level: "Advanced", weeks: "14", hours: "70", rating: "4.6", instructor: "Prof. David Silver", topics: "Q-Learning, Policy Gradients, Deep RL, OpenAI Gym", outcome: "Build agents that learn to make decisions through trial and reward." },
    { id: "ai5", title: "Generative AI", category: "Artificial Intelligence", level: "Intermediate", weeks: "10", hours: "50", rating: "4.9", instructor: "Dr. Ian Goodfellow", topics: "GANs, VAEs, Diffusion Models, Prompt Engineering, LLMs", outcome: "Create generative models that produce text, images, and more." },
    { id: "ml1", title: "ML Fundamentals", category: "Machine Learning", level: "Beginner", weeks: "10", hours: "50", rating: "4.8", instructor: "Dr. Andrew Ng", topics: "Supervised Learning, Regression, Classification, Model Evaluation", outcome: "Understand core ML algorithms and apply them to datasets." },
    { id: "ml2", title: "Feature Engineering", category: "Machine Learning", level: "Intermediate", weeks: "8", hours: "40", rating: "4.6", instructor: "Dr. Kaggle Team", topics: "Data Cleaning, Encoding, Scaling, Dimensionality Reduction", outcome: "Prepare and transform raw data to significantly boost model performance." },
    { id: "ml3", title: "Deep Learning with TensorFlow", category: "Machine Learning", level: "Advanced", weeks: "14", hours: "70", rating: "4.9", instructor: "Dr. Jeff Dean", topics: "Neural Networks, CNNs, RNNs, Transfer Learning, TensorFlow 2.x", outcome: "Design and train deep neural networks for real-world problems." },
    { id: "ml4", title: "ML Deployment & MLOps", category: "Machine Learning", level: "Advanced", weeks: "10", hours: "50", rating: "4.7", instructor: "Prof. Chip Huyen", topics: "Docker, FastAPI, CI/CD for ML, Monitoring, Model Drift", outcome: "Deploy and maintain ML models in production environments." },
];

function readRaw() {
    try {
        return JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
    } catch {
        return null;
    }
}

function writeRaw(list) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

/** Returns the full course list, seeding localStorage with the defaults the first time it's called. */
export function getCourses() {
    let list = readRaw();
    if (!Array.isArray(list)) {
        list = DEFAULT_COURSES;
        writeRaw(list);
    }
    return list;
}

export function getCourseById(id) {
    return getCourses().find((c) => c.id === id) || null;
}

function makeId(title) {
    const slug = (title || "course")
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
    return `${slug || "course"}-${Date.now().toString(36)}`;
}

/** Adds a new course and returns it (with a generated id). */
export function addCourse(course) {
    const list = getCourses();
    const newCourse = { ...course, id: makeId(course.title) };
    const updated = [...list, newCourse];
    writeRaw(updated);
    return newCourse;
}

/** Updates an existing course by id. Returns the updated course, or null if not found. */
export function updateCourse(id, updates) {
    const list = getCourses();
    let updatedCourse = null;
    const next = list.map((c) => {
        if (c.id !== id) return c;
        updatedCourse = { ...c, ...updates, id: c.id };
        return updatedCourse;
    });
    if (updatedCourse) writeRaw(next);
    return updatedCourse;
}

/** Removes a course by id. */
export function deleteCourse(id) {
    const list = getCourses();
    writeRaw(list.filter((c) => c.id !== id));
}
