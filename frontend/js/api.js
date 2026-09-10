/* =========================================================================
   api.js — data layer
   Every read/write against localStorage lives here so the rest of the app
   never touches localStorage directly. Treat this as the "backend" for
   a project with no real server: swapping it for real HTTP calls later
   shouldn't require changes anywhere else.
========================================================================= */

import { DEFAULT_MODULES, genericUnits } from './course-content.js';

const KEYS = {
    newCourses: 'newCourses',
    deletedCourses: 'deletedCourses',
    courseEdit: id => 'course_' + id,
    modules: 'courseModules',
    enrollments: 'enrollments',
    notificationsRead: email => 'notificationsRead_' + email,
    unitProgress: (email, courseId) => 'unitProgress_' + email + '_' + courseId,
    videoProgress: (email, courseId) => 'videoProgress_' + email + '_' + courseId,
    registeredStudents: 'registeredStudents'
};

function readJSON(key, fallback) {
    try {
        const raw = localStorage.getItem(key);
        return raw ? JSON.parse(raw) : fallback;
    } catch (e) {
        return fallback;
    }
}

function writeJSON(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
}

// Turns free-typed category text into a URL/id-safe key, e.g.
// "Cloud Computing" -> "cloud-computing". Used to group admin-added
// courses into a matching section on courses.html.
export function slugify(text) {
    return (text || 'other').toString().trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'other';
}

/* =========================================================================
   REGISTERED STUDENTS (auth)
   The permanent "account" record created by stu-register.html — this is
   what a login is checked against. Kept separate from the *session*
   (see auth.js), which is temporary and cleared on logout: registering
   once should stick around, but being logged in shouldn't.
========================================================================= */

export function getRegisteredStudents() {
    return readJSON(KEYS.registeredStudents, []);
}

export function findRegisteredStudent(email) {
    const normalized = (email || '').trim().toLowerCase();
    return getRegisteredStudents().find(s => s.email.toLowerCase() === normalized) || null;
}

export function addRegisteredStudent(student) {
    const all = getRegisteredStudents();
    all.push(student);
    writeJSON(KEYS.registeredStudents, all);
    return student;
}

/* =========================================================================
   COURSE CATALOG
========================================================================= */

export const BASE_COURSES = [
    { id: "ai1", title: "Introduction to AI", category: "Artificial Intelligence", level: "Beginner", duration: "8 Weeks", rating: "4.8" },
    { id: "ai2", title: "Machine Perception", category: "Artificial Intelligence", level: "Intermediate", duration: "10 Weeks", rating: "4.7" },
    { id: "ai3", title: "AI for Healthcare", category: "Artificial Intelligence", level: "Advanced", duration: "12 Weeks", rating: "4.9" },
    { id: "ai4", title: "Reinforcement Learning", category: "Artificial Intelligence", level: "Advanced", duration: "14 Weeks", rating: "4.6" },
    { id: "ai5", title: "Generative AI", category: "Artificial Intelligence", level: "Intermediate", duration: "10 Weeks", rating: "4.9" },
    { id: "ml1", title: "ML Fundamentals", category: "Machine Learning", level: "Beginner", duration: "10 Weeks", rating: "4.8" },
    { id: "ml2", title: "Feature Engineering", category: "Machine Learning", level: "Intermediate", duration: "8 Weeks", rating: "4.6" },
    { id: "ml3", title: "Deep Learning with TensorFlow", category: "Machine Learning", level: "Advanced", duration: "14 Weeks", rating: "4.9" },
    { id: "ml4", title: "ML Deployment & MLOps", category: "Machine Learning", level: "Advanced", duration: "10 Weeks", rating: "4.7" }
];

export function getNewCourses() {
    return readJSON(KEYS.newCourses, []);
}

export function addNewCourse(course) {
    const all = getNewCourses();
    all.push(course);
    writeJSON(KEYS.newCourses, all);
    return course;
}

export function removeNewCourse(id) {
    writeJSON(KEYS.newCourses, getNewCourses().filter(c => c.id !== id));
}

export function getDeletedCourseIds() {
    return readJSON(KEYS.deletedCourses, []);
}

export function markCourseDeleted(id) {
    const deleted = getDeletedCourseIds();
    if (!deleted.includes(id)) {
        deleted.push(id);
        writeJSON(KEYS.deletedCourses, deleted);
    }
}

export function getCourseEdits(id) {
    return readJSON(KEYS.courseEdit(id), null);
}

export function saveCourseEdits(id, edits) {
    writeJSON(KEYS.courseEdit(id), edits);
}

export function clearCourseEdits(id) {
    localStorage.removeItem(KEYS.courseEdit(id));
}

// Full public catalog: base + admin-added, minus deleted, with any saved
// admin edits merged in. Used by courses.html / admin-dashboard.html.
export function getAllCourses() {
    const deleted = getDeletedCourseIds();
    return [...BASE_COURSES, ...getNewCourses()]
        .filter(c => !deleted.includes(c.id))
        .map(c => {
            const edits = getCourseEdits(c.id);
            return edits ? { ...c, ...edits } : c;
        });
}

export function getCourseById(id) {
    return getAllCourses().find(c => c.id === id) || null;
}

/* =========================================================================
   COURSE MODULES (unit/video content shown on course.html)
========================================================================= */

