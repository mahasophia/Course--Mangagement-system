import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import PageCss from "../components/PageCss";
import { useAuth } from "../auth/AuthContext";
import { loginStudent as verifyStudent } from "../services/authService";
import { apiErrorMessage } from "../services/api";

export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    const { loginStudent } = useAuth();
    const navigate = useNavigate();

    async function handleLogin(e) {
        e.preventDefault();
        e.stopPropagation();

        setIsSubmitting(true);
        try {
            // Checked against db.json (students) through the mock API
            const foundStudent = await verifyStudent(email, password);
            loginStudent(foundStudent);
            navigate("/courses");
        } catch (error) {
            setErrorMessage(apiErrorMessage(error));
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <>
            <PageCss href="/css/student_login.css" />
            <div className="split-wrapper">
                {/* Left Side Content */}
                <div className="auth-side auth-side-top">
                    <Link to="/" className="back-link">
                        <i className="fa-solid fa-arrow-left"></i>
                        Back to Home
                    </Link>
                    <div className="auth-side-logo">
                        <i className="fa-solid fa-graduation-cap"></i>
                        <span>SkillMatrix</span>
                    </div>
                    <h2>Pick up right where you left off.</h2>
                    <p>Sign in to access your courses, track your progress, and continue building skills that matter.</p>
                </div>

                {/* Right Side Form */}
                <div className="auth-form-side">
                    <div className="auth-card">
                        <div className="auth-panel active">
                            <h1 className="auth-title">Student Login</h1>
                            <p className="auth-subtitle">Welcome back! Please enter your details.</p>

                            {errorMessage && (
                                <p style={{ color: "red", fontWeight: "bold", margin: "10px 0" }}>
                                    {errorMessage}
                                </p>
                            )}

                            <form className="auth-form" onSubmit={handleLogin}>
                                <label htmlFor="studentEmail">Email Address</label>
                                <input 
                                    type="email" 
                                    id="studentEmail" 
                                    placeholder="you@example.com" 
                                    value={email}
                                    onChange={(e) => { setEmail(e.target.value); setErrorMessage(""); }}
                                    required 
                                />

                                <label htmlFor="studentPassword">Password</label>
                                <input 
                                    type="password" 
                                    id="studentPassword" 
                                    placeholder="••••••••" 
                                    value={password}
                                    onChange={(e) => { setPassword(e.target.value); setErrorMessage(""); }}
                                    required 
                                />

                                <button type="submit" className="auth-submit" disabled={isSubmitting}>{isSubmitting ? "Signing in..." : "Sign In"}</button>
                            </form>

                            <p className="auth-footer-text">
                                Don't have an account?{" "}
                                <Link to="/register">Register here</Link>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}