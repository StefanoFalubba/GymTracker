// Utility Functions

// Show loading overlay
export function showLoading() {
    document.getElementById('loading-overlay').classList.remove('hidden');
}

// Hide loading overlay
export function hideLoading() {
    document.getElementById('loading-overlay').classList.add('hidden');
}

// Show toast notification
export function showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;

    const icon = type === 'success' ? 'check-circle' :
        type === 'error' ? 'alert-circle' :
            'info';

    toast.innerHTML = `
        <i data-lucide="${icon}"></i>
        <span>${message}</span>
    `;

    container.appendChild(toast);
    lucide.createIcons();

    setTimeout(() => {
        toast.style.animation = 'slideInRight 0.3s ease-out reverse';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Format date
export function formatDate(date) {
    const d = new Date(date);
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return d.toLocaleDateString('en-US', options);
}

// Format time
export function formatTime(date) {
    const d = new Date(date);
    return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
}

// Format duration (seconds to MM:SS)
export function formatDuration(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}

// Calculate time ago
export function timeAgo(date) {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);

    const intervals = {
        year: 31536000,
        month: 2592000,
        week: 604800,
        day: 86400,
        hour: 3600,
        minute: 60
    };

    for (const [unit, secondsInUnit] of Object.entries(intervals)) {
        const interval = Math.floor(seconds / secondsInUnit);
        if (interval >= 1) {
            return `${interval} ${unit}${interval > 1 ? 's' : ''} ago`;
        }
    }

    return 'Just now';
}

// Debounce function
export function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Generate UUID
export function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

// Calculate 1RM (One Rep Max) using Epley formula
export function calculate1RM(weight, reps) {
    if (reps === 1) return weight;
    return weight * (1 + reps / 30);
}

// Calculate total volume (sets × reps × weight)
export function calculateVolume(sets) {
    return sets.reduce((total, set) => {
        return total + (set.reps * set.weight);
    }, 0);
}

// Get current user from localStorage
export function getCurrentUser() {
    const userStr = localStorage.getItem('currentUser');
    return userStr ? JSON.parse(userStr) : null;
}

// Save current user to localStorage
export function saveCurrentUser(user) {
    localStorage.setItem('currentUser', JSON.stringify(user));
}

// Clear current user from localStorage
export function clearCurrentUser() {
    localStorage.removeItem('currentUser');
}

// Get theme from localStorage
export function getTheme() {
    return localStorage.getItem('theme') || 'light';
}

// Set theme
export function setTheme(theme) {
    localStorage.setItem('theme', theme);
    document.documentElement.setAttribute('data-theme', theme);
}

// Apply theme colors
export function applyThemeColors(primaryHue, accentHue) {
    const root = document.documentElement;
    if (primaryHue !== undefined) {
        root.style.setProperty('--primary-hue', primaryHue);
    }
    if (accentHue !== undefined) {
        root.style.setProperty('--accent-hue', accentHue);
    }
}

// Validate email
export function isValidEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

// Sanitize HTML to prevent XSS
export function sanitizeHTML(str) {
    const temp = document.createElement('div');
    temp.textContent = str;
    return temp.innerHTML;
}

// Sort array by property
export function sortBy(array, property, ascending = true) {
    return array.sort((a, b) => {
        const aVal = a[property];
        const bVal = b[property];

        if (aVal < bVal) return ascending ? -1 : 1;
        if (aVal > bVal) return ascending ? 1 : -1;
        return 0;
    });
}

// Group array by property
export function groupBy(array, property) {
    return array.reduce((groups, item) => {
        const key = item[property];
        if (!groups[key]) {
            groups[key] = [];
        }
        groups[key].push(item);
        return groups;
    }, {});
}

// Deep clone object
export function deepClone(obj) {
    return JSON.parse(JSON.stringify(obj));
}

// Check if object is empty
export function isEmpty(obj) {
    return Object.keys(obj).length === 0;
}

// Capitalize first letter
export function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

// Convert kg to lbs
export function kgToLbs(kg) {
    return kg * 2.20462;
}

// Convert lbs to kg
export function lbsToKg(lbs) {
    return lbs / 2.20462;
}

// Format weight based on user preference
export function formatWeight(weight, units = 'kg') {
    const value = units === 'lbs' ? kgToLbs(weight) : weight;
    return `${value.toFixed(1)} ${units}`;
}

// Parse weight to kg (always store in kg)
export function parseWeight(weight, units = 'kg') {
    return units === 'lbs' ? lbsToKg(weight) : weight;
}
