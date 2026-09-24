/* =========================================================================
   pages-courses.js — courses.html (catalog + enroll modal) and
   course.html (course content / progress tracking)
========================================================================= */

import { getCurrentStudent, loadCurrentStudent } from '../auth.js';
import {
    getNewCourses, getDeletedCourseIds, getCourseEdits, slugify,
    isEnrolled, addEnrollment, getCourseById, getCourseModule,
    getUnitProgress, saveUnitProgress, getVideoProgress, saveVideoProgress,
    syncEnrollmentStatus
} from '../api.js';
import { courseBadgeClass, renderNavAuth } from '../ui.js';
import { logoutStudent } from '../auth.js';

/* ---------------------------- courses.html ---------------------------- */

export function initCourses() {
    // Render any courses the admin has added, into their matching section.
    // If the admin used a brand-new category that doesn't have a section
    // on this page yet, one is created automatically.
    const newCourses = getNewCourses();

    function getOrCreateSectionGrid(sectionKey, categoryLabel) {
        let sectionEl = document.querySelector('.course-section[data-section="' + sectionKey + '"]');
        if (sectionEl) return sectionEl.querySelector('.courses-grid');

        sectionEl = document.createElement('section');
        sectionEl.className = 'course-section';
        sectionEl.dataset.section = sectionKey;
        sectionEl.innerHTML = `
            <div class="section-header">
                <div class="section-title-group">
                    <div class="section-icon"><i class="fa-solid fa-layer-group"></i></div>
                    <div>
                        <h2>${categoryLabel}</h2>
                        <p class="section-count">0 Courses</p>
                    </div>
                </div>
                <a href="add-course-edit.html" class="admin-section-btn">
                    <i class="fa-solid fa-plus"></i> Add Course
                </a>
            </div>
            <div class="courses-grid"></div>`;

        document.querySelector('.courses-main').appendChild(sectionEl);
        return sectionEl.querySelector('.courses-grid');
    }

    newCourses.forEach(c => {
        const categoryLabel = c.category || c.section || 'Other';
        const sectionKey = c.section || slugify(categoryLabel);
        const section = getOrCreateSectionGrid(sectionKey, categoryLabel);

        const card = document.createElement('div');
        card.className = 'c-card';
        card.dataset.id = c.id;
        card.dataset.name = c.title;
        card.innerHTML = `
            <div class="c-card-body">
                <span class="${courseBadgeClass(c.level)}">${c.level}</span>
                <h3>${c.title}</h3>
                <div class="c-duration"><i class="fa-regular fa-clock"></i> ${c.duration.split('·')[0].trim()}</div>
                <div class="c-meta">
                    <span><i class="fa-solid fa-star"></i> ${c.rating}</span>
                </div>
                <div class="c-card-actions">
                    <button type="button" class="enroll-btn" onclick="openEnrollModal(this)"><i class="fa-solid fa-graduation-cap"></i> Enroll</button>
                    <a href="edit-course-login.html?course=${c.id}" class="admin-edit-btn" title="Edit Course"><i class="fa-solid fa-pen-to-square"></i></a>
                </div>
                <details class="c-details">
                    <summary class="view-details-btn"><i class="fa-solid fa-chevron-down"></i> View Details</summary>
                    <div class="c-details-body">
                        <p><strong>Instructor:</strong> ${c.instructor}</p>
                        <p><strong>Duration:</strong> ${c.duration}</p>
                        <p><strong>Topics:</strong> ${c.topics}</p>
                        <p><strong>Outcome:</strong> ${c.outcome}</p>
                    </div>
                </details>
            </div>`;
        section.appendChild(card);
    });

    // Remove any courses the admin has deleted, then refresh each
    // section's course count
    getDeletedCourseIds().forEach(id => {
        const card = document.querySelector('.c-card[data-id="' + id + '"]');
        if (card) card.remove();
    });

    document.querySelectorAll('.course-section').forEach(section => {
        const countEl = section.querySelector('.section-count');
        if (!countEl) return;
        const remaining = section.querySelectorAll('.c-card').length;
        countEl.textContent = remaining + (remaining === 1 ? ' Course' : ' Courses');
    });

    // Read any saved course edits from localStorage and update cards live
    document.querySelectorAll('.c-card[data-id]').forEach(card => {
        const id = card.dataset.id;
        const c = getCourseEdits(id);
        if (!c) return;

        if (c.title) card.querySelector('h3').textContent = c.title;

        if (c.duration) {
            const dur = card.querySelector('.c-duration');
            if (dur) dur.innerHTML = '<i class="fa-regular fa-clock"></i> ' + c.duration.split('·')[0].trim();
        }

        if (c.rating) {
            const rat = card.querySelector('.c-meta span');
            if (rat) rat.innerHTML = '<i class="fa-solid fa-star"></i> ' + c.rating;
        }

        if (c.level) {
            const badge = card.querySelector('.c-badge');
            if (badge) {
                badge.textContent = c.level;
                badge.className = courseBadgeClass(c.level);
            }
        }

        const body = card.querySelector('.c-details-body');
        if (body) {
            const p = body.querySelectorAll('p');
            if (p[0] && c.instructor) p[0].innerHTML = '<strong>Instructor:</strong> ' + c.instructor;
            if (p[1] && c.duration) p[1].innerHTML = '<strong>Duration:</strong> ' + c.duration;
            if (p[2] && c.topics) p[2].innerHTML = '<strong>Topics:</strong> ' + c.topics;
            if (p[3] && c.prereqs) p[3].innerHTML = '<strong>Prerequisites:</strong> ' + c.prereqs;
        }
    });

    // ================= ENROLLMENT MODAL LOGIC =================
    let currentEnrollCard = null;
    const enrollOverlay = document.getElementById('enrollModalOverlay');
    const enrollFormStep = document.getElementById('enrollFormStep');
    const enrollSuccessStep = document.getElementById('enrollSuccessStep');

    window.openEnrollModal = openEnrollModal;
    window.closeEnrollModal = closeEnrollModal;
    window.submitEnrollment = submitEnrollment;

    (function initNavAuth() {
        const student = getCurrentStudent();
        renderNavAuth(student);
        const btn = document.getElementById('navLogoutBtn');
        if (btn) btn.addEventListener('click', e => { e.preventDefault(); logoutStudent(); });
    })();

    function openEnrollModal(btn) {
        const student = getCurrentStudent();
        if (!student) {
            if (confirm('Please log in to enroll in a course. Go to the login page now?')) {
                window.location.href = 'stu-login.html';
            }
            return;
        }

        currentEnrollCard = btn.closest('.c-card');
        const courseName = currentEnrollCard ? currentEnrollCard.dataset.name : 'this course';

        document.getElementById('enrollCourseName').textContent = courseName;
        document.getElementById('enrollStudentName').value = student.name;
        document.getElementById('enrollStudentName').readOnly = true;
        document.getElementById('enrollRollNo').value = '';
        document.getElementById('enrollFormError').textContent = '';

        enrollFormStep.style.display = 'block';
        enrollSuccessStep.style.display = 'none';

        enrollOverlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function closeEnrollModal() {
        enrollOverlay.classList.remove('active');
        document.body.style.overflow = '';
    }

    function submitEnrollment(e) {
        if (e) e.preventDefault();

        const student = getCurrentStudent();
        if (!student) {
            window.location.href = 'stu-login.html';
            return false;
        }

        const name = document.getElementById('enrollStudentName').value.trim();
        const roll = document.getElementById('enrollRollNo').value.trim();
        const errorEl = document.getElementById('enrollFormError');

        if (!name || !roll) {
            errorEl.textContent = 'Please fill in both your name and roll number.';
            return false;
        }
        errorEl.textContent = '';

        const courseName = currentEnrollCard ? currentEnrollCard.dataset.name : 'this course';
        const courseId = currentEnrollCard ? currentEnrollCard.dataset.id : '';

        if (isEnrolled(courseId, student.email)) {
            errorEl.textContent = 'You are already enrolled in this course.';
            return false;
        }

        addEnrollment({ courseId, courseName, name, roll, email: student.email, status: 'in-progress', date: new Date().toISOString() });

        document.getElementById('enrollSuccessName').textContent = name;
        document.getElementById('enrollSuccessCourse').textContent = courseName;

        enrollFormStep.style.display = 'none';
        enrollSuccessStep.style.display = 'block';

        const targetPage = 'course.html?course=' + encodeURIComponent(courseId);
        const startBtn = document.getElementById('startLearningBtn');
        if (startBtn) startBtn.href = targetPage;

        const note = document.getElementById('autoRedirectNote');
        if (note) note.textContent = 'Taking you to the course in a couple of seconds...';

        setTimeout(function () {
            window.location.href = targetPage;
        }, 1800);

        return false;
    }

    enrollOverlay.addEventListener('click', function (e) {
        if (e.target === this) closeEnrollModal();
    });

    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && enrollOverlay.classList.contains('active')) closeEnrollModal();
    });
}