function getAllModules() {
    return readJSON(KEYS.modules, {});
}

function saveAllModules(all) {
    writeJSON(KEYS.modules, all);
}

// Known courses (anything in DEFAULT_MODULES) always resolve to the LIVE
// definition in course-content.js — never a cached copy — so editing that
// file always shows up immediately, with no stale localStorage snapshot.
// Admin-added courses that aren't in DEFAULT_MODULES get a generic module
// generated once and cached, since there's no static default for those.
export function ensureCourseModule(courseId, newCourseTypeHint) {
    if (DEFAULT_MODULES[courseId]) return DEFAULT_MODULES[courseId];

    const all = getAllModules();
    if (all[courseId]) return all[courseId];

    let module;
    if (newCourseTypeHint === 'video') {
        module = {
            type: 'video',
            videoSrc: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4',
            overview: 'A course overview will be added here soon.',
            topics: []
        };
    } else {
        module = {
            type: 'content',
            overview: 'A course overview will be added here soon.',
            topics: [],
            units: genericUnits()
        };
    }

    all[courseId] = module;
    saveAllModules(all);
    return module;
}

export function getCourseModule(courseId) {
    return ensureCourseModule(courseId);
}

// Called when a course is deleted in the admin dashboard, so no orphaned
// content/progress data is left behind in localStorage.
export function removeCourseModule(courseId) {
    const all = getAllModules();
    if (all[courseId]) {
        delete all[courseId];
        saveAllModules(all);
    }

    // Progress keys are scoped per-student (unitProgress_<email>_<courseId>),
    // so sweep localStorage for any key ending in this course's id rather
    // than guessing at a single un-scoped key.
    const suffix = '_' + courseId;
    Object.keys(localStorage).forEach(key => {
        if ((key.startsWith('unitProgress_') || key.startsWith('videoProgress_')) && key.endsWith(suffix)) {
            localStorage.removeItem(key);
        }
    });
}

/* =========================================================================
   ENROLLMENTS
========================================================================= */

export function getAllEnrollments() {
    return readJSON(KEYS.enrollments, []);
}

function saveAllEnrollments(all) {
    writeJSON(KEYS.enrollments, all);
}

export function getStudentEnrollments(email) {
    return getAllEnrollments().filter(en => en.email === email);
}

// Merges this student's (possibly updated) records back into the full
// shared list, leaving every other student's enrollments untouched.
export function saveStudentEnrollments(email, thisStudentsList) {
    const others = getAllEnrollments().filter(en => en.email !== email);
    saveAllEnrollments([...others, ...thisStudentsList]);
}

export function isEnrolled(courseId, email) {
    return getAllEnrollments().some(en => en.courseId === courseId && en.email === email);
}

export function addEnrollment(record) {
    const all = getAllEnrollments();
    all.push(record);
    saveAllEnrollments(all);
    return record;
}

export function clearAllEnrollments() {
    localStorage.removeItem(KEYS.enrollments);
}

// Keeps an enrollment's status in sync with real progress. Only ever
// touches this student's own record for this course — otherwise one
// student finishing a course would flip the status for every other
// student enrolled in it too.
export function syncEnrollmentStatus(courseId, email, isComplete) {
    const all = getAllEnrollments();
    const newStatus = isComplete ? 'completed' : 'in-progress';
    let changed = false;
    all.forEach(en => {
        if (en.courseId === courseId && en.email === email && en.status !== newStatus) {
            en.status = newStatus;
            if (isComplete && !en.completedDate) en.completedDate = new Date().toISOString();
            changed = true;
        }
    });
    if (changed) saveAllEnrollments(all);
}

/* =========================================================================
   PROGRESS TRACKING
   Scoped per-student (by email), not just by courseId — otherwise one
   student's completed progress would leak into every other student's
   view of the same course, since localStorage is shared browser-wide.
========================================================================= */

export function getUnitProgress(email, courseId, totalUnits) {
    const arr = readJSON(KEYS.unitProgress(email, courseId), null);
    if (Array.isArray(arr) && arr.length === totalUnits) return arr;
    return new Array(totalUnits).fill(false);
}

export function saveUnitProgress(email, courseId, arr) {
    writeJSON(KEYS.unitProgress(email, courseId), arr);
}

export function getVideoProgress(email, courseId) {
    return localStorage.getItem(KEYS.videoProgress(email, courseId)) === 'true';
}

export function saveVideoProgress(email, courseId, isDone) {
    localStorage.setItem(KEYS.videoProgress(email, courseId), isDone ? 'true' : 'false');
}

// Works for any course, known or newly-added, using the dynamic module.
export function getCourseProgressPercent(email, courseId) {
    const module = getCourseModule(courseId);
    if (module.type === 'video') {
        return getVideoProgress(email, courseId) ? 100 : 0;
    }
    const total = module.units ? module.units.length : 0;
    if (total === 0) return 0;
    const arr = getUnitProgress(email, courseId, total);
    return Math.round((arr.filter(Boolean).length / total) * 100);
}

/* =========================================================================
   NOTIFICATIONS READ STATE
========================================================================= */

export function getReadNotificationIds(email) {
    return readJSON(KEYS.notificationsRead(email), []);
}

export function saveReadNotificationIds(email, ids) {
    writeJSON(KEYS.notificationsRead(email), ids);
}