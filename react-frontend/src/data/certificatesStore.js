// Shared certificate records, persisted in localStorage under the
// "certificates" key. A certificate is created once, the moment a student
// marks a course complete, and is then looked up by id whenever the
// Certificate page (or a "View Certificate" link) needs to render it.

const STORAGE_KEY = "certificates";

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

function makeId() {
    return `cert_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

/** Human-readable serial shown on the printed certificate, e.g. LH-7F3K9Q2A. */
function makeSerial() {
    return `LH-${Date.now().toString(36).toUpperCase()}${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
}

/** Creates and stores a new certificate record, returning it (with generated id + serial). */
export function addCertificate({ courseId, courseName, studentName, rollNo, email }) {
    const list = readRaw();
    const record = {
        id: makeId(),
        serial: makeSerial(),
        courseId: courseId || null,
        courseName,
        studentName,
        rollNo,
        email: (email || "").toLowerCase(),
        issuedAt: new Date().toISOString(),
        dateLabel: new Date().toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" }),
    };
    writeRaw([record, ...list]);
    return record;
}

export function getCertificateById(id) {
    if (!id) return null;
    return readRaw().find((c) => c.id === id) || null;
}

export function getCertificatesForStudent(email) {
    const normalizedEmail = (email || "").toLowerCase();
    return readRaw()
        .filter((c) => c.email === normalizedEmail)
        .sort((a, b) => new Date(b.issuedAt) - new Date(a.issuedAt));
}
