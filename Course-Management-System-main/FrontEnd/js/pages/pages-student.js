/* =========================================================================
   pages-student.js — stu-dashboard.html, notifications.html, certificate.html
========================================================================= */

import { requireStudentLogin } from '../auth.js';
import {
    getStudentEnrollments, saveStudentEnrollments, getNewCourses,
    getCourseProgressPercent, getReadNotificationIds, saveReadNotificationIds
} from '../api.js';
import { emptyStateHTML, renderProgressRing, timeAgo, formatDateLong } from '../ui.js';

export function initStuDashboard() {
    const student = requireStudentLogin();

    document.getElementById('studentNameHeading').textContent = student.name;
    document.getElementById('studentEmailMeta').textContent = student.email;

    function renderDashboard() {
        let enrollments = getStudentEnrollments(student.email);

        // Auto-sync status: if a course's real progress hits 100%, flip it to completed
        let changed = false;
        enrollments.forEach(course => {
            const pct = getCourseProgressPercent(student.email, course.courseId);
            const shouldBeDone = pct === 100;
            if (shouldBeDone && course.status !== 'completed') {
                course.status = 'completed';
                if (!course.completedDate) course.completedDate = new Date().toISOString();
                changed = true;
            } else if (!shouldBeDone && course.status === 'completed') {
                course.status = 'in-progress';
                changed = true;
            }
        });
        if (changed) saveStudentEnrollments(student.email, enrollments);

        const inProgress = enrollments.filter(e => e.status === 'in-progress');
        const completed = enrollments.filter(e => e.status === 'completed');

        document.getElementById('statEnrolled').textContent = enrollments.length;
        document.getElementById('statCompleted').textContent = completed.length;
        document.getElementById('statInProgress').textContent = inProgress.length;
        document.getElementById('statCerts').textContent = completed.length;

        const overallPct = enrollments.length > 0 ? Math.round((completed.length / enrollments.length) * 100) : 0;
        document.getElementById('overallLabel').textContent = completed.length + ' of ' + enrollments.length + ' courses completed';
        document.getElementById('overallPct').textContent = overallPct + '%';
        document.getElementById('overallFill').style.width = overallPct + '%';
        renderProgressRing('overallRing', overallPct);

        const ipEl = document.getElementById('inProgressList');
        if (inProgress.length === 0) {
            ipEl.innerHTML = emptyStateHTML('chart-line', 'No courses in progress', 'Once you enrol in a course, your progress will appear here.', 'Browse Courses');
        } else {
            ipEl.innerHTML = inProgress.map(course => {
                const pct = getCourseProgressPercent(student.email, course.courseId);
                const link = 'course.html?course=' + encodeURIComponent(course.courseId);
                return `<div class="db-course-item" style="flex-direction:column;align-items:stretch;gap:10px;">
                    <div style="display:flex;align-items:center;justify-content:space-between;gap:12px;">
                        <div class="db-course-item-left">
                            <div class="db-course-item-icon"><i class="fa-solid fa-book-open"></i></div>
                            <div>
                                <p class="db-course-item-name">${course.courseName}</p>
                                <p class="db-course-item-meta"><i class="fa-solid fa-user"></i> ${course.name} &nbsp;·&nbsp; <i class="fa-solid fa-id-card"></i> ${course.roll}</p>
                            </div>
                        </div>
                        <a href="${link}" class="db-complete-btn" style="text-decoration:none;">
                            <i class="fa-solid fa-play"></i> Continue
                        </a>
                    </div>
                    <div>
                        <div class="progress-track"><div class="progress-fill" style="width:${pct}%"></div></div>
                        <span style="font-size:11.5px;color:var(--text-muted);">${pct}% complete</span>
                    </div>
                </div>`;
            }).join('');
        }

        const mcEl = document.getElementById('myCoursesList');
        if (enrollments.length === 0) {
            mcEl.innerHTML = emptyStateHTML('book-bookmark', 'No courses enrolled yet', 'Enrol in your first course to see it listed here.', 'Start Learning');
        } else {
            mcEl.innerHTML = enrollments.map(course => {
                const done = course.status === 'completed';
                const pct = getCourseProgressPercent(student.email, course.courseId);
                return `<div class="db-course-item" style="flex-direction:column;align-items:stretch;gap:10px;">
                    <div class="db-course-item-left">
                        <div class="db-course-item-icon ${done ? 'db-course-item-icon--done' : ''}">
                            <i class="fa-solid fa-${done ? 'circle-check' : 'book-open'}"></i>
                        </div>
                        <div>
                            <p class="db-course-item-name">${course.courseName}</p>
                            <span class="db-course-status ${done ? 'db-status--done' : 'db-status--progress'}">
                                ${done ? 'Completed' : 'In Progress'}
                            </span>
                        </div>
                    </div>
                    <div>
                        <div class="progress-track"><div class="progress-fill" style="width:${pct}%"></div></div>
                        <span style="font-size:11.5px;color:var(--text-muted);">${pct}% complete</span>
                    </div>
                </div>`;
            }).join('');
        }

        const compEl = document.getElementById('completedList');
        if (completed.length === 0) {
            compEl.innerHTML = emptyStateHTML('trophy', 'No completions yet', 'Courses you finish will appear here along with your certificates.', 'Explore Courses');
        } else {
            compEl.innerHTML = completed.map(course => {
                const certLink = 'certificate.html?course=' + encodeURIComponent(course.courseId) +
                    '&name=' + encodeURIComponent(course.name) + '&roll=' + encodeURIComponent(course.roll);
                return `<div class="db-course-item">
                    <div class="db-course-item-left">
                        <div class="db-course-item-icon db-course-item-icon--done">
                            <i class="fa-solid fa-circle-check"></i>
                        </div>
                        <div>
                            <p class="db-course-item-name">${course.courseName}</p>
                            <p class="db-course-item-meta"><i class="fa-solid fa-user"></i> ${course.name} &nbsp;·&nbsp; <i class="fa-solid fa-id-card"></i> ${course.roll}</p>
                        </div>
                    </div>
                    <a href="${certLink}" class="db-cert-badge" style="text-decoration:none;">
                        <i class="fa-solid fa-certificate"></i> View Certificate
                    </a>
                </div>`;
            }).join('');
        }
    }

    renderDashboard();
}

