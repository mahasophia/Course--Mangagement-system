import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import PageCss from "../components/PageCss";

const DEFAULT_ADMIN_EMAIL = "admin@institute.edu";
const DEFAULT_ADMIN_PASSWORD = "admin123";

export default function EditCourseLogin() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const courseId = searchParams.get("course");

    function handleSubmit(e) {
        e.preventDefault();
        if (
            email.trim().toLowerCase() === DEFAULT_ADMIN_EMAIL &&
            password === DEFAULT_ADMIN_PASSWORD
        ) {
            navigate(courseId ? `/edit-course?course=${encodeURIComponent(courseId)}` : "/edit-course");
            return;
        }
        setErrorMessage("Incorrect email or password.");
    }

    return (
        <>
            <PageCss href="/css/index.css" />
                        <Link to="/courses" className="back-link">
                <i className="fa-solid fa-arrow-left"></i>
                Back to Courses
            </Link>
            <div className="split-wrapper">
                {/* ================= LEFT SIDE ================= */}
                <div className="auth-side">
                    <div className="auth-side-logo">
                        <i className="fa-solid fa-graduation-cap"></i>
                        <span>SkillMatrix</span>
                    </div>
                    <h2>Confirm it's you before editing course content.</h2>
                    <p>This action changes what students see. Sign in with your admin account to continue.</p>
                    <ul className="auth-side-list">
                        <li>
                            <i className="fa-solid fa-shield-halved"></i>
                            Secure, role-based access
                        </li>
                        <li>
                            <i className="fa-solid fa-pen-to-square"></i>
                            Add or edit any course
                        </li>
                        <li>
                            <i className="fa-solid fa-book"></i>
                            Changes reflect on the course catalog
                        </li>
                    </ul>
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
                                <button type="submit" className="auth-submit">Verify & Continue</button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
            
        </>
    );
}
