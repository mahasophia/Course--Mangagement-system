// Shared enrollment records, persisted in localStorage under the
// "enrollments" key. Centralizing the read/write/status logic here means
// Courses.jsx (enroll), StudentDashboard.jsx (progress + mark complete)
// and the Learn page (start/continue/complete) all agree on exactly what
// "enrolled" / "in progress" / "completed" means for a given student.

import { addCertificate, getCertificateById } from "./certificatesStore";
import { addCourseCompletedNotification } from "./notificationsStore";

const STORAGE_KEY = "enrollments";

function normalize(value) {
    return (value || "").toString().trim().toLowerCase();
}

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

export function getAllEnrollments() {
    return readRaw();
}

export function getEnrollmentsForStudent(student) {
    return readRaw().filter((entry) => isSameStudent(entry, student));
}

/** Finds this student's enrollment record for a given course, or null. */
export function findEnrollment(courseId, courseTitle, student) {
    return readRaw().find((entry) => isSameCourse(entry, courseId, courseTitle) && isSameStudent(entry, student)) || null;
}

export function isAlreadyEnrolled(courseId, courseTitle, student) {
    return Boolean(findEnrollment(courseId, courseTitle, student));
}

/** Records a new enrollment. Returns the created entry. */
export function addEnrollment({ courseId, courseName, studentName, rollNo, email }) {
    const list = readRaw();
    const entry = {
        courseId,
        courseName,
        studentName,
        rollNo,
        email: email || "student@learnhub.com",
        status: "In Progress",
        date: new Date().toLocaleDateString(),
    };
    writeRaw([...list, entry]);
    return entry;
}

/**
 * Marks an enrollment complete, minting a certificate (or reusing one if
 * this got called twice) and firing a "course completed" notification.
 * Matches by courseId+student rather than object identity so it works
 * regardless of which page's copy of the entry is passed in.
 */
export function markEnrollmentComplete(target) {
    const list = readRaw();
    let updatedEntry = null;
    const next = list.map((entry) => {
        const matches =
            entry === target ||
            (isSameCourse(entry, target.courseId, target.courseName) &&
                (normalize(entry.email) === normalize(target.email) || entry.rollNo === target.rollNo));
        if (!matches) return entry;

        let certRecord = entry.certificateId ? getCertificateById(entry.certificateId) : null;
        if (!certRecord) {
            certRecord = addCertificate({
                courseId: entry.courseId,
                courseName: entry.courseName,
                studentName: entry.studentName,
                rollNo: entry.rollNo,
                email: entry.email,
            });
        }
        updatedEntry = { ...entry, status: "Completed", certificateId: certRecord.id };
        return updatedEntry;
    });

    if (updatedEntry) {
        writeRaw(next);
        addCourseCompletedNotification({
            courseName: updatedEntry.courseName,
            email: updatedEntry.email,
            certId: updatedEntry.certificateId,
        });
    }
    return updatedEntry;
}

export function clearAllEnrollments() {
    writeRaw([]);
}
