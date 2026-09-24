// Shared notifications feed, persisted in localStorage under the
// "notifications" key.
//
// A notification can be a broadcast (audienceEmail === null, shown to
// every logged-in student — e.g. "a new course was added") or targeted
// at a single student (audienceEmail === their email — e.g. "you enrolled
// in X" or "you completed X").
//
// Read state is tracked per-student in a separate key
// ("notificationReads:<email>") holding the list of notification ids that
// student has already seen, so marking one student's notifications as
// read never affects anyone else.

const STORAGE_KEY = "notifications";
const READS_KEY_PREFIX = "notificationReads:";

function readRaw() {
    try {
        const list = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
        return Array.isArray(list) ? list : [];
    } catch {
        return [];
    }
}

function writeRaw(list) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

function readsKey(email) {
    return `${READS_KEY_PREFIX}${(email || "guest").toLowerCase()}`;
}

function getReadIds(email) {
    try {
        const list = JSON.parse(localStorage.getItem(readsKey(email)) || "[]");
        return new Set(Array.isArray(list) ? list : []);
    } catch {
        return new Set();
    }
}

function makeId() {
    return `n_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

function addNotification(notification) {
    const list = readRaw();
    const entry = {
        id: makeId(),
        createdAt: new Date().toISOString(),
        audienceEmail: null,
        ...notification,
    };
    writeRaw([entry, ...list]);
    return entry;
}

/** Broadcast notification shown to every student: a new course went live. */
export function addCourseAddedNotification(course) {
    return addNotification({
        type: "course_added",
        icon: "fa-solid fa-book-open",
        title: "New Course Added",
        message: `"${course.title}" is now available in ${course.category || "the catalog"}. Check it out!`,
        courseId: course.id,
        courseName: course.title,
        link: "/courses",
        audienceEmail: null,
    });
}

/** Targeted notification: a specific student just enrolled in a course. */
export function addEnrollmentNotification({ courseName, email }) {
    return addNotification({
        type: "enrollment",
        icon: "fa-solid fa-graduation-cap",
        title: "Enrollment Confirmed",
        message: `You're enrolled in "${courseName}". Head to your dashboard to start learning.`,
        courseName,
        link: "/dashboard",
        audienceEmail: (email || "").toLowerCase() || null,
    });
}

/** Targeted notification: a specific student finished a course and earned a certificate. */
export function addCourseCompletedNotification({ courseName, email, certId }) {
    return addNotification({
        type: "completed",
        icon: "fa-solid fa-certificate",
        title: "Course Completed \uD83C\uDF89",
        message: `You completed "${courseName}". Your certificate is ready to view and download.`,
        courseName,
        link: certId ? `/certificate?id=${certId}` : "/dashboard",
        audienceEmail: (email || "").toLowerCase() || null,
    });
}

/**
 * Returns every notification visible to this student (broadcasts + ones
 * addressed to their email), newest first, each annotated with `read`.
 */
export function getNotificationsForUser(email) {
    const normalizedEmail = (email || "").toLowerCase();
    const readIds = getReadIds(normalizedEmail);
    return readRaw()
        .filter((n) => !n.audienceEmail || n.audienceEmail === normalizedEmail)
        .map((n) => ({ ...n, read: readIds.has(n.id) }))
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

export function getUnreadCount(email) {
    return getNotificationsForUser(email).filter((n) => !n.read).length;
}

export function markNotificationRead(email, id) {
    const readIds = getReadIds(email);
    readIds.add(id);
    localStorage.setItem(readsKey(email), JSON.stringify(Array.from(readIds)));
}

export function markAllNotificationsRead(email) {
    const all = getNotificationsForUser(email).map((n) => n.id);
    localStorage.setItem(readsKey(email), JSON.stringify(all));
}
