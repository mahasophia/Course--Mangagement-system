// Shared enrollment records, persisted in db.json (collection "enrollments")
// through the json-server mock API. Centralizing the read/write/status logic
// here means Courses.jsx (enroll), StudentDashboard.jsx (progress + mark
// complete), AdminDashboard.jsx and the Learn page all agree on exactly what
// "enrolled" / "in progress" / "completed" means for a given student.
//
// All network functions are async. The *In helpers work on an already-loaded
// list so pages can render synchronously from state.

import api from "../services/api";
import { addCertificate, getCertificateById } from "./certificatesStore";
import { addCourseCompletedNotification } from "./notificationsStore";

function normalize(value) {
    return (value || "").toString().trim().toLowerCase();
}

function studentIdentity(student) {
    return {
        email: normalize(student?.email),
        name: normalize(student?.fullName || student?.username),
    };
}

function isSameStudent(entry, student) {
    const { email, name } = studentIdentity(student);
    if (email && entry.email) return normalize(entry.email) === email;
    return normalize(entry.studentName) === name;
}

function isSameCourse(entry, courseId, courseTitle) {
    if (entry.courseId && courseId) return entry.courseId === courseId;
    return normalize(entry.courseName) === normalize(courseTitle);
}

/* ---------- pure helpers (work on a loaded list) ---------- */

export function filterForStudent(list, student) {
    return list.filter((entry) => isSameStudent(entry, student));
}

export function findEnrollmentIn(list, courseId, courseTitle, student) {
    return list.find((entry) => isSameCourse(entry, courseId, courseTitle) && isSameStudent(entry, student)) || null;
}

/* ---------- db.json-backed API ---------- */

export async function getAllEnrollments() {
    const { data } = await api.get("/enrollments");
    return Array.isArray(data) ? data : [];
}

export async function getEnrollmentsForStudent(student) {
    return filterForStudent(await getAllEnrollments(), student);
}

/** Finds this student's enrollment record for a given course, or null. */
export async function findEnrollment(courseId, courseTitle, student) {
    return findEnrollmentIn(await getAllEnrollments(), courseId, courseTitle, student);
}

export async function isAlreadyEnrolled(courseId, courseTitle, student) {
    return Boolean(await findEnrollment(courseId, courseTitle, student));
}

/** Records a new enrollment. Resolves to the created entry (with its db id). */
export async function addEnrollment({ courseId, courseName, studentName, rollNo, email }) {
    const { data } = await api.post("/enrollments", {
        courseId,
        courseName,
        studentName,
        rollNo,
        email: normalize(email) || "student@learnhub.com",
        status: "In Progress",
        date: new Date().toLocaleDateString(),
    });
    return data;
}

/**
 * Marks an enrollment complete, minting a certificate (or reusing one if
 * this got called twice) and firing a "course completed" notification.
 * `target` is an enrollment record as returned by this store (it has an id).
 * Resolves to the updated entry, or null if the record no longer exists.
 */
export async function markEnrollmentComplete(target) {
    if (target?.id == null) return null;

    let entry;
    try {
        ({ data: entry } = await api.get(`/enrollments/${target.id}`));
    } catch (error) {
        if (error?.response?.status === 404) return null;
        throw error;
    }

    let certRecord = entry.certificateId ? getCertificateById(entry.certificateId) : null;
    if (entry.status === "Completed" && certRecord) return entry; // already done

    if (!certRecord) {
        certRecord = addCertificate({
            courseId: entry.courseId,
            courseName: entry.courseName,
            studentName: entry.studentName,
            rollNo: entry.rollNo,
            email: entry.email,
        });
    }

    const { data: updated } = await api.patch(`/enrollments/${entry.id}`, {
        status: "Completed",
        certificateId: certRecord.id,
    });

    addCourseCompletedNotification({
        courseName: updated.courseName,
        email: updated.email,
        certId: updated.certificateId,
    });
    return updated;
}

export async function clearAllEnrollments() {
    const list = await getAllEnrollments();
    await Promise.all(list.map((entry) => api.delete(`/enrollments/${entry.id}`)));
}
