/* =========================================================================
   pages-auth.js — stu-login, stu-register, forget-password,
   admin-login / add-course-edit / edit-course-login (all three are just
   "verify admin credentials, then forward" gates)
========================================================================= */

import { loginStudent, registerStudent, verifyAdminLogin } from '../auth.js';
import { validateFields, passwordsMatch } from '../validation.js';

export function initStuLogin() {
    const form = document.getElementById('studentLoginForm');
    if (!form) return;

    form.addEventListener('submit', function (e) {
        e.preventDefault();

        const name = document.getElementById('studentName').value.trim();
        const email = document.getElementById('studentEmail').value.trim();
        const password = document.getElementById('studentPassword').value.trim();

        const error = validateFields([
            { value: name, label: 'your name', rules: ['required'] },
            { value: email, label: 'email address', rules: ['required', 'email'] },
            { value: password, label: 'your password', rules: ['required'] }
        ]);
        if (error) {
            alert(error);
            return;
        }

        try {
            loginStudent({ name, email, password });
            window.location.href = 'courses.html';
        } catch (err) {
            alert(err.message);
            if (err.code === 'NOT_REGISTERED') {
                window.location.href = 'stu-register.html';
            }
        }
    });
}

export function initStuRegister() {
    const form = document.getElementById('studentRegisterForm');
    if (!form) return;

    form.addEventListener('submit', function (e) {
        e.preventDefault();

        const username = document.getElementById('studentUsername').value.trim();
        const name = document.getElementById('studentName').value.trim();
        const email = document.getElementById('studentEmail').value.trim();
        const department = document.getElementById('studentDepartment').value.trim();
        const password = document.getElementById('studentPassword').value;
        const confirmPassword = document.getElementById('studentConfirmPassword').value;

        const error = validateFields([
            { value: username, label: 'a username', rules: ['required'] },
            { value: name, label: 'your full name', rules: ['required'] },
            { value: email, label: 'email address', rules: ['required', 'email'] },
            { value: department, label: 'your department', rules: ['required'] },
            { value: password, label: 'a password', rules: ['required'] }
        ]) || (!passwordsMatch(password, confirmPassword) ? 'Passwords do not match.' : '');

        if (error) {
            alert(error);
            return;
        }

        try {
            registerStudent({ name, email, password });
            window.location.href = 'courses.html';
        } catch (err) {
            alert(err.message);
        }
    });
}

export function initForgetPassword() {
    const form = document.getElementById('forgotPasswordForm');
    if (!form) return;

    form.addEventListener('submit', function (e) {
        e.preventDefault();
        const email = document.getElementById('recoveryEmail').value.trim();

        const error = validateFields([
            { value: email, label: 'a valid email address', rules: ['required', 'email'] }
        ]);
        if (error) {
            alert(error);
            return;
        }

        // No backend to actually send an email — confirm and send the
        // student back to login, same no-backend pattern as everywhere else.
        alert('If an account exists for ' + email + ', a reset link has been sent.');
        window.location.href = 'stu-login.html';
    });
}

export function initAdminLogin() {
    verifyAdminLogin('verifyLoginForm', 'adminEmail', 'adminPassword', 'admin-dashboard.html');
}

export function initAddCourseEdit() {
    verifyAdminLogin('verifyLoginForm', 'adminEmail', 'adminPassword', 'add-course.html');
}

export function initEditCourseLogin() {
    const params = new URLSearchParams(window.location.search);
    const courseId = params.get('course') || '';
    verifyAdminLogin('verifyLoginForm', 'adminEmail', 'adminPassword', function () {
        return 'edit-course.html?course=' + courseId;
    });
}