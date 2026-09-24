import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import PageCss from "../components/PageCss";

export default function Register() {
    const [username, setUsername] = useState("");
    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [department, setDepartment] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    
    const navigate = useNavigate();

    function handleRegister(e) {
        e.preventDefault();
        e.stopPropagation();

        if (password !== confirmPassword) {
            setErrorMessage("Passwords do not match!");
            return;
        }

        // Fetch existing students from localStorage or initialize empty array
        const existingStudents = JSON.parse(localStorage.getItem("students") || "[]");

        // Check if email already exists
        const userExists = existingStudents.find(s => s.email === email);
        if (userExists) {
            setErrorMessage("Email is already registered. Please login.");
            return;
        }

        // Save new student object
        const newStudent = { username, fullName, email, department, password };
        existingStudents.push(newStudent);
        localStorage.setItem("students", JSON.stringify(existingStudents));

        // Redirect to login page upon successful registration
        navigate("/login"); // Update this to match your actual login route path if different
    }

    return (
        <>
            <PageCss href="/css/student_register.css" />
            <div className="split-wrapper">
                {/* ================= LEFT SIDE CONTENT ================= */}
                <div className="auth-side auth-side-top">
                    <Link to="/" className="back-link">
                        <i className="fa-solid fa-arrow-left"></i>
                        Back to Home
                    </Link>
                    <div className="auth-side-logo">
                        <i className="fa-solid fa-graduation-cap"></i>
                        <span>SkillMatrix</span>
                    </div>
                    <h2>Start your learning journey today.</h2>
                    <p>Create a free account and get instant access to expert-led courses, hands-on projects, and certificates.</p>
                    <ul className="auth-side-list">
                        <li>
                            <i className="fa-solid fa-circle-check"></i>
                            Free access to starter courses
                        </li>
                        <li>
                            <i className="fa-solid fa-circle-check"></i>
                            Personalized learning dashboard
                        </li>
                        <li>
                            <i className="fa-solid fa-circle-check"></i>
                            Join a community of 1500+ learners
                        </li>
                        <li>
                            <i className="fa-solid fa-circle-check"></i>
                            Learn at your own pace, anytime
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
                        <div className="auth-panel active" id="studentPanel">
                            <h1 className="auth-title">Student Registration</h1>
                            <p className="auth-subtitle">Create an account to start learning.</p>
                            
                            {errorMessage && (
                                <p style={{ color: "red", fontWeight: "bold", margin: "10px 0" }}>
                                    {errorMessage}
                                </p>
                            )}

                            <form className="auth-form" onSubmit={handleRegister}>
                                <label htmlFor="studentUsername">Username</label>
                                <input 
                                    type="text" 
                                    id="studentUsername" 
                                    placeholder="johndoe23" 
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    required 
                                />

                                <label htmlFor="studentName">Full Name</label>
                                <input 
                                    type="text" 
                                    id="studentName" 
                                    placeholder="John Doe" 
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    required 
                                />

                                <label htmlFor="studentEmail">Email Address</label>
                                <input 
                                    type="email" 
                                    id="studentEmail" 
                                    placeholder="you@example.com" 
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required 
                                />

                                <label htmlFor="studentDepartment">Department</label>
                                <input 
                                    type="text" 
                                    id="studentDepartment" 
                                    placeholder="e.g. Computer Science" 
                                    value={department}
                                    onChange={(e) => setDepartment(e.target.value)}
                                    required 
                                />

                                <label htmlFor="studentPassword">Password</label>
                                <input 
                                    type="password" 
                                    id="studentPassword" 
                                    placeholder="••••••••" 
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required 
                                />

                                <label htmlFor="studentConfirmPassword">Confirm Password</label>
                                <input 
                                    type="password" 
                                    id="studentConfirmPassword" 
                                    placeholder="••••••••" 
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required 
                                />

                                <button type="submit" className="auth-submit">Create Account</button>
                            </form>

                            <p className="auth-footer-text">
                                Already have an account?{" "}
                                <Link to="/login">Login here</Link>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}