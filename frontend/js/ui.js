/* =========================================================================
   ui.js — reusable UI helpers
   Small DOM-rendering helpers shared across pages: badges, empty states,
   the nav auth area, date/time formatting, and inline form-error display.
   Nothing here touches localStorage — it only ever reads what it's given
   and writes to the DOM.
========================================================================= */

export function levelBadgeHTML(level) {
    const cls = level === 'Beginner' ? 'beg' : level === 'Intermediate' ? 'int' : 'adv';
    return `<span class="tbl-badge tbl-badge--${cls}">${level}</span>`;
}

export function courseBadgeClass(level) {
    return level === 'Intermediate' ? 'c-badge c-badge-inter'
         : level === 'Advanced'     ? 'c-badge c-badge-adv'
         : 'c-badge';
}

export function emptyStateHTML(icon, title, msg, btnText, btnHref = 'courses.html') {
    return `<div class="db-empty-state">
        <div class="db-empty-icon"><i class="fa-solid fa-${icon}"></i></div>
        <h3>${title}</h3>
        <p>${msg}</p>
        <a href="${btnHref}" class="db-empty-btn">${btnText}</a>
    </div>`;
}

// Shows/clears a plain-text error under a form field or in a dedicated
// error element. Pass either an element or an element id.
export function showFieldError(el, message) {
    const node = typeof el === 'string' ? document.getElementById(el) : el;
    if (!node) return;
    node.textContent = message;
    if ('hidden' in node) node.hidden = !message;
}

export function clearFieldError(el) {
    showFieldError(el, '');
}

export function formatDateLong(iso) {
    try {
        return new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    } catch (e) {
        return 'N/A';
    }
}

export function timeAgo(iso) {
    if (!iso) return 'New';
    const then = new Date(iso).getTime();
    if (isNaN(then)) return 'New';
    const diffMs = Date.now() - then;
    const mins = Math.floor(diffMs / 60000);
    const hours = Math.floor(diffMs / 3600000);
    const days = Math.floor(diffMs / 86400000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return mins + (mins === 1 ? ' minute ago' : ' minutes ago');
    if (hours < 24) return hours + (hours === 1 ? ' hour ago' : ' hours ago');
    if (days < 30) return days + (days === 1 ? ' day ago' : ' days ago');
    return formatDateLong(iso);
}

// Small SVG completion ring (used on stu-dashboard.html).
export function renderProgressRing(containerId, pct) {
    const el = document.getElementById(containerId);
    if (!el) return;
    const size = 108, stroke = 12, r = (size - stroke) / 2, c = 2 * Math.PI * r;
    const offset = c - (pct / 100) * c;
    el.innerHTML = `
        <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
            <circle cx="${size/2}" cy="${size/2}" r="${r}" fill="none" stroke="var(--border)" stroke-width="${stroke}" />
            <circle cx="${size/2}" cy="${size/2}" r="${r}" fill="none" stroke="var(--accent)" stroke-width="${stroke}"
                stroke-linecap="round" stroke-dasharray="${c}" stroke-dashoffset="${offset}"
                transform="rotate(-90 ${size/2} ${size/2})" />
            <text x="${size/2}" y="${size/2 + 7}" text-anchor="middle" font-size="22" font-weight="700" fill="var(--navy)" font-family="Inter, sans-serif">${pct}%</text>
        </svg>`;
}

// Renders the "Logout (name)" link into the navbar and swaps the
// Notifications nav tab for a Student Dashboard link, once a student
// session is detected. Used on pages a student may or may not be
// logged in on (courses.html).
export function renderNavAuth(student) {
    const area = document.getElementById('navAuthArea');
    if (!area || !student) return;
    area.innerHTML = `<a href="#" class="login-btn" id="navLogoutBtn">
        <i class="fa-solid fa-right-from-bracket"></i> Logout (${student.name})
    </a>`;
    const notifItem = document.getElementById('notifNavItem');
    if (notifItem) {
        notifItem.innerHTML = '<a href="stu-dashboard.html">Student Dashboard</a>';
    }
}