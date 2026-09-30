import { useState } from "react";
import PageShell from "../components/PageShell";
import { Link, useNavigate } from "react-router-dom";
import PageCss from "../components/PageCss";
import { useAuth } from "../auth/AuthContext";
import {
    getNotificationsForUser,
    markAllNotificationsRead,
    markNotificationRead,
} from "../data/notificationsStore";
import { getCertificatesForStudent } from "../data/certificatesStore";

function timeAgo(iso) {
    const diffMs = Date.now() - new Date(iso).getTime();
    const minutes = Math.floor(diffMs / 60000);
    if (minutes < 1) return "just now";
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    return new Date(iso).toLocaleDateString();
}

export default function Notifications() {
    const { student } = useAuth();
    const email = student?.email || "";
    const navigate = useNavigate();

    const [notifications, setNotifications] = useState(() => getNotificationsForUser(email));
    const certificates = getCertificatesForStudent(email);
    const unreadCount = notifications.filter((n) => !n.read).length;

    function handleMarkAllRead() {
        markAllNotificationsRead(email);
        setNotifications(getNotificationsForUser(email));
    }

    function handleOpen(notification) {
        if (!notification.read) {
            markNotificationRead(email, notification.id);
            setNotifications(getNotificationsForUser(email));
        }
        if (notification.link) navigate(notification.link);
    }

    return (
        <PageShell variant="none">
            <PageCss href="/css/index.css" />
            <div className="db-header">
                <div className="db-header-inner">
                    <div className="db-welcome">
                        <div className="db-avatar">
                            <i className="fa-solid fa-bell"></i>
                        </div>
                        <div>
                            <p className="db-greeting">Stay in the loop</p>
                            <h1 className="db-name">Notifications</h1>
                            <p className="db-meta">
                                <span id="unreadSummary">
                                    {unreadCount === 0
                                        ? "You're all caught up"
                                        : `${unreadCount} unread notification${unreadCount === 1 ? "" : "s"}`}
                                </span>
                            </p>
                        </div>
                    </div>
                    <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
                        <button
                            type="button"
                            className="db-explore-btn"
                            style={{ background: "var(--surface)", color: "var(--navy)", border: "1.5px solid var(--border)", cursor: "pointer" }}
                            onClick={handleMarkAllRead}
                            disabled={unreadCount === 0}
                        >
                            <i className="fa-solid fa-check-double"></i>
                            Mark All as Read
                        </button>
                        <Link to="/dashboard" className="db-explore-btn">
                            <i className="fa-solid fa-gauge"></i>
                            Back to Dashboard
                        </Link>
                    </div>
                </div>
            </div>
            <main className="db-main">
                <section className="db-section db-section--full">
                    <div className="db-section-header">
                        <h2>
                            <i className="fa-solid fa-bell"></i>
                            All Notifications
                        </h2>
                    </div>
                    <div id="notificationsList">
                        {notifications.length === 0 ? (
                            <div className="db-empty-state">
                                <div className="db-empty-icon">
                                    <i className="fa-solid fa-bell-slash"></i>
                                </div>
                                <h3>No notifications yet</h3>
                                <p>New courses, enrollments, and completions will show up here.</p>
                            </div>
                        ) : (
                            notifications.map((n) => (
                                <div
                                    key={n.id}
                                    className={`db-course-item notif-item ${!n.read ? "notif-item--unread" : ""}`}
                                    style={{ cursor: n.link ? "pointer" : "default" }}
                                    onClick={() => handleOpen(n)}
                                >
                                    <div className="db-course-item-left">
                                        <div className="db-course-item-icon">
                                            <i className={n.icon || "fa-solid fa-bell"}></i>
                                        </div>
                                        <div>
                                            <div className="db-course-item-name">
                                                {n.title}
                                                {!n.read && <span className="notif-dot"></span>}
                                            </div>
                                            <div className="db-course-item-meta">{n.message}</div>
                                        </div>
                                    </div>
                                    <span className="db-course-status db-status--progress">{timeAgo(n.createdAt)}</span>
                                </div>
                            ))
                        )}
                    </div>
                </section>
                <section className="db-section db-section--full">
                    <div className="db-section-header">
                        <h2>
                            <i className="fa-solid fa-certificate"></i>
                            Certificates Earned
                        </h2>
                    </div>
                    <div id="certificatesList">
                        {certificates.length === 0 ? (
                            <div className="db-empty-state">
                                <div className="db-empty-icon">
                                    <i className="fa-solid fa-certificate"></i>
                                </div>
                                <h3>No certificates yet</h3>
                                <p>Complete a course from your dashboard to earn your first certificate.</p>
                            </div>
                        ) : (
                            certificates.map((cert) => (
                                <div className="db-course-item" key={cert.id}>
                                    <div className="db-course-item-left">
                                        <div className="db-course-item-icon db-course-item-icon--done">
                                            <i className="fa-solid fa-certificate"></i>
                                        </div>
                                        <div>
                                            <div className="db-course-item-name">{cert.courseName}</div>
                                            <div className="db-course-item-meta">
                                                <i className="fa-regular fa-clock"></i>
                                                Issued {cert.dateLabel}
                                            </div>
                                        </div>
                                    </div>
                                    <Link to={`/certificate?id=${cert.id}`} className="db-cert-badge">
                                        <i className="fa-solid fa-eye"></i> View / Download
                                    </Link>
                                </div>
                            ))
                        )}
                    </div>
                </section>
            </main>
        </PageShell>
    );
}
