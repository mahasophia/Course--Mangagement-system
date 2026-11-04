import PageShell from "../components/PageShell";
import { Link, useSearchParams } from "react-router-dom";
import PageCss from "../components/PageCss";
import { getCertificateById } from "../data/certificatesStore";

export default function Certificate() {
    const [searchParams] = useSearchParams();
    const certId = searchParams.get("id");
    const certificate = getCertificateById(certId);

    return (
        <PageShell variant="cert">
            <PageCss href="/css/certificate.css" />
            <main className="cert-page-main">
                <Link to="/dashboard" className="course-back-link">
                    <i className="fa-solid fa-arrow-left"></i>
                    Back to My Dashboard
                </Link>

                {!certificate ? (
                    <div className="db-empty-state">
                        <div className="db-empty-icon">
                            <i className="fa-solid fa-lock"></i>
                        </div>
                        <h3>Certificate not available yet</h3>
                        <p>Finish a course from your dashboard to unlock and view its certificate here.</p>
                        <Link to="/courses" className="db-empty-btn">
                            Browse Courses
                        </Link>
                    </div>
                ) : (
                    <div>
                        <div className="cert-actions">
                            <h1 style={{ fontFamily: "'Lora',serif", fontSize: "20px", color: "var(--navy)" }}>
                                Your Certificate
                            </h1>
                            <button className="primary-btn" onClick={() => window.print()}>
                                <i className="fa-solid fa-download"></i>
                                Print / Save as PDF
                            </button>
                        </div>
                        <div className="cert-frame">
                            <div className="cert-inner">
                                <div className="cert-corner tl"></div>
                                <div className="cert-corner tr"></div>
                                <div className="cert-corner bl"></div>
                                <div className="cert-corner br"></div>
                                <div className="cert-logo">
                                    <i className="fa-solid fa-graduation-cap"></i>
                                    LEARNHUB
                                </div>
                                <p className="cert-heading">Certificate of Completion</p>
                                <h2 className="cert-title">Awarded For Successful Completion</h2>
                                <p className="cert-presented">This certificate is proudly presented to</p>
                                <div className="cert-name">{certificate.studentName}</div>
                                <p className="cert-body-text">
                                    for successfully completing all requirements of the course
                                    <span className="cert-course-name"> {certificate.courseName} </span>
                                    on the SkillMatrix platform, demonstrating dedication and commitment to learning.
                                </p>
                                <div className="cert-footer-row">
                                    <div className="cert-footer-item">
                                        <div className="cert-footer-value">{certificate.dateLabel}</div>
                                        <div className="cert-footer-line">Date Completed</div>
                                    </div>
                                    <div className="cert-footer-item">
                                        <div className="cert-footer-value">{certificate.rollNo}</div>
                                        <div className="cert-footer-line">Roll Number</div>
                                    </div>
                                    <div className="cert-footer-item">
                                        <div className="cert-footer-value">SkillMatrix</div>
                                        <div className="cert-footer-line">Issuing Platform</div>
                                    </div>
                                </div>
                                <p className="cert-id">Certificate ID: {certificate.serial}</p>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </PageShell>
    );
}
