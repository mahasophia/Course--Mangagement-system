import { Link } from "react-router-dom";
import PageCss from "../components/PageCss";
import LegacyScript from "../components/LegacyScript";

export default function AdminRegister() {
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
                            <form className="auth-form">
                                <label htmlFor="adminName">Full Name</label>
                                <input type="text" id="adminName" placeholder="Jane Smith" />
                                <label htmlFor="adminEmail">Email Address</label>
                                <input type="email" id="adminEmail" placeholder="admin@learnhub.com" />
                                <label htmlFor="adminCode">Admin Access Code</label>
                                <input type="text" id="adminCode" placeholder="Enter access code" />
                                <label htmlFor="adminPassword">Password</label>
                                <input type="password" id="adminPassword" placeholder="••••••••" />
                                <label htmlFor="adminConfirmPassword">Confirm Password</label>
                                <input type="password" id="adminConfirmPassword" placeholder="••••••••" />
                                <button type="submit" className="auth-submit">Create Account</button>
                            </form>
                            <p className="auth-footer-text">
                                Already have an account?
                                <a href="#">Login here</a>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
            <LegacyScript src="/legacy/js/admin_register.js" />
        </>
    );
}
