// Settings Page Module
import { db } from './supabase.js';
import { getCurrentUser, showToast, showLoading, hideLoading, setTheme, getTheme, applyThemeColors } from './utils.js';

export async function renderSettings(container) {
    showLoading();

    try {
        const user = getCurrentUser();
        const [profile, settings] = await Promise.all([
            db.getUserProfile(user.id),
            db.getUserSettings(user.id)
        ]);

        const currentTheme = getTheme();

        container.innerHTML = `
            <div class="page-header">
                <h1 class="page-title">Settings</h1>
                <p class="page-subtitle">Customize your experience</p>
            </div>
            
            <!-- User Profile -->
            <div class="card mb-4">
                <div class="card-header">
                    <h2 class="card-title">
                        <i data-lucide="user"></i>
                        Profile Information
                    </h2>
                </div>
                
                <form id="profile-form">
                    <div class="grid grid-2 gap-3">
                        <div class="form-group">
                            <label for="profile-name">Name</label>
                            <input type="text" id="profile-name" value="${profile?.name || ''}" placeholder="Your name">
                        </div>
                        
                        <div class="form-group">
                            <label for="profile-email">Email</label>
                            <input type="email" id="profile-email" value="${user.email || ''}" disabled>
                        </div>
                        
                        <div class="form-group">
                            <label for="profile-age">Age</label>
                            <input type="number" id="profile-age" value="${profile?.age || ''}" placeholder="25">
                        </div>
                        
                        <div class="form-group">
                            <label for="profile-weight">Weight (kg)</label>
                            <input type="number" id="profile-weight" value="${profile?.weight || ''}" step="0.1" placeholder="70">
                        </div>
                        
                        <div class="form-group">
                            <label for="profile-height">Height (cm)</label>
                            <input type="number" id="profile-height" value="${profile?.height || ''}" placeholder="175">
                        </div>
                        
                        <div class="form-group">
                            <label for="profile-goals">Fitness Goals</label>
                            <input type="text" id="profile-goals" value="${profile?.goals || ''}" placeholder="Build muscle, lose fat...">
                        </div>
                    </div>
                    
                    <button type="submit" class="btn btn-primary mt-3">
                        <i data-lucide="save"></i>
                        Save Profile
                    </button>
                </form>
            </div>
            
            <!-- Theme Settings -->
            <div class="card mb-4">
                <div class="card-header">
                    <h2 class="card-title">
                        <i data-lucide="palette"></i>
                        Theme Customization
                    </h2>
                </div>
                
                <div class="form-group">
                    <label>Dark Mode</label>
                    <div class="flex gap-2">
                        <button type="button" class="btn ${currentTheme === 'light' ? 'btn-primary' : 'btn-secondary'}" id="theme-light">
                            <i data-lucide="sun"></i>
                            Light
                        </button>
                        <button type="button" class="btn ${currentTheme === 'dark' ? 'btn-primary' : 'btn-secondary'}" id="theme-dark">
                            <i data-lucide="moon"></i>
                            Dark
                        </button>
                    </div>
                </div>
                
                <div class="grid grid-2 gap-3 mt-3">
                    <div class="form-group">
                        <label for="primary-hue">Primary Color Hue (0-360)</label>
                        <input type="range" id="primary-hue" min="0" max="360" value="${settings?.theme_primary_hue || 260}">
                        <div style="margin-top: var(--spacing-sm); padding: var(--spacing-md); background: hsl(var(--primary-hue), var(--primary-sat), var(--primary-light)); border-radius: var(--radius-md);"></div>
                    </div>
                    
                    <div class="form-group">
                        <label for="accent-hue">Accent Color Hue (0-360)</label>
                        <input type="range" id="accent-hue" min="0" max="360" value="${settings?.theme_accent_hue || 340}">
                        <div style="margin-top: var(--spacing-sm); padding: var(--spacing-md); background: hsl(var(--accent-hue), var(--accent-sat), var(--accent-light)); border-radius: var(--radius-md);"></div>
                    </div>
                </div>
                
                <button type="button" class="btn btn-primary mt-3" id="save-theme-btn">
                    <i data-lucide="save"></i>
                    Save Theme
                </button>
            </div>
            
            <!-- General Settings -->
            <div class="card mb-4">
                <div class="card-header">
                    <h2 class="card-title">
                        <i data-lucide="settings"></i>
                        General Settings
                    </h2>
                </div>
                
                <form id="general-settings-form">
                    <div class="form-group">
                        <label for="units">Weight Units</label>
                        <select id="units">
                            <option value="kg" ${settings?.units === 'kg' ? 'selected' : ''}>Kilograms (kg)</option>
                            <option value="lbs" ${settings?.units === 'lbs' ? 'selected' : ''}>Pounds (lbs)</option>
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label for="default-rest-time">Default Rest Time (seconds)</label>
                        <input type="number" id="default-rest-time" value="${settings?.default_rest_time || 90}" min="30" step="15">
                    </div>
                    
                    <div class="form-group">
                        <label>
                            <input type="checkbox" id="rest-timer-sound" ${settings?.rest_timer_sound !== false ? 'checked' : ''}>
                            Enable rest timer sound
                        </label>
                    </div>
                    
                    <button type="submit" class="btn btn-primary mt-3">
                        <i data-lucide="save"></i>
                        Save Settings
                    </button>
                </form>
            </div>
            
            <!-- Data Management -->
            <div class="card">
                <div class="card-header">
                    <h2 class="card-title">
                        <i data-lucide="database"></i>
                        Data Management
                    </h2>
                </div>
                
                <div class="flex gap-2">
                    <button type="button" class="btn btn-secondary" id="export-data-btn">
                        <i data-lucide="download"></i>
                        Export Data
                    </button>
                    <button type="button" class="btn btn-danger" id="clear-data-btn">
                        <i data-lucide="trash-2"></i>
                        Clear All Data
                    </button>
                </div>
            </div>
        `;

        setupSettingsListeners();

    } catch (error) {
        console.error('Error rendering settings:', error);
        showToast('Error loading settings', 'error');
    } finally {
        hideLoading();
    }
}

