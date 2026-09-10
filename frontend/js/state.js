/* =========================================================================
   state.js — centralized application state
   Single place holding state shared across a page's lifetime: the logged
   in student (mirrors localStorage but avoids every module re-reading it),
   plus small bits of transient UI state a couple of pages need (which
   course is open, which card the enroll modal belongs to).
========================================================================= */

const state = {
    currentStudent: null,
    selectedCourseId: null,
    enrollTargetCard: null
};

export function setCurrentStudent(student) {
    state.currentStudent = student;
}

export function getCurrentStudentState() {
    return state.currentStudent;
}

export function setSelectedCourseId(id) {
    state.selectedCourseId = id;
}

export function getSelectedCourseId() {
    return state.selectedCourseId;
}

export function setEnrollTargetCard(card) {
    state.enrollTargetCard = card;
}

export function getEnrollTargetCard() {
    return state.enrollTargetCard;
}