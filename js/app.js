// Main Application Controller
import { initAuth, logout } from './auth.js';
import { setTheme, getTheme } from './utils.js';
import { renderDashboard } from './dashboard.js';
import { renderTrainingCards } from './training-cards.js';
import { renderWorkout } from './workout.js';
import { renderHistory } from './history.js';
import { renderStatistics } from './statistics.js';
import { renderSettings } from './settings.js';

// Current page state
let currentPage = 'dashboard';

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    // Apply saved theme
    setTheme(getTheme());

    // Initialize Lucide icons
    lucide.createIcons();

    // Initialize authentication
    initAuth();

    // Setup navigation
    setupNavigation();

    // Setup logout button
    document.getElementById('logout-btn')?.addEventListener('click', logout);

    // Listen for app ready event (after auth)
    window.addEventListener('app-ready', () => {
        // Load dashboard by default
        navigateTo('dashboard');

        // Reinitialize icons after content load
        lucide.createIcons();
    });
});

// Setup navigation
function setupNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const page = link.dataset.page;
            navigateTo(page);
        });
    });

    // Handle browser back/forward
    window.addEventListener('popstate', (e) => {
        if (e.state && e.state.page) {
            navigateTo(e.state.page, false);
        }
    });
}

// Navigate to page
export function navigateTo(page, pushState = true) {
    if (currentPage === page) return;

    currentPage = page;

    // Update active nav link
    document.querySelectorAll('.nav-link').forEach(link => {
        if (link.dataset.page === page) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });

    // Update URL
    if (pushState) {
        history.pushState({ page }, '', `#${page}`);
    }

    // Render page
    renderPage(page);
}

// Render page content
async function renderPage(page) {
    const pageContent = document.getElementById('page-content');

    // Clear current content
    pageContent.innerHTML = '';

    try {
        switch (page) {
            case 'dashboard':
                await renderDashboard(pageContent);
                break;
            case 'training-cards':
                await renderTrainingCards(pageContent);
                break;
            case 'workout':
                await renderWorkout(pageContent);
                break;
            case 'history':
                await renderHistory(pageContent);
                break;
            case 'statistics':
                await renderStatistics(pageContent);
                break;
            case 'settings':
                await renderSettings(pageContent);
                break;
            default:
                pageContent.innerHTML = '<div class="empty-state"><h3>Page not found</h3></div>';
        }

        // Reinitialize Lucide icons
        lucide.createIcons();

    } catch (error) {
        console.error('Error rendering page:', error);
        pageContent.innerHTML = `
            <div class="empty-state">
                <i data-lucide="alert-circle"></i>
                <h3>Error loading page</h3>
                <p>${error.message}</p>
            </div>
        `;
        lucide.createIcons();
    }
}

// Export current page getter
export function getCurrentPage() {
    return currentPage;
}