export function initNotifications() {
    const student = requireStudentLogin();

    function buildNotifications() {
        const enrollments = getStudentEnrollments(student.email);
        const newCourses = getNewCourses();
        const items = [];

        items.push({
            id: 'welcome', type: 'course', icon: 'hand-sparkles',
            title: 'Welcome to SkillMatrix!',
            message: 'Browse the course catalog and enroll to start tracking your learning journey here.',
            date: enrollments.length ? enrollments[0].date : null,
            link: 'courses.html'
        });

        newCourses.forEach(c => {
            const category = c.category || c.section || 'Other';
            items.push({
                id: 'course-' + c.id, type: 'course', icon: 'circle-plus',
                title: 'New Course Added: ' + c.title,
                message: 'A new ' + (c.level || '') + ' course in ' + category +
                    (c.instructor ? ' — taught by ' + c.instructor : '') + '.',
                date: c.dateAdded || null,
                link: 'courses.html'
            });
        });

        enrollments.forEach(en => {
            items.push({
                id: 'enroll-' + en.courseId, type: 'enrollment', icon: 'graduation-cap',
                title: 'Enrolled in ' + en.courseName,
                message: "You successfully enrolled in this course. Jump back in whenever you're ready.",
                date: en.date,
                link: 'courses.html'
            });

            if (en.status === 'completed') {
                items.push({
                    id: 'complete-' + en.courseId, type: 'certificate', icon: 'trophy',
                    title: 'Course Completed: ' + en.courseName,
                    message: 'Great work! Your certificate is ready to view and download.',
                    date: en.completedDate || en.date,
                    link: 'certificate.html?course=' + encodeURIComponent(en.courseId) +
                        '&name=' + encodeURIComponent(en.name) + '&roll=' + encodeURIComponent(en.roll)
                });
            }
        });

        items.sort((a, b) => {
            const at = a.date ? new Date(a.date).getTime() : Date.now();
            const bt = b.date ? new Date(b.date).getTime() : Date.now();
            return bt - at;
        });
        return items;
    }

    function markAsRead(id) {
        const read = getReadNotificationIds(student.email);
        if (!read.includes(id)) {
            read.push(id);
            saveReadNotificationIds(student.email, read);
        }
    }

    function markAllRead() {
        saveReadNotificationIds(student.email, buildNotifications().map(n => n.id));
        render();
    }

    function openNotification(id, link) {
        markAsRead(id);
        if (link) window.location.href = link;
        else render();
    }

    window.markAllRead = markAllRead;
    window.openNotification = openNotification;

    function notifItemHtml(n, readIds) {
        const isUnread = !readIds.includes(n.id);
        return `<div class="db-course-item notif-item ${isUnread ? 'notif-item--unread' : ''}"
                    onclick="openNotification('${n.id}', '${n.link || ''}')" style="cursor:pointer;">
            <div class="db-course-item-left">
                <div class="notif-icon-wrap type-${n.type}">
                    <i class="fa-solid fa-${n.icon}"></i>
                </div>
                <div>
                    <p class="db-course-item-name">
                        ${n.title}
                        ${isUnread ? '<span class="notif-dot"></span>' : ''}
                    </p>
                    <p class="db-course-item-meta">${n.message}</p>
                </div>
            </div>
            <span style="font-size:11.5px;color:var(--text-muted);white-space:nowrap;">${timeAgo(n.date)}</span>
        </div>`;
    }

    function render() {
        const all = buildNotifications();
        const readIds = getReadNotificationIds(student.email);

        const certificates = all.filter(n => n.type === 'certificate');
        const notifications = all.filter(n => n.type !== 'certificate');
        const unreadCount = all.filter(n => !readIds.includes(n.id)).length;

        document.getElementById('unreadSummary').textContent =
            unreadCount === 0 ? "You're all caught up" :
            unreadCount === 1 ? '1 unread notification' :
            unreadCount + ' unread notifications';

        const listEl = document.getElementById('notificationsList');
        listEl.innerHTML = notifications.length === 0
            ? emptyStateHTML('bell-slash', 'No notifications yet', 'Enroll in a course to start seeing updates here.', 'Browse Courses')
            : notifications.map(n => notifItemHtml(n, readIds)).join('');

        const certEl = document.getElementById('certificatesList');
        certEl.innerHTML = certificates.length === 0
            ? emptyStateHTML('certificate', 'No certificates yet', "Complete a course to earn your first certificate — it'll show up here.", 'View My Courses', 'stu-dashboard.html')
            : certificates.map(n => notifItemHtml(n, readIds)).join('');
    }

    render();
}