/* ---------------------------- course.html ---------------------------- */

export function initCoursePage() {
    // Identify the logged-in student (if any) so unit/video progress on
    // this page is scoped to their account, matching the dashboard.
    const student = loadCurrentStudent();

    let currentCourseId = null;
    let currentModule = null;

    function buildAccordion(units) {
        const wrap = document.getElementById('unitAccordion');
        wrap.innerHTML = units.map((u, i) => {
            const paras = (u.paragraphs || []).map(p => `<p>${p}</p>`).join('');
            const bullets = (u.bullets || []).map(b => `<li>${b}</li>`).join('');
            const icon = u.icon || 'circle';
            return `<div class="unit-item" id="unitItem${i}">
                <div class="unit-header" onclick="toggleAccordion(${i})">
                    <div class="unit-header-main">
                        <div class="unit-number">${i + 1}</div>
                        <div class="unit-title"><i class="fa-solid fa-${icon}"></i> Unit ${i + 1}: ${u.title}</div>
                    </div>
                    <label class="unit-checkbox-label" onclick="event.stopPropagation()">
                        <input type="checkbox" id="unitCheck${i}" onchange="handleUnitToggle(${i})">
                        Mark complete
                    </label>
                    <i class="fa-solid fa-chevron-down unit-toggle-icon" id="unitIcon${i}"></i>
                </div>
                <div class="unit-body" id="unitBody${i}">
                    ${paras}
                    <ul>${bullets}</ul>
                </div>
            </div>`;
        }).join('');
    }

    function renderTopics(topics) {
        const card = document.getElementById('sidebarTopicsCard');
        const list = document.getElementById('topicsList');
        if (!topics || topics.length === 0) {
            card.hidden = true;
            return;
        }
        card.hidden = false;
        list.innerHTML = topics.map(t => `<li><i class="fa-solid fa-circle-check"></i> ${t}</li>`).join('');
    }

    function studentEmail() {
        return student ? student.email : 'anonymous';
    }

    function renderUnitProgress(courseId, totalUnits) {
        const arr = getUnitProgress(studentEmail(), courseId, totalUnits);
        const done = arr.filter(Boolean).length;
        const pct = totalUnits > 0 ? Math.round((done / totalUnits) * 100) : 0;

        const fill = document.getElementById('unitProgressFill');
        const label = document.getElementById('unitProgressLabel');
        if (fill) fill.style.width = pct + '%';
        if (label) label.textContent = done + ' / ' + totalUnits + ' units completed';

        const pctEl = document.getElementById('unitProgressPct');
        if (pctEl) pctEl.textContent = pct + '%';

        arr.forEach((val, i) => {
            const cb = document.getElementById('unitCheck' + i);
            if (cb) cb.checked = val;
            const item = document.getElementById('unitItem' + i);
            if (item) item.classList.toggle('unit-item--done', val);
        });

        const banner = document.getElementById('courseCompleteBanner');
        if (banner) banner.hidden = !(totalUnits > 0 && done === totalUnits);
    }

    function updateVideoBadge(courseId) {
        const done = getVideoProgress(studentEmail(), courseId);
        const badge = document.getElementById('videoStatusBadge');
        if (badge) {
            badge.textContent = done ? 'Completed' : 'In Progress';
            badge.className = 'db-course-status ' + (done ? 'db-status--done' : 'db-status--progress');
        }
        const cb = document.getElementById('videoCompleteCheck');
        if (cb) cb.checked = done;

        const banner = document.getElementById('courseCompleteBanner');
        if (banner) banner.hidden = !done;
    }

    window.toggleAccordion = function (index) {
        const body = document.getElementById('unitBody' + index);
        const icon = document.getElementById('unitIcon' + index);
        if (!body) return;
        const isOpen = body.classList.contains('open');
        document.querySelectorAll('.unit-body').forEach(b => b.classList.remove('open'));
        document.querySelectorAll('.unit-toggle-icon').forEach(i => i.classList.remove('rotated'));
        if (!isOpen) {
            body.classList.add('open');
            if (icon) icon.classList.add('rotated');
        }
    };

    window.handleUnitToggle = function (index) {
        const arr = getUnitProgress(studentEmail(), currentCourseId, currentModule.units.length);
        arr[index] = !arr[index];
        saveUnitProgress(studentEmail(), currentCourseId, arr);
        renderUnitProgress(currentCourseId, currentModule.units.length);
        syncEnrollmentStatus(currentCourseId, studentEmail(), arr.every(Boolean));
    };

    window.handleVideoToggle = function () {
        const cb = document.getElementById('videoCompleteCheck');
        const isDone = !!(cb && cb.checked);
        saveVideoProgress(studentEmail(), currentCourseId, isDone);
        updateVideoBadge(currentCourseId);
        syncEnrollmentStatus(currentCourseId, studentEmail(), isDone);
    };

    function init() {
        const params = new URLSearchParams(window.location.search);
        currentCourseId = params.get('course');

        const meta = currentCourseId ? getCourseById(currentCourseId) : null;

        if (!currentCourseId || !meta) {
            document.getElementById('courseNotFound').hidden = false;
            return;
        }

        document.getElementById('pageTitle').textContent = meta.title + ' | SkillMatrix';
        document.getElementById('coursePageTitle').textContent = meta.title;
        document.getElementById('coursePageCategory').textContent = meta.category + ' \u00b7 ' + meta.level;

        document.getElementById('infoDuration').textContent = meta.duration;
        document.getElementById('infoLevel').textContent = meta.level;
        document.getElementById('infoCategory').textContent = meta.category;

        currentModule = getCourseModule(currentCourseId);

        document.getElementById('courseOverviewText').textContent =
            currentModule.overview || ('Welcome to ' + meta.title + '. Explore the material below at your own pace.');

        renderTopics(currentModule.topics);

        const isContent = currentModule.type === 'content';
        document.getElementById('courseContent').hidden = false;
        document.getElementById('contentModuleUI').hidden = !isContent;
        document.getElementById('videoModuleUI').hidden = isContent;
        document.getElementById('sidebarProgressCard').hidden = !isContent;
        document.getElementById('infoFormat').textContent = isContent ? 'Self-paced content' : 'Video course';

        if (isContent) {
            const total = currentModule.units.length;
            document.getElementById('coursePageMeta').innerHTML =
                `<i class="fa-regular fa-clock"></i> ${meta.duration} &nbsp;&middot;&nbsp; ${total} Units &nbsp;&middot;&nbsp; Self-paced content course`;
            document.getElementById('completeBannerText').textContent = "You've completed all units of this course. Great work!";
            buildAccordion(currentModule.units);
            renderUnitProgress(currentCourseId, total);
        } else {
            document.getElementById('coursePageMeta').innerHTML =
                `<i class="fa-regular fa-clock"></i> ${meta.duration} &nbsp;&middot;&nbsp; Video course`;
            document.getElementById('completeBannerText').textContent = "You've marked this course as completed. Great work!";
            document.getElementById('videoSource').src = currentModule.videoSrc;
            document.getElementById('videoPlayer').load();
            updateVideoBadge(currentCourseId);
        }
    }

    init();
}