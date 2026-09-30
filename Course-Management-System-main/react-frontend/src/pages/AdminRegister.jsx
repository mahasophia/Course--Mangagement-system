import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import PageCss from "../components/PageCss";
import { registerAdmin } from "../services/authService";
import { apiErrorMessage } from "../services/api";

export default function AdminRegister() {
    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [accessCode, setAccessCode] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const navigate = useNavigate();

    async function handleRegister(e) {
        e.preventDefault();

        if (password !== confirmPassword) {
            setErrorMessage("Passwords do not match!");
            return;
        }

        setIsSubmitting(true);
        setErrorMessage("");
        try {
            // Saved to db.json (admins) through the mock API
            await registerAdmin({ fullName, email, accessCode, password });
            navigate("/admin-login");
        } catch (error) {
            setErrorMessage(apiErrorMessage(error));
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <>
            <PageCss href="/css/admin_register.css" />
                        <Link to="/" className="back-link">
                <i className="fa-solid fa-arrow-left"></i>
                Back to Home
            </Link>
            <div className="split-wrapper">
                {/* ================= LEFT SIDE CONTENT ================= */}
                <div className="auth-side">
                    <div className="auth-side-logo">
                        <i className="fa-solid fa-graduation-cap"></i>
                        <span>SkillMatrix</span>
                    </div>
                    <h2>Become part of the SkillMatrix team.</h2>
                    <p>Register as an administrator to help manage courses, students, and the overall platform experience.</p>
                    <ul className="auth-side-list">
                        <li>
                            <i className="fa-solid fa-shield-halved"></i>
                            Requires a valid access code
                        </li>
                        <li>
                            <i className="fa-solid fa-users-gear"></i>
                            Manage students and faculty
                        </li>
                        <li>
                            <i className="fa-solid fa-chart-line"></i>
                            View platform-wide analytics
                        </li>
                        <li>
                            <i className="fa-solid fa-book"></i>
                            Approve and publish courses
                        </li>
                    </ul>
                    <div className="auth-side-stats">
                        <div>
                            <h3>1500+</h3>
                            <span>Students</span>
                        </div>
                        <div>
                            <h3>120+</h3>
                            <span>Courses</span>
                        </div>
                        <div>
                            <h3>40+</h3>
                            <span>Faculty</span>
                        </div>
                    </div>
                </div>
                {/* ================= RIGHT SIDE FORM ================= */}
                <div className="auth-form-side">
                    <div className="auth-card">
                        <div className="auth-tabs">
                            <button className="auth-tab" disabled="">Student</button>
                            <button className="auth-tab active" disabled="">Admin</button>
                        </div>
                        <div className="auth-panel active">
                            <h1 className="auth-title">Admin Registration</h1>
                            <p className="auth-subtitle">Create an administrator account.</p>
                            {errorMessage && (
                                <p style={{ color: "red", fontWeight: "bold", margin: "10px 0" }}>
                                    {errorMessage}
                                </p>
                            )}
                            <form className="auth-form" onSubmit={handleRegister}>
                                <label htmlFor="adminName">Full Name</label>
                                <input type="text" id="adminName" placeholder="Jane Smith" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
                                <label htmlFor="adminEmail">Email Address</label>
                                <input type="email" id="adminEmail" placeholder="admin@learnhub.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
                                <label htmlFor="adminCode">Admin Access Code</label>
                                <input type="text" id="adminCode" placeholder="Enter access code" value={accessCode} onChange={(e) => setAccessCode(e.target.value)} required />
                                <label htmlFor="adminPassword">Password</label>
                                <input type="password" id="adminPassword" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required />
                                <label htmlFor="adminConfirmPassword">Confirm Password</label>
                                <input type="password" id="adminConfirmPassword" placeholder="••••••••" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
                                <button type="submit" className="auth-submit" disabled={isSubmitting}>{isSubmitting ? "Creating account..." : "Create Account"}</button>
                            </form>
                            <p className="auth-footer-text">
                                Already have an account?
                                <Link to="/admin-login">Login here</Link>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