function setupSettingsListeners() {
    // Profile form
    document.getElementById('profile-form')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        await saveProfile();
    });

    // Theme toggle
    document.getElementById('theme-light')?.addEventListener('click', () => {
        setTheme('light');
        showToast('Light theme activated', 'success');
        renderSettings(document.getElementById('page-content'));
        lucide.createIcons();
    });

    document.getElementById('theme-dark')?.addEventListener('click', () => {
        setTheme('dark');
        showToast('Dark theme activated', 'success');
        renderSettings(document.getElementById('page-content'));
        lucide.createIcons();
    });

    // Color pickers
    document.getElementById('primary-hue')?.addEventListener('input', (e) => {
        applyThemeColors(e.target.value, undefined);
    });

    document.getElementById('accent-hue')?.addEventListener('input', (e) => {
        applyThemeColors(undefined, e.target.value);
    });

    // Save theme
    document.getElementById('save-theme-btn')?.addEventListener('click', async () => {
        await saveTheme();
    });

    // General settings form
    document.getElementById('general-settings-form')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        await saveGeneralSettings();
    });

    // Export data
    document.getElementById('export-data-btn')?.addEventListener('click', exportData);

    // Clear data
    document.getElementById('clear-data-btn')?.addEventListener('click', () => {
        if (confirm('Are you sure you want to clear ALL data? This cannot be undone!')) {
            if (confirm('This will delete all workouts, training cards, and settings. Are you ABSOLUTELY sure?')) {
                clearAllData();
            }
        }
    });
}

async function saveProfile() {
    showLoading();

    try {
        const user = getCurrentUser();
        const profile = {
            name: document.getElementById('profile-name').value,
            age: parseInt(document.getElementById('profile-age').value) || null,
            weight: parseFloat(document.getElementById('profile-weight').value) || null,
            height: parseInt(document.getElementById('profile-height').value) || null,
            goals: document.getElementById('profile-goals').value
        };

        await db.upsertUserProfile(user.id, profile);
        showToast('Profile updated successfully!', 'success');

    } catch (error) {
        console.error('Error saving profile:', error);
        showToast('Error saving profile', 'error');
    } finally {
        hideLoading();
    }
}

async function saveTheme() {
    showLoading();

    try {
        const user = getCurrentUser();
        const primaryHue = document.getElementById('primary-hue').value;
        const accentHue = document.getElementById('accent-hue').value;

        await db.upsertUserSettings(user.id, {
            theme_primary_hue: parseInt(primaryHue),
            theme_accent_hue: parseInt(accentHue)
        });

        showToast('Theme saved successfully!', 'success');

    } catch (error) {
        console.error('Error saving theme:', error);
        showToast('Error saving theme', 'error');
    } finally {
        hideLoading();
    }
}

async function saveGeneralSettings() {
    showLoading();

    try {
        const user = getCurrentUser();
        const settings = {
            units: document.getElementById('units').value,
            default_rest_time: parseInt(document.getElementById('default-rest-time').value),
            rest_timer_sound: document.getElementById('rest-timer-sound').checked
        };

        await db.upsertUserSettings(user.id, settings);
        showToast('Settings saved successfully!', 'success');

    } catch (error) {
        console.error('Error saving settings:', error);
        showToast('Error saving settings', 'error');
    } finally {
        hideLoading();
    }
}

async function exportData() {
    showLoading();

    try {
        const user = getCurrentUser();

        const [profile, workouts, trainingCards, exercises, settings] = await Promise.all([
            db.getUserProfile(user.id),
            db.getWorkouts(user.id),
            db.getTrainingCards(user.id),
            db.getExercises(user.id),
            db.getUserSettings(user.id)
        ]);

        const exportData = {
            exportDate: new Date().toISOString(),
            profile,
            workouts,
            trainingCards,
            exercises,
            settings
        };

        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `gymtracker-export-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);

        showToast('Data exported successfully!', 'success');

    } catch (error) {
        console.error('Error exporting data:', error);
        showToast('Error exporting data', 'error');
    } finally {
        hideLoading();
    }
}

async function clearAllData() {
    showLoading();

    try {
        const user = getCurrentUser();

        // This would require implementing delete all functions in the database
        // For now, just show a message
        showToast('Clear data functionality coming soon', 'info');

    } catch (error) {
        console.error('Error clearing data:', error);
        showToast('Error clearing data', 'error');
    } finally {
        hideLoading();
    }
}
