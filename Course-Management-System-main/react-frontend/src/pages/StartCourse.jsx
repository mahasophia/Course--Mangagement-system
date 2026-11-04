import PageShell from "../components/PageShell";
import PageCss from "../components/PageCss";
import LegacyScript from "../components/LegacyScript";

function StartCourse() {
    return (
        <>
            <PageCss href="/css/start_course.css" />
            <PageShell variant="student3">
                <div className="course-learn-container">
                    <div className="sidebar" id="moduleList">
                        <h3>Course Modules</h3>
                    </div>
                    <div className="content-area" id="courseContentArea">
                        <h2>Welcome to the Course</h2>
                        <p>Select a module from the sidebar to begin learning.</p>
                    </div>
                </div>
            </PageShell>
            <LegacyScript src="/legacy/js/start_course.js" />
        </>
    );
}

export default StartCourse;