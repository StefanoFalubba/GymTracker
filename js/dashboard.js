// Dashboard Page Module
import { db } from './supabase.js';
import { getCurrentUser, formatDate, timeAgo, showToast, showLoading, hideLoading } from './utils.js';
import { navigateTo } from './app.js';

export async function renderDashboard(container) {
    showLoading();

    try {
        const user = getCurrentUser();
        const userId = user.id;

        // Fetch data
        const [workouts, trainingCards, profile] = await Promise.all([
            db.getWorkouts(userId, { limit: 5 }),
            db.getTrainingCards(userId),
            db.getUserProfile(userId)
        ]);

        // Calculate stats
        const stats = calculateStats(workouts);
        const lastWorkout = workouts[0];

        container.innerHTML = `
            <div class="page-header">
                <h1 class="page-title">Dashboard</h1>
                <p class="page-subtitle">Welcome back${profile?.name ? ', ' + profile.name : ''}!</p>
            </div>
            
            <!-- Stats Grid -->
            <div class="grid grid-4 mb-4">
                <div class="stat-card">
                    <div class="stat-card-content">
                        <div class="stat-value">${stats.totalWorkouts}</div>
                        <div class="stat-label">Total Workouts</div>
                    </div>
                </div>
                
                <div class="stat-card" style="background: linear-gradient(135deg, var(--accent-400), var(--accent-500));">
                    <div class="stat-card-content">
                        <div class="stat-value">${stats.currentStreak}</div>
                        <div class="stat-label">Day Streak</div>
                    </div>
                </div>
                
                <div class="stat-card" style="background: linear-gradient(135deg, #28a745, #20803a);">
                    <div class="stat-card-content">
                        <div class="stat-value">${stats.thisWeek}</div>
                        <div class="stat-label">This Week</div>
                    </div>
                </div>
                
                <div class="stat-card" style="background: linear-gradient(135deg, #fd7e14, #dc6502);">
                    <div class="stat-card-content">
                        <div class="stat-value">${stats.thisMonth}</div>
                        <div class="stat-label">This Month</div>
                    </div>
                </div>
            </div>
            
            <div class="grid grid-2">
                <!-- Quick Actions -->
                <div class="card">
                    <div class="card-header">
                        <h2 class="card-title">
                            <i data-lucide="zap"></i>
                            Quick Actions
                        </h2>
                    </div>
                    
                    <div id="quick-actions">
                        ${renderQuickActions(trainingCards)}
                    </div>
                </div>
                
                <!-- Last Workout -->
                <div class="card">
                    <div class="card-header">
                        <h2 class="card-title">
                            <i data-lucide="activity"></i>
                            Last Workout
                        </h2>
                    </div>
                    
                    <div id="last-workout">
                        ${renderLastWorkout(lastWorkout)}
                    </div>
                </div>
            </div>
            
            <!-- Recent Workouts -->
            <div class="card mt-4">
                <div class="card-header">
                    <h2 class="card-title">
                        <i data-lucide="calendar"></i>
                        Recent Workouts
                    </h2>
                    <button class="btn btn-ghost btn-sm" id="view-all-history">
                        View All
                        <i data-lucide="arrow-right"></i>
                    </button>
                </div>
                
                <div id="recent-workouts">
                    ${renderRecentWorkouts(workouts)}
                </div>
            </div>
        `;

        // Setup event listeners
        setupDashboardListeners(trainingCards);

    } catch (error) {
        console.error('Error rendering dashboard:', error);
        showToast('Error loading dashboard', 'error');
    } finally {
        hideLoading();
    }
}

function calculateStats(workouts) {
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const thisWeek = workouts.filter(w => new Date(w.date) >= weekAgo).length;
    const thisMonth = workouts.filter(w => new Date(w.date) >= monthAgo).length;

    // Calculate streak
    let streak = 0;
    const sortedWorkouts = [...workouts].sort((a, b) => new Date(b.date) - new Date(a.date));
    let currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);

    for (const workout of sortedWorkouts) {
        const workoutDate = new Date(workout.date);
        workoutDate.setHours(0, 0, 0, 0);

        const daysDiff = Math.floor((currentDate - workoutDate) / (1000 * 60 * 60 * 24));

        if (daysDiff <= 1) {
            streak++;
            currentDate = workoutDate;
        } else {
            break;
        }
    }

    return {
        totalWorkouts: workouts.length,
        currentStreak: streak,
        thisWeek,
        thisMonth
    };
}

