/* =========================================================================
   validation.js — reusable form validation
   Small, composable checks used by every form in the app (login,
   register, forgot-password, add/edit course). Each returns true/false;
   pairing them with showFieldError()/clearFieldError() from ui.js keeps
   the actual DOM wiring in one place per form.
========================================================================= */

export function isRequired(value) {
    return !!(value && value.toString().trim().length > 0);
}

export function isValidEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test((value || '').trim());
}

export function minLength(value, len) {
    return (value || '').length >= len;
}

export function passwordsMatch(a, b) {
    return a === b;
}

// Validates a set of { value, rules: [...] } fields in one pass and
// returns the first error message, or '' if everything passed.
// Example:
//   validateFields([
//     { value: name,  label: 'name',  rules: ['required'] },
//     { value: email, label: 'a valid email address', rules: ['required', 'email'] }
//   ]);
export function validateFields(fields) {
    for (const field of fields) {
        for (const rule of field.rules) {
            if (rule === 'required' && !isRequired(field.value)) {
                return `Please enter ${field.label}.`;
            }
            if (rule === 'email' && isRequired(field.value) && !isValidEmail(field.value)) {
                return `Please enter a valid ${field.label}.`;
            }
        }
    }
    return '';
}