/* =========================================================================
   auth.js — student + admin authentication
   There's no real backend, so "auth" here means: validate the form,
   check/store an account record, keep a session, and redirect. Every page
   that needs to know who's logged in goes through the functions below
   rather than touching storage directly.

   Two different lifetimes are involved:
   - The ACCOUNT (registeredStudents, in api.js) is permanent — it's what
     a login is checked against, so you can't log in without registering
     first.
   - The SESSION (currentStudent, right here) is temporary — it lives in
     sessionStorage instead of localStorage, so it's automatically cleared
     when the browser/tab is closed, and is explicitly cleared on logout.
========================================================================= */

import { setCurrentStudent, getCurrentStudentState } from './state.js';
import { findRegisteredStudent, addRegisteredStudent } from './api.js';

const STUDENT_KEY = 'currentStudent';
const ADMIN_EMAIL = 'admin@institute.edu';
const ADMIN_PASS = 'password123';

/* ---------------------------- STUDENT AUTH ---------------------------- */

// Session is intentionally sessionStorage, not localStorage — it should
// only last as long as the browser/tab stays open, not persist forever.
export function getCurrentStudent() {
    try {
        return JSON.parse(sessionStorage.getItem(STUDENT_KEY) || 'null');
    } catch (e) {
        return null;
    }
}

function startStudentSession(student) {
    sessionStorage.setItem(STUDENT_KEY, JSON.stringify(student));
    setCurrentStudent(student);
    return student;
}

// Logs a student in — but only if they've actually registered first.
// Throws with a user-facing message on failure so the calling form can
// show it directly (alert / inline error), matching verifyAdminLogin below.
// The "not registered" case gets a `code` on the error so the caller can
// tell it apart from a simple wrong-password mistake (e.g. to offer a
// link/redirect to the register page instead of just an alert).
export function loginStudent({ email, password }) {
    const account = findRegisteredStudent(email);
    if (!account) {
        const err = new Error('No account found for this email. Please register first.');
        err.code = 'NOT_REGISTERED';
        throw err;
    }
    if (account.password !== password) {
        const err = new Error('Incorrect password. Please try again.');
        err.code = 'WRONG_PASSWORD';
        throw err;
    }
    return startStudentSession({ name: account.name, email: account.email });
}

// Creates the permanent account record, then starts a session for it.
// Refuses to create a duplicate account for an email that's already
// registered — the person should log in instead.
export function registerStudent({ name, email, password }) {
    if (findRegisteredStudent(email)) {
        throw new Error('An account with this email already exists. Please login instead.');
    }
    const account = addRegisteredStudent({ name, email, password });
    return startStudentSession({ name: account.name, email: account.email });
}

export function logoutStudent() {
    sessionStorage.removeItem(STUDENT_KEY);
    localStorage.removeItem(STUDENT_KEY); // clean up any stale entry from before the sessionStorage switch
    setCurrentStudent(null);
    window.location.href = 'stu-login.html';
}

// Call at the top of any page that REQUIRES a logged-in student — redirects
// to the login page (and halts the rest of that page's init) if not.
export function requireStudentLogin() {
    const student = getCurrentStudent();
    if (!student) {
        window.location.href = 'stu-login.html';
        throw new Error('Not logged in — redirecting to login page.');
    }
    setCurrentStudent(student);
    return student;
}

// Re-hydrates state.currentStudent from the session without redirecting —
// for pages where being logged in is optional (e.g. courses.html).
export function loadCurrentStudent() {
    const student = getCurrentStudent();
    setCurrentStudent(student);
    return student;
}

export { getCurrentStudentState };

/* ---------------------------- ADMIN AUTH ---------------------------- */

// Wires up a "verify admin" form: on submit, checks credentials and
// redirects to redirectTo (a string, or a function returning one) on
// success, or shows an alert on failure.
export function verifyAdminLogin(formId, emailId, passId, redirectTo) {
    const form = document.getElementById(formId);
    if (!form) return;
    form.addEventListener('submit', function (e) {
        e.preventDefault();
        const email = document.getElementById(emailId).value.trim();
        const pass = document.getElementById(passId).value;
        if (email === ADMIN_EMAIL && pass === ADMIN_PASS) {
            window.location.href = typeof redirectTo === 'function' ? redirectTo() : redirectTo;
        } else {
            alert('Invalid credentials. Please try again.');
        }
    });
}