function renderQuickActions(trainingCards) {
    if (trainingCards.length === 0) {
        return `
            <div class="empty-state">
                <p>No training cards yet</p>
                <button class="btn btn-primary btn-sm" id="create-first-card">
                    <i data-lucide="plus"></i>
                    Create Training Card
                </button>
            </div>
        `;
    }

    return `
        <div style="display: flex; flex-direction: column; gap: var(--spacing-md);">
            ${trainingCards.slice(0, 3).map(card => `
                <button class="btn btn-secondary btn-block start-workout-btn" data-card-id="${card.id}">
                    <i data-lucide="play"></i>
                    Start: ${card.name}
                </button>
            `).join('')}
            
            ${trainingCards.length > 3 ? `
                <button class="btn btn-ghost btn-sm" id="view-all-cards">
                    View All Cards
                    <i data-lucide="arrow-right"></i>
                </button>
            ` : ''}
        </div>
    `;
}

function renderLastWorkout(workout) {
    if (!workout) {
        return `
            <div class="empty-state">
                <p>No workouts yet</p>
                <button class="btn btn-accent btn-sm" id="start-first-workout">
                    <i data-lucide="play"></i>
                    Start Your First Workout
                </button>
            </div>
        `;
    }

    const exerciseCount = workout.workout_exercises?.length || 0;
    const totalSets = workout.workout_exercises?.reduce((sum, ex) =>
        sum + (ex.workout_sets?.length || 0), 0) || 0;

    return `
        <div style="display: flex; flex-direction: column; gap: var(--spacing-md);">
            <div>
                <div style="font-size: var(--font-size-lg); font-weight: 600; margin-bottom: var(--spacing-xs);">
                    ${workout.training_cards?.name || 'Custom Workout'}
                </div>
                <div style="color: var(--text-secondary); font-size: var(--font-size-sm);">
                    ${timeAgo(workout.date)}
                </div>
            </div>
            
            <div style="display: flex; gap: var(--spacing-lg);">
                <div>
                    <div style="font-size: var(--font-size-2xl); font-weight: 700; color: var(--primary-400);">
                        ${exerciseCount}
                    </div>
                    <div style="font-size: var(--font-size-sm); color: var(--text-secondary);">
                        Exercises
                    </div>
                </div>
                
                <div>
                    <div style="font-size: var(--font-size-2xl); font-weight: 700; color: var(--accent-400);">
                        ${totalSets}
                    </div>
                    <div style="font-size: var(--font-size-sm); color: var(--text-secondary);">
                        Sets
                    </div>
                </div>
                
                ${workout.duration ? `
                    <div>
                        <div style="font-size: var(--font-size-2xl); font-weight: 700; color: #28a745;">
                            ${Math.round(workout.duration / 60)}
                        </div>
                        <div style="font-size: var(--font-size-sm); color: var(--text-secondary);">
                            Minutes
                        </div>
                    </div>
                ` : ''}
            </div>
        </div>
    `;
}

function renderRecentWorkouts(workouts) {
    if (workouts.length === 0) {
        return `
            <div class="empty-state">
                <p>No workout history yet</p>
            </div>
        `;
    }

    return `
        <div style="display: flex; flex-direction: column; gap: var(--spacing-md);">
            ${workouts.slice(0, 5).map(workout => {
        const exerciseCount = workout.workout_exercises?.length || 0;
        const totalSets = workout.workout_exercises?.reduce((sum, ex) =>
            sum + (ex.workout_sets?.length || 0), 0) || 0;

        return `
                    <div style="padding: var(--spacing-md); background: var(--bg-secondary); border-radius: var(--radius-md); display: flex; justify-content: space-between; align-items: center;">
                        <div>
                            <div style="font-weight: 600; margin-bottom: var(--spacing-xs);">
                                ${workout.training_cards?.name || 'Custom Workout'}
                            </div>
                            <div style="font-size: var(--font-size-sm); color: var(--text-secondary);">
                                ${formatDate(workout.date)} • ${exerciseCount} exercises • ${totalSets} sets
                            </div>
                        </div>
                        <i data-lucide="chevron-right" style="color: var(--text-tertiary);"></i>
                    </div>
                `;
    }).join('')}
        </div>
    `;
}

function setupDashboardListeners(trainingCards) {
    // Start workout buttons
    document.querySelectorAll('.start-workout-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const cardId = btn.dataset.cardId;
            // Store selected card ID for workout page
            sessionStorage.setItem('selectedTrainingCard', cardId);
            navigateTo('workout');
        });
    });

    // Create first card button
    document.getElementById('create-first-card')?.addEventListener('click', () => {
        navigateTo('training-cards');
    });

    // Start first workout button
    document.getElementById('start-first-workout')?.addEventListener('click', () => {
        navigateTo('workout');
    });

    // View all cards button
    document.getElementById('view-all-cards')?.addEventListener('click', () => {
        navigateTo('training-cards');
    });

    // View all history button
    document.getElementById('view-all-history')?.addEventListener('click', () => {
        navigateTo('history');
    });
}
