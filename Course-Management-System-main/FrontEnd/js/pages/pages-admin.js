/* =========================================================================
   pages-admin.js — admin-dashboard.html, add-course.html, edit-course.html
========================================================================= */

import {
    getAllCourses, getAllEnrollments, markCourseDeleted, clearAllEnrollments,
    removeCourseModule, addNewCourse, slugify, saveCourseEdits, clearCourseEdits,
    getNewCourses, removeNewCourse
} from '../api.js';
import { EDIT_COURSE_CATALOG } from '../edit-course-catalog.js';
import { levelBadgeHTML, showFieldError, clearFieldError } from '../ui.js';
import { validateFields } from '../validation.js';

/* ---------------------------- admin-dashboard.html ---------------------------- */

export function initAdminDashboard() {
    window.deleteCourse = deleteCourse;
    window.resetEnrollments = resetEnrollments;

    function deleteCourse(id) {
        if (!confirm('Delete this course? This cannot be undone.')) return;
        markCourseDeleted(id);
        removeCourseModule(id); // clean up its content/units/video + progress data
        render();
    }

    function resetEnrollments() {
        if (!confirm('Clear all enrollment data? This cannot be undone.')) return;
        clearAllEnrollments();
        render();
        renderEnrollments();
    }

    function render() {
        const allCourses = getAllCourses();
        const enrollments = getAllEnrollments();

        const totalEnrolled = enrollments.length;
        const totalCompleted = enrollments.filter(e => e.status === 'completed').length;
        const pct = totalEnrolled > 0 ? Math.round((totalCompleted / totalEnrolled) * 100) : 0;

        document.getElementById('statTotalCourses').textContent = allCourses.length;
        document.getElementById('statTotalEnrolled').textContent = totalEnrolled;
        document.getElementById('statTotalCompleted').textContent = totalCompleted;
        document.getElementById('progressFill').style.width = pct + '%';
        document.getElementById('progressPct').textContent = pct + '%';

        const tbody = document.getElementById('coursesTableBody');
        if (allCourses.length === 0) {
            tbody.innerHTML = `<tr><td class="admin-table-empty" colspan="7">No courses found.</td></tr>`;
            return;
        }

        tbody.innerHTML = allCourses.map(c => `<tr>
            <td><strong>${c.title}</strong></td>
            <td>${c.category}</td>
            <td>${levelBadgeHTML(c.level)}</td>
            <td>${c.duration}</td>
            <td><i class="fa-solid fa-star" style="color:var(--accent);font-size:11px;margin-right:3px;"></i>${c.rating}</td>
            <td>
                <div class="tbl-actions">
                    <a href="edit-course-login.html?course=${c.id}" class="tbl-edit-btn">
                        <i class="fa-solid fa-pen-to-square"></i> Edit
                    </a>
                    <button class="tbl-delete-btn" onclick="deleteCourse('${c.id}')">
                        <i class="fa-solid fa-trash"></i>
                    </button>
                </div>
            </td>
        </tr>`).join('');
    }

    function renderEnrollments() {
        const enrollments = getAllEnrollments();
        const tbody = document.getElementById('enrollmentsTableBody');

        if (enrollments.length === 0) {
            tbody.innerHTML = `<tr><td class="admin-table-empty" colspan="4">No enrollments yet.</td></tr>`;
            return;
        }

        tbody.innerHTML = enrollments.map(en => {
            const done = en.status === 'completed';
            return `<tr>
                <td><strong>${en.courseName}</strong></td>
                <td>${en.name}</td>
                <td>${en.roll}</td>
                <td>
                    <span class="db-course-status ${done ? 'db-status--done' : 'db-status--progress'}">
                        ${done ? 'Completed' : 'Pending'}
                    </span>
                </td>
            </tr>`;
        }).join('');
    }

    render();
    renderEnrollments();
}

/* ---------------------------- add-course.html ---------------------------- */

export function initAddCourse() {
    const form = document.getElementById('addCourseForm');
    if (!form) return;

    form.addEventListener('submit', function (e) {
        e.preventDefault();

        const title = document.getElementById('courseName').value.trim();
        const category = document.getElementById('courseCategory').value.trim();
        const level = document.getElementById('courseLevel').value;
        const weeks = document.getElementById('courseWeeks').value.trim();
        const hours = document.getElementById('courseHours').value.trim();
        const instructor = document.getElementById('courseInstructor').value.trim();
        const rating = document.getElementById('courseRating').value.trim();
        const topics = document.getElementById('courseTopics').value.trim();
        const outcome = document.getElementById('courseOutcome').value.trim();

        const errorEl = document.getElementById('formError');

        const error = validateFields([
            { value: title, label: 'a course title', rules: ['required'] },
            { value: category, label: 'a category', rules: ['required'] },
            { value: level, label: 'a level', rules: ['required'] },
            { value: weeks, label: 'a duration in weeks', rules: ['required'] },
            { value: hours, label: 'a duration in hours', rules: ['required'] },
            { value: instructor, label: 'an instructor', rules: ['required'] },
            { value: topics, label: 'the course topics', rules: ['required'] },
            { value: outcome, label: 'a course outcome', rules: ['required'] }
        ]);

        if (error) {
            showFieldError(errorEl, error);
            errorEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
            return;
        }
        clearFieldError(errorEl);

        // Turn whatever category text the admin typed into a URL/id-safe
        // key, e.g. "Cloud Computing" -> "cloud-computing". courses.html
        // uses this to group courses into a section (creating a new
        // section automatically if this category hasn't been used before).
        const section = slugify(category);
        const id = 'new' + Date.now();

        const newCourse = {
            id, title, instructor,
            duration: weeks + ' Weeks · ' + hours + ' Hours',
            rating: rating || 'New',
            level, category, section,
            image: 'https://picsum.photos/seed/' + id + '/400/220',
            topics, prereqs: '', outcome
        };

        addNewCourse(newCourse);

        alert('Course added successfully!\n\nCourse: ' + title);
        window.location.href = 'courses.html';
    });
}

/* ---------------------------- edit-course.html ---------------------------- */

export function initEditCourse() {
    // Merge in any courses added via the Add Course form so they're editable too
    const addedCourses = getNewCourses();
    const COURSES = { ...EDIT_COURSE_CATALOG };
    addedCourses.forEach(c => {
        COURSES[c.id] = {
            title: c.title, instructor: c.instructor, duration: c.duration,
            rating: c.rating, level: c.level, section: c.section, image: c.image,
            topics: c.topics, prereqs: c.prereqs || '',
            learn: c.outcome ? [c.outcome] : []
        };
    });

    const params = new URLSearchParams(window.location.search);
    const courseId = params.get('course') || '';
    const course = COURSES[courseId];

    function addLearnItem(value = '') {
        const list = document.getElementById('ecLearnList');
        const row = document.createElement('div');
        row.className = 'ec-learn-row';
        row.innerHTML = `
            <input type="text" placeholder="e.g. Build a neural network from scratch" value="${value}">
            <button type="button" class="ec-remove-btn" onclick="this.parentElement.remove()">
                <i class="fa-solid fa-trash"></i>
            </button>`;
        list.appendChild(row);
    }
    window.addLearnItem = addLearnItem;

    if (course) {
        document.getElementById('ecPageTitle').textContent = 'Edit: ' + course.title;
        document.getElementById('ecPageSubtitle').textContent = 'Course ID: ' + courseId.toUpperCase();
        document.getElementById('ecTitle').value = course.title;
        document.getElementById('ecInstructor').value = course.instructor;
        document.getElementById('ecDuration').value = course.duration;
        document.getElementById('ecRating').value = course.rating;
        document.getElementById('ecTopics').value = course.topics;
        document.getElementById('ecPrereqs').value = course.prereqs;
        document.getElementById('ecImage').value = course.image;
        document.getElementById('ecImgPreview').src = course.image;
        document.getElementById('ecImgPreview').style.display = 'block';
        document.getElementById('ecImgPlaceholder').style.display = 'none';

        const lvlSel = document.getElementById('ecLevel');
        for (const o of lvlSel.options) { if (o.value === course.level) o.selected = true; }

        const secSel = document.getElementById('ecSection');
        for (const o of secSel.options) { if (o.value === course.section) o.selected = true; }

        course.learn.forEach(item => addLearnItem(item));

        document.getElementById('ecDeleteBtn').hidden = false;
    } else {
        document.getElementById('ecPageTitle').textContent = 'Add New Course';
        document.getElementById('ecPageSubtitle').textContent = 'Fill in the details below.';
        addLearnItem();
    }

    document.getElementById('ecImage').addEventListener('input', function () {
        const preview = document.getElementById('ecImgPreview');
        const placeholder = document.getElementById('ecImgPlaceholder');
        if (this.value) {
            preview.src = this.value;
            preview.style.display = 'block';
            placeholder.style.display = 'none';
        } else {
            preview.style.display = 'none';
            placeholder.style.display = 'flex';
        }
    });

    document.getElementById('editCourseForm').addEventListener('submit', function (e) {
        e.preventDefault();

        const learnItems = [...document.querySelectorAll('.ec-learn-row input')]
            .map(i => i.value.trim()).filter(Boolean);

        const updated = {
            title: document.getElementById('ecTitle').value.trim(),
            instructor: document.getElementById('ecInstructor').value.trim(),
            duration: document.getElementById('ecDuration').value.trim(),
            rating: document.getElementById('ecRating').value.trim(),
            level: document.getElementById('ecLevel').value,
            section: document.getElementById('ecSection').value,
            image: document.getElementById('ecImage').value.trim(),
            topics: document.getElementById('ecTopics').value.trim(),
            prereqs: document.getElementById('ecPrereqs').value.trim(),
            learn: learnItems
        };

        if (courseId) saveCourseEdits(courseId, updated);

        alert('Changes saved successfully!\n\nCourse: ' + updated.title);
        window.location.href = 'courses.html';
    });

    document.getElementById('ecDeleteBtn').addEventListener('click', function () {
        if (!courseId) return;

        const courseTitle = document.getElementById('ecTitle').value.trim() || courseId.toUpperCase();
        const confirmed = confirm('Are you sure you want to delete "' + courseTitle + '"?\n\nThis action cannot be undone.');
        if (!confirmed) return;

        markCourseDeleted(courseId);
        clearCourseEdits(courseId);
        removeNewCourse(courseId);

        alert('Course deleted successfully.');
        window.location.href = 'courses.html';
    });
}
