import PageCss from "../components/PageCss";
import LegacyScript from "../components/LegacyScript";

export default function ResetPassword() {
    return (
        <>
            <PageCss href="/css/reset_password.css" />
                        <div className="split-wrapper">
                {/* LEFT SIDE CONTENT */}
                <div className="auth-side">
                    <div className="auth-side-logo">
                        <i className="fa-solid fa-graduation-cap"></i>
                        <span>SkillMatrix</span>
                    </div>
                    <h2>Secure your account.</h2>
                    <p>Choose a strong, unique password to keep your account safe and continue your journey.</p>
                </div>
                {/* RIGHT SIDE FORM */}
                <div className="auth-form-side">
                    <div className="auth-card">
                        <div className="auth-panel active">
                            <h1 className="auth-title">Set New Password</h1>
                            <p className="auth-subtitle">Create a new password for your account.</p>
                            <form className="auth-form">
                                <label htmlFor="newPassword">New Password</label>
                                <input type="password" id="newPassword" placeholder="••••••••" required="" />
                                <label htmlFor="confirmPassword">Confirm New Password</label>
                                <input type="password" id="confirmPassword" placeholder="••••••••" required="" />
                                <button type="submit" className="auth-submit">Update Password</button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
            <LegacyScript src="/legacy/js/reset_password.js" />
        </>
    );
}
