import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { getUnreadCount } from "../data/notificationsStore";

export default function Navbar() {
    const { student, admin, logoutStudent, logoutAdmin } = useAuth();
    const navigate = useNavigate();
    // useLocation forces a re-render on every navigation, which is what
    // keeps this badge fresh (e.g. right after enrolling, or right after
    // visiting /notifications, which clears the unread count).
    useLocation();

    const unreadCount = getUnreadCount(student?.email || "");

    function handleLogout() {
        if (admin) {
            logoutAdmin();
        } else {
            logoutStudent();
        }
        navigate("/");
    }

    return (
        <header className="navbar" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%", padding: "15px 30px", background: "#fff", borderBottom: "1px solid #eaeaea" }}>
            <div className="logo" style={{ display: "flex", alignItems: "center", gap: "8px", fontWeight: "bold", fontSize: "20px" }}>
                <i className="fa-solid fa-graduation-cap"></i>
                <span>SkillMatrix</span>
            </div>
            
            <ul className="nav-links" style={{ display: "flex", gap: "20px", listStyle: "none", margin: 0, padding: 0, alignItems: "center" }}>
                <li><Link to="/">Home</Link></li>
                <li><Link to="/courses">Courses</Link></li>
                <li>
                    <Link to="/notifications" style={{ position: "relative" }}>
                        Notifications
                        {unreadCount > 0 && (
                            <span
                                style={{
                                    position: "absolute",
                                    top: "-8px",
                                    right: "-16px",
                                    background: "#e11d48",
                                    color: "#fff",
                                    borderRadius: "999px",
                                    fontSize: "10px",
                                    fontWeight: "700",
                                    lineHeight: "1",
                                    padding: "3px 5px",
                                    minWidth: "16px",
                                    textAlign: "center",
                                }}
                            >
                                {unreadCount > 9 ? "9+" : unreadCount}
                            </span>
                        )}
                    </Link>
                </li>
                {student && <li><Link to="/dashboard">Dashboard</Link></li>}
            </ul>

            <div className="nav-buttons">
                {student || admin ? (
                    <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
                        <span style={{ fontWeight: "600", color: "#333" }}>
                            <i className="fa-solid fa-user" style={{ marginRight: "6px" }}></i>
                            {student ? (student.fullName || student.username) : (admin.fullName || admin.email)}
                        </span>
                        <button onClick={handleLogout} className="login-btn" style={{ cursor: "pointer", padding: "6px 14px" }}>
                            Logout
                        </button>
                    </div>
                ) : (
                    <Link to="/stu-login" className="login-btn">
                        Login / Register
                    </Link>
                )}
            </div>
        </header>
    );
}