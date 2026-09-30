import PageShell from "../components/PageShell";
import PageCss from "../components/PageCss";
import LegacyScript from "../components/LegacyScript";

function MyCourses() {
    return (
        <>
            <PageCss href="/css/my_courses.css" />
            <PageShell variant="student3">
                <section className="features">
                    <h2>My Enrolled Courses</h2>
                    <div className="cards" id="myCoursesContainer">
                        {/* Enrolled courses loaded dynamically via legacy js */}
                    </div>
                </section>
            </PageShell>
            <LegacyScript src="/legacy/js/my_courses.js" />
        </>
    );
}

export default MyCourses;