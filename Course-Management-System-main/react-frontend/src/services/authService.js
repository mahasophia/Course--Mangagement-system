// Registration + login backed by db.json (through json-server).
// Collections: "students" and "admins". The logged-in *session* is still kept
// in the browser by AuthContext; only the account records live in db.json.

import api from "./api";

// Access code required to register a new admin account. Change as needed.
export const ADMIN_ACCESS_CODE = "SKILLMATRIX2026";

function normalizeEmail(value) {
    return (value || "").toString().trim().toLowerCase();
}

// Never hand the password back to the UI / session storage.
function withoutPassword(account) {
    // eslint-disable-next-line no-unused-vars
    const { password, ...safe } = account;
    return safe;
}

async function findByEmail(collection, email) {
    const { data } = await api.get(`/${collection}`, { params: { email: normalizeEmail(email) } });
    return data[0] || null;
}

async function register(collection, fields, duplicateMessage) {
    const email = normalizeEmail(fields.email);
    if (await findByEmail(collection, email)) {
        throw new Error(duplicateMessage);
    }
    const { data } = await api.post(`/${collection}`, { ...fields, email });
    return withoutPassword(data);
}

async function login(collection, email, password, failMessage) {
    const account = await findByEmail(collection, email);
    if (!account || account.password !== password) {
        throw new Error(failMessage);
    }
    return withoutPassword(account);
}

export function registerStudent({ username, fullName, email, department, password }) {
    return register(
        "students",
        { username, fullName, email, department, password },
        "Email is already registered. Please login."
    );
}

export function loginStudent(email, password) {
    return login("students", email, password, "You are not registered. Please register first.");
}

export function registerAdmin({ fullName, email, accessCode, password }) {
    if (accessCode !== ADMIN_ACCESS_CODE) {
        return Promise.reject(new Error("Invalid admin access code."));
    }
    return register("admins", { fullName, email, password }, "An admin with this email already exists.");
}

export function loginAdmin(email, password) {
    return login("admins", email, password, "Incorrect email or password.");
}
