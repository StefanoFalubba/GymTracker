// History Page Module
import { db } from './supabase.js';
import { getCurrentUser, showToast, showLoading, hideLoading, formatDate, formatDuration } from './utils.js';

let workouts = [];

export async function renderHistory(container) {
    showLoading();

    try {
        const user = getCurrentUser();
        workouts = await db.getWorkouts(user.id);

        container.innerHTML = `
            <div class="page-header">
                <h1 class="page-title">Workout History</h1>
                <p class="page-subtitle">View all your past workouts</p>
            </div>
            
            <!-- Filters -->
            <div class="card mb-4">
                <div class="grid grid-3 gap-2">
                    <div class="form-group" style="margin: 0;">
                        <label>Start Date</label>
                        <input type="date" id="filter-start-date">
                    </div>
                    <div class="form-group" style="margin: 0;">
                        <label>End Date</label>
                        <input type="date" id="filter-end-date">
                    </div>
                    <div style="display: flex; align-items: flex-end;">
                        <button class="btn btn-secondary btn-block" id="apply-filters-btn">
                            <i data-lucide="filter"></i>
                            Apply Filters
                        </button>
                    </div>
                </div>
            </div>
            
            <!-- Workouts List -->
            <div id="workouts-list">
                ${renderWorkoutsList()}
            </div>
        `;

        setupHistoryListeners();

    } catch (error) {
        console.error('Error rendering history:', error);
        showToast('Error loading history', 'error');
    } finally {
        hideLoading();
    }
}

function renderWorkoutsList() {
    if (workouts.length === 0) {
        return `
            <div class="card">
                <div class="empty-state">
                    <i data-lucide="calendar"></i>
                    <h3>No Workouts Yet</h3>
                    <p>Start your first workout to see it here</p>
                </div>
            </div>
        `;
    }

    return `
        <div style="display: flex; flex-direction: column; gap: var(--spacing-lg);">
            ${workouts.map(workout => {
        const totalSets = workout.workout_exercises?.reduce((sum, ex) =>
            sum + (ex.workout_sets?.length || 0), 0) || 0;
        const totalVolume = workout.workout_exercises?.reduce((sum, ex) =>
            sum + (ex.workout_sets?.reduce((s, set) => s + (set.reps * set.weight), 0) || 0), 0) || 0;

        return `
                    <div class="card">
                        <div class="card-header">
                            <div>
                                <h3 class="card-title">${workout.training_cards?.name || 'Custom Workout'}</h3>
                                <p style="color: var(--text-secondary); font-size: var(--font-size-sm);">
                                    ${formatDate(workout.date)} ${workout.duration ? `• ${formatDuration(workout.duration)}` : ''}
                                </p>
                            </div>
                            <button class="btn btn-ghost btn-sm delete-workout-btn" data-workout-id="${workout.id}">
                                <i data-lucide="trash-2"></i>
                            </button>
                        </div>
                        
                        <div class="grid grid-3 mb-3">
                            <div>
                                <div style="font-size: var(--font-size-2xl); font-weight: 700; color: var(--primary-400);">
                                    ${workout.workout_exercises?.length || 0}
                                </div>
                                <div style="font-size: var(--font-size-sm); color: var(--text-secondary);">Exercises</div>
                            </div>
                            <div>
                                <div style="font-size: var(--font-size-2xl); font-weight: 700; color: var(--accent-400);">
                                    ${totalSets}
                                </div>
                                <div style="font-size: var(--font-size-sm); color: var(--text-secondary);">Sets</div>
                            </div>
                            <div>
                                <div style="font-size: var(--font-size-2xl); font-weight: 700; color: #28a745;">
                                    ${totalVolume.toFixed(0)}
                                </div>
                                <div style="font-size: var(--font-size-sm); color: var(--text-secondary);">Volume (kg)</div>
                            </div>
                        </div>
                        
                        <details>
                            <summary style="cursor: pointer; font-weight: 600; padding: var(--spacing-sm); background: var(--bg-secondary); border-radius: var(--radius-sm); margin-bottom: var(--spacing-md);">
                                View Details
                            </summary>
                            <div style="display: flex; flex-direction: column; gap: var(--spacing-md);">
                                ${workout.workout_exercises?.map(ex => `
                                    <div style="padding: var(--spacing-md); background: var(--bg-secondary); border-radius: var(--radius-md);">
                                        <div style="font-weight: 600; margin-bottom: var(--spacing-sm);">${ex.exercises?.name || 'Unknown'}</div>
                                        <div style="display: flex; flex-direction: column; gap: var(--spacing-xs);">
                                            ${ex.workout_sets?.map((set, i) => `
                                                <div style="font-size: var(--font-size-sm); color: var(--text-secondary);">
                                                    Set ${i + 1}: ${set.reps} reps @ ${set.weight}kg
                                                </div>
                                            `).join('') || '<p style="color: var(--text-secondary);">No sets recorded</p>'}
                                        </div>
                                    </div>
                                `).join('') || '<p style="color: var(--text-secondary);">No exercises recorded</p>'}
                            </div>
                        </details>
                    </div>
                `;
    }).join('')}
        </div>
    `;
}

function setupHistoryListeners() {
    // Delete workout buttons
    document.querySelectorAll('.delete-workout-btn').forEach(btn => {
        btn.addEventListener('click', async () => {
            const workoutId = btn.dataset.workoutId;
            if (confirm('Are you sure you want to delete this workout?')) {
                await deleteWorkout(workoutId);
            }
        });
    });

    // Apply filters
    document.getElementById('apply-filters-btn')?.addEventListener('click', async () => {
        const startDate = document.getElementById('filter-start-date').value;
        const endDate = document.getElementById('filter-end-date').value;

        await applyFilters(startDate, endDate);
    });
}

async function deleteWorkout(workoutId) {
    showLoading();

    try {
        await db.deleteWorkout(workoutId);
        showToast('Workout deleted', 'success');

        // Refresh list
        await renderHistory(document.getElementById('page-content'));
        lucide.createIcons();

    } catch (error) {
        console.error('Error deleting workout:', error);
        showToast('Error deleting workout', 'error');
    } finally {
        hideLoading();
    }
}

async function applyFilters(startDate, endDate) {
    showLoading();

    try {
        const user = getCurrentUser();
        const filters = {};

        if (startDate) filters.startDate = startDate;
        if (endDate) filters.endDate = endDate;

        workouts = await db.getWorkouts(user.id, filters);

        document.getElementById('workouts-list').innerHTML = renderWorkoutsList();
        lucide.createIcons();

    } catch (error) {
        console.error('Error applying filters:', error);
        showToast('Error filtering workouts', 'error');
    } finally {
        hideLoading();
    }
}
