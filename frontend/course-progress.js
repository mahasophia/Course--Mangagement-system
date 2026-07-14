/* ===========================================================
   Shared progress-tracking helpers used by course-page.html.
   Requires course-modules.js to be loaded first (for
   getCourseModule / ensureCourseModule).

   IMPORTANT: progress is scoped per-student (by email), not just
   by courseId. Without this, one student's completed progress
   would leak into every other student's view of the same course,
   since localStorage is shared across the whole browser.
=========================================================== */

// Relies on `currentStudent` already being set as a global by the
// page's own inline script (same pattern used elsewhere in the app).
function progressKey(prefix, courseId) {
    const email = (typeof currentStudent !== 'undefined' && currentStudent) ? currentStudent.email : 'anonymous';
    return prefix + '_' + email + '_' + courseId;
}

// ---------- CONTENT / UNIT-BASED COURSES ----------

function getUnitProgress(courseId, totalUnits) {
    const raw = localStorage.getItem(progressKey('unitProgress', courseId));
    if (raw) {
        try {
            const arr = JSON.parse(raw);
            if (Array.isArray(arr) && arr.length === totalUnits) return arr;
        } catch (e) { /* fall through to default */ }
    }
    return new Array(totalUnits).fill(false);
}

function saveUnitProgress(courseId, arr) {
    localStorage.setItem(progressKey('unitProgress', courseId), JSON.stringify(arr));
}

function toggleAccordion(index) {
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
}

function toggleUnit(courseId, index, totalUnits) {
    const arr = getUnitProgress(courseId, totalUnits);
    arr[index] = !arr[index];
    saveUnitProgress(courseId, arr);
    renderUnitProgress(courseId, totalUnits);
    syncEnrollmentStatus(courseId, arr.every(Boolean));
}

function renderUnitProgress(courseId, totalUnits) {
    const arr = getUnitProgress(courseId, totalUnits);
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

// ---------- VIDEO-BASED COURSES ----------

function getVideoProgress(courseId) {
    return localStorage.getItem(progressKey('videoProgress', courseId)) === 'true';
}

function toggleVideoComplete(courseId) {
    const cb = document.getElementById('videoCompleteCheck');
    const isDone = !!(cb && cb.checked);
    localStorage.setItem(progressKey('videoProgress', courseId), isDone ? 'true' : 'false');
    updateVideoBadge(courseId);
    syncEnrollmentStatus(courseId, isDone);
}

function updateVideoBadge(courseId) {
    const done = getVideoProgress(courseId);
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

// ---------- SHARED: keep the enrollments list in sync ----------

function syncEnrollmentStatus(courseId, isComplete) {
    const enrollments = JSON.parse(localStorage.getItem('enrollments') || '[]');
    const email = (typeof currentStudent !== 'undefined' && currentStudent) ? currentStudent.email : null;
    let changed = false;
    const newStatus = isComplete ? 'completed' : 'in-progress';
    enrollments.forEach(en => {
        // Only touch this student's own enrollment record for this course —
        // otherwise one student finishing a course would flip the status
        // for every other student enrolled in it too.
        if (en.courseId === courseId && en.email === email && en.status !== newStatus) {
            en.status = newStatus;
            if (isComplete && !en.completedDate) {
                en.completedDate = new Date().toISOString();
            }
            changed = true;
        }
    });
    if (changed) localStorage.setItem('enrollments', JSON.stringify(enrollments));
}

// ---------- OVERALL PROGRESS % (used by stu-dashboard.html) ----------
// Works for any course, known or newly-added, using the dynamic module.
function getCourseProgressPercent(courseId) {
    const module = getCourseModule(courseId);
    if (module.type === 'video') {
        return getVideoProgress(courseId) ? 100 : 0;
    }
    const total = module.units ? module.units.length : 0;
    if (total === 0) return 0;
    const arr = getUnitProgress(courseId, total);
    return Math.round((arr.filter(Boolean).length / total) * 100);
}