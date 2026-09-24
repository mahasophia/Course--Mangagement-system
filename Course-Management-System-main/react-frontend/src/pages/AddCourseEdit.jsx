import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import PageCss from "../components/PageCss";

const DEFAULT_ADMIN_EMAIL = "admin@institute.edu";
const DEFAULT_ADMIN_PASSWORD = "admin123";

export default function AddCourseEdit() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const navigate = useNavigate();

    function handleSubmit(e) {
        e.preventDefault();
        if (
            email.trim().toLowerCase() === DEFAULT_ADMIN_EMAIL &&
            password === DEFAULT_ADMIN_PASSWORD
        ) {
            navigate("/add-course");
            return;
        }
        setErrorMessage("Incorrect email or password.");
    }

    return (
        <>
            <PageCss href="/css/index.css" />
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
                    <h2>Manage the platform with full control.</h2>
                    <p>Sign in to your admin dashboard to manage courses, students, faculty, and platform settings.</p>
                    <ul className="auth-side-list">
                        <li>
                            <i className="fa-solid fa-shield-halved"></i>
                            Secure, role-based access
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
                        <div className="auth-panel active">
                            <h1 className="auth-title">Verify Admin Access</h1>
                            <p className="auth-subtitle">Sign in to continue editing.</p>
                            {errorMessage && (
                                <p style={{ color: "red", fontWeight: "bold", margin: "10px 0" }}>
                                    {errorMessage}
                                </p>
                            )}
                            <form className="auth-form" id="verifyLoginForm" onSubmit={handleSubmit}>
                                <label htmlFor="adminEmail">Email Address</label>
                                <input
                                    type="email"
                                    id="adminEmail"
                                    placeholder="admin@institute.edu"
                                    value={email}
                                    onChange={(e) => { setEmail(e.target.value); setErrorMessage(""); }}
                                    required
                                />
                                <label htmlFor="adminPassword">Password</label>
                                <input
                                    type="password"
                                    id="adminPassword"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => { setPassword(e.target.value); setErrorMessage(""); }}
                                    required
                                />
                                <Link to="/reset-password" className="auth-forgot">
                                    Forgot Password?
                                </Link>
                                <button type="submit" className="auth-submit">Verify & Continue</button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
            
        </>
    );
}