export function initCertificate() {
    const student = requireStudentLogin();

    const params = new URLSearchParams(window.location.search);
    const courseId = params.get('course');

    // Only ever look within the logged-in student's own enrollments — this
    // also prevents viewing someone else's certificate by guessing a URL.
    const enrollments = getStudentEnrollments(student.email);
    const record = enrollments.find(en => en.courseId === courseId);

    if (!record) {
        document.getElementById('notCompletedTitle').textContent = 'No enrollment found';
        document.getElementById('notCompletedMsg').textContent = "We couldn't find an enrollment matching this course under your account.";
        document.getElementById('notCompletedState').hidden = false;
        return;
    }

    if (record.status !== 'completed') {
        document.getElementById('notCompletedState').hidden = false;
        return;
    }

    document.getElementById('certWrap').hidden = false;
    document.getElementById('certStudentName').textContent = record.name;
    document.getElementById('certCourseName').textContent = record.courseName;
    document.getElementById('certRoll').textContent = record.roll;
    document.getElementById('certDate').textContent = formatDateLong(record.date);

    const certId = (record.courseId + '-' + record.roll).toUpperCase().replace(/\s+/g, '');
    document.getElementById('certId').textContent = 'Certificate ID: ' + certId;

    document.title = 'Certificate - ' + record.courseName + ' | SkillMatrix';
}