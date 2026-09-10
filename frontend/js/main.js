/* =========================================================================
   main.js — entry point / router
   Every page loads this one module (<script type="module" src="js/main.js">);
   which page-specific init runs is decided from <body data-page="...">,
   same pattern as the old app.js, just split across real ES modules now.
========================================================================= */

import { initStuLogin, initStuRegister, initForgetPassword, initAdminLogin, initAddCourseEdit, initEditCourseLogin } from './pages/pages-auth.js';
import { initStuDashboard, initNotifications, initCertificate } from './pages/pages-student.js';
import { initCourses, initCoursePage } from './pages/pages-courses.js';
import { initAdminDashboard, initAddCourse, initEditCourse } from './pages/pages-admin.js';

const PAGE_INITIALIZERS = {
    'stu-login': initStuLogin,
    'stu-register': initStuRegister,
    'forget-password': initForgetPassword,
    'stu-dashboard': initStuDashboard,
    'notifications': initNotifications,
    'certificate': initCertificate,
    'courses': initCourses,
    'course': initCoursePage,
    'admin-dashboard': initAdminDashboard,
    'admin-login': initAdminLogin,
    'add-course-edit': initAddCourseEdit,
    'edit-course-login': initEditCourseLogin,
    'add-course': initAddCourse,
    'edit-course': initEditCourse
};

function run() {
    const page = document.body.getAttribute('data-page');
    const init = PAGE_INITIALIZERS[page];
    if (init) init();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', run);
} else {
    run();
}