import PageShell from "../components/PageShell";
import { Link } from "react-router-dom";
import PageCss from "../components/PageCss";
import LegacyScript from "../components/LegacyScript";

export default function Home() {
    return (
        <>
            <PageCss href="/css/index.css" />
            <PageShell variant="home">
                <section className="hero">
                    <div className="hero-text">
                        <h1>
                            Learn New Skills
                            <br />
                            Anytime, Anywhere
                        </h1>
                        <p>
                            Join thousands of learners and build your future with
                            industry-ready courses from experienced instructors.
                        </p>
                        <div className="hero-buttons">
                            <Link to="/courses" className="primary-btn">
                                Explore Courses
                            </Link>
                            <Link to="/login" className="secondary-btn">Login/Register</Link>
                        </div>
                    </div>
                    <div className="hero-image">
                        <img src="https://cdn-icons-png.flaticon.com/512/3135/3135755.png" alt="Hero" />
                    </div>
                </section>
                {/* ================= CATEGORIES ================= */}
                <section className="categories">
                    <h2>Popular Categories</h2>
                    <div className="category-container">
                        <div className="card">
                            <i className="fa-solid fa-code"></i>
                            <h3>Web Development</h3>
                        </div>
                        <div className="card">
                            <i className="fa-solid fa-robot"></i>
                            <h3>Artificial Intelligence</h3>
                        </div>
                        <div className="card">
                            <i className="fa-solid fa-chart-line"></i>
                            <h3>Data Science</h3>
                        </div>
                        <div className="card">
                            <i className="fa-brands fa-java"></i>
                            <h3>Java</h3>
                        </div>
                        <div className="card">
                            <i className="fa-brands fa-python"></i>
                            <h3>Python</h3>
                        </div>
                        <div className="card">
                            <i className="fa-solid fa-palette"></i>
                            <h3>UI / UX</h3>
                        </div>
                    </div>
                </section>
                {/* ================= FEATURED COURSES ================= */}
                <section className="courses">
                    <h2>Featured Courses</h2>
                    <div className="course-container">
                        <div className="course-card">
                            <img src="https://codemithra.com/wp-content/uploads/2024/07/What-is-a-Full-Stack-Developer-jpg.webp" alt="Course" />
                            <h3>Full Stack Development</h3>
                            <p>12 Weeks</p>
                            <p>★★★★★</p>
                        </div>
                        <div className="course-card">
                            <img src="https://tse4.mm.bing.net/th/id/OIP.E4od0LKRNcYZ6ueDyfSqIQHaEK?cb=thfc1falcon4&rs=1&pid=ImgDetMain&o=7&rm=3" alt="Course" />
                            <h3>Python Programming</h3>
                            <p>10 Weeks</p>
                            <p>★★★★★</p>
                        </div>
                        <div className="course-card">
                            <img src="https://tse2.mm.bing.net/th/id/OIP.O09Yfj0Q5LEusFUku3tOyQAAAA?cb=thfc1falcon4&rs=1&pid=ImgDetMain&o=7&rm=3" alt="Course" />
                            <h3>Artificial Intelligence</h3>
                            <p>16 Weeks</p>
                            <p>★★★★★</p>
                        </div>
                    </div>
                </section>
                {/* ================= WHY CHOOSE US ================= */}
                <section className="features">
                    <h2>Why Choose Us?</h2>
                    <div className="feature-container">
                        <div className="feature-card">
                            <i className="fa-solid fa-user-graduate"></i>
                            <h3>Expert Faculty</h3>
                            <p>Learn from experienced instructors.</p>
                        </div>
                        <div className="feature-card">
                            <i className="fa-solid fa-book-open"></i>
                            <h3>Interactive Learning</h3>
                            <p>Hands-on projects and practical learning.</p>
                        </div>
                        <div className="feature-card">
                            <i className="fa-solid fa-chart-simple"></i>
                            <h3>Track Progress</h3>
                            <p>Monitor your learning journey.</p>
                        </div>
                        <div className="feature-card">
                            <i className="fa-solid fa-certificate"></i>
                            <h3>Certification</h3>
                            <p>Earn certificates after completion.</p>
                        </div>
                    </div>
                </section>
                {/* ================= STATISTICS ================= */}
                <section className="stats">
                    <div className="stat-box">
                        <h2>1500+</h2>
                        <p>Students</p>
                    </div>
                    <div className="stat-box">
                        <h2>120+</h2>
                        <p>Courses</p>
                    </div>
                    <div className="stat-box">
                        <h2>40+</h2>
                        <p>Faculty</p>
                    </div>
                    <div className="stat-box">
                        <h2>98%</h2>
                        <p>Success Rate</p>
                    </div>
                </section>
                {/* ================= TESTIMONIALS ================= */}
                <section className="testimonials">
                    <h2>Student Reviews</h2>
                    <div className="testimonial-container">
                        <div className="testimonial">
                            <img src="https://randomuser.me/api/portraits/women/45.jpg" alt="User" />
                            <h3>Sarah</h3>
                            <p>"This platform made learning very easy and enjoyable."</p>
                        </div>
                        <div className="testimonial">
                            <img src="https://randomuser.me/api/portraits/men/30.jpg" alt="User" />
                            <h3>John</h3>
                            <p>"The dashboard and progress tracker are amazing!"</p>
                        </div>
                        <div className="testimonial">
                            <img src="https://randomuser.me/api/portraits/women/50.jpg" alt="User" />
                            <h3>Emily</h3>
                            <p>"Highly recommended for students."</p>
                        </div>
                    </div>
                </section>
                {/* ================= FAQ ================= */}
                <section className="faq">
                    <h2>Frequently Asked Questions</h2>
                    <div className="faq-item">
                        <h3>How do I enroll in a course?</h3>
                        <p>Create an account and click on Enroll.</p>
                    </div>
                    <div className="faq-item">
                        <h3>Will I get a certificate?</h3>
                        <p>Yes, after successfully completing the course.</p>
                    </div>
                    <div className="faq-item">
                        <h3>Can I learn at my own pace?</h3>
                        <p>Yes. Courses are available anytime.</p>
                    </div>
                </section>
                {/* ================= NEWSLETTER ================= */}
                <section className="newsletter">
                    <h2>Stay Updated</h2>
                    <p>Subscribe to receive latest course updates.</p>
                    <input type="email" placeholder="Enter your Email" />
                    <button>Subscribe</button>
                </section>
            </PageShell>
            <LegacyScript src="/legacy/js/home.js" />
        </>
    );
}