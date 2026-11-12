// Shared enrollment records, stored in MongoDB through the Express backend
// (/api/v1/enrollments). Centralizing the read/write/status logic
// here means Courses.jsx (enroll), StudentDashboard.jsx (progress + mark
// complete), AdminDashboard.jsx and the Learn page all agree on exactly what
// "enrolled" / "in progress" / "completed" means for a given student.
//
// All network functions are async. The *In helpers work on an already-loaded
// list so pages can render synchronously from state.

import api from "../services/api";
import { addCertificate, getCertificatesForStudent } from "./certificatesStore";
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

/* ---------- MongoDB-backed API ---------- */

// Backend enrollment document -> the shape the pages use.
// Backend status values are "active" | "completed" | "withdrawn".
function mapEnrollment(entry) {
    const email = entry.student?.email || "";
    const courseId = entry.course?._id || entry.course || null;
    const certificate = getCertificatesForStudent(email).find((c) => c.courseId === courseId);

    return {
        ...entry,
        id: entry._id,
        courseId,
        courseName: entry.course?.courseName || "Unknown Course",
        studentName: entry.student?.name || "",
        email,
        status: entry.status === "completed" ? "Completed" : "In Progress",
        date: entry.enrolledAt ? new Date(entry.enrolledAt).toLocaleDateString() : "",
        certificateId: certificate?.id || null,
        rollNo: entry.rollNo || "Not available",
    };
}

export async function getAllEnrollments() {
    const { data } = await api.get("/enrollments");
    const records = Array.isArray(data.data) ? data.data : [];
    // Withdrawn enrollments are history, not active enrollments.
    return records.filter((entry) => entry.status !== "withdrawn").map(mapEnrollment);
}

// The backend already limits a student to their own enrollments.
export async function getEnrollmentsForStudent(student) {
    if (!student) return [];
    return await getAllEnrollments();
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
    const { data } = await api.post("/enrollments", { courseId, rollNo });
    return mapEnrollment({
        ...data.data,
        course: { _id: courseId, courseName },
        student: { name: studentName, email: normalize(email) },
    });
}

/**
 * Marks an enrollment complete, minting a certificate (or reusing the one this
 * browser already has for the course) and firing a "course completed"
 * notification. `target` is an enrollment as returned by this store.
 * Resolves to the updated entry, or null if the record no longer exists.
 */
export async function markEnrollmentComplete(target) {
    if (target?.id == null) return null;

    let entry;
    try {
        const { data } = await api.get(`/enrollments/${target.id}`);
        entry = mapEnrollment(data.data);
    } catch (error) {
        if (error?.response?.status === 404) return null;
        throw error;
    }

    if (entry.status === "Completed" && entry.certificateId) return entry; // already done

    if (entry.status !== "Completed") {
        await api.patch(`/enrollments/${entry.id}`, { status: "completed" });
    }

    let certificateId = entry.certificateId;
    if (!certificateId) {
        const certificate = addCertificate({
            courseId: entry.courseId,
            courseName: entry.courseName,
            studentName: entry.studentName,
            rollNo: entry.rollNo,
            email: entry.email,
        });
        certificateId = certificate.id;
    }

    addCourseCompletedNotification({
        courseName: entry.courseName,
        email: entry.email,
        certId: certificateId,
    });

    return { ...entry, status: "Completed", certificateId };
}

// Admin only: removes every enrollment record in one request.
export async function clearAllEnrollments() {
    await api.delete("/enrollments");
}
