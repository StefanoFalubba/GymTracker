// Statistics Page Module
import { db } from './supabase.js';
import { getCurrentUser, showToast, showLoading, hideLoading, calculate1RM } from './utils.js';

let exercises = [];
let selectedExercise = null;

export async function renderStatistics(container) {
    showLoading();

    try {
        const user = getCurrentUser();
        exercises = await db.getExercises(user.id);

        container.innerHTML = `
            <div class="page-header">
                <h1 class="page-title">Statistics & Progress</h1>
                <p class="page-subtitle">Track your fitness journey</p>
            </div>
            
            <!-- Exercise Selector -->
            <div class="card mb-4">
                <div class="form-group" style="margin: 0;">
                    <label>Select Exercise to Analyze</label>
                    <select id="exercise-selector" class="exercise-select">
                        <option value="">Choose an exercise...</option>
                        ${exercises.map(ex => `
                            <option value="${ex.id}">${ex.name}</option>
                        `).join('')}
                    </select>
                </div>
            </div>
            
            <!-- Statistics Content -->
            <div id="stats-content">
                ${renderStatsPlaceholder()}
            </div>
        `;

        setupStatisticsListeners();

    } catch (error) {
        console.error('Error rendering statistics:', error);
        showToast('Error loading statistics', 'error');
    } finally {
        hideLoading();
    }
}

function renderStatsPlaceholder() {
    return `
        <div class="card">
            <div class="empty-state">
                <i data-lucide="trending-up"></i>
                <h3>Select an Exercise</h3>
                <p>Choose an exercise above to view detailed statistics and progress charts</p>
            </div>
        </div>
    `;
}

function setupStatisticsListeners() {
    document.getElementById('exercise-selector')?.addEventListener('change', async (e) => {
        const exerciseId = e.target.value;
        if (exerciseId) {
            await loadExerciseStats(exerciseId);
        } else {
            document.getElementById('stats-content').innerHTML = renderStatsPlaceholder();
            lucide.createIcons();
        }
    });
}

async function loadExerciseStats(exerciseId) {
    showLoading();

    try {
        const user = getCurrentUser();
        selectedExercise = exercises.find(ex => ex.id === exerciseId);
        const history = await db.getExerciseHistory(user.id, exerciseId);

        if (history.length === 0) {
            document.getElementById('stats-content').innerHTML = `
                <div class="card">
                    <div class="empty-state">
                        <i data-lucide="bar-chart"></i>
                        <h3>No Data Yet</h3>
                        <p>Complete workouts with this exercise to see statistics</p>
                    </div>
                </div>
            `;
            lucide.createIcons();
            return;
        }

        // Calculate stats
        const stats = calculateExerciseStats(history);

        document.getElementById('stats-content').innerHTML = `
            <!-- Stats Cards -->
            <div class="grid grid-4 mb-4">
                <div class="stat-card">
                    <div class="stat-card-content">
                        <div class="stat-value">${stats.totalSets}</div>
                        <div class="stat-label">Total Sets</div>
                    </div>
                </div>
                
                <div class="stat-card" style="background: linear-gradient(135deg, var(--accent-400), var(--accent-500));">
                    <div class="stat-card-content">
                        <div class="stat-value">${stats.maxWeight}kg</div>
                        <div class="stat-label">Max Weight</div>
                    </div>
                </div>
                
                <div class="stat-card" style="background: linear-gradient(135deg, #28a745, #20803a);">
                    <div class="stat-card-content">
                        <div class="stat-value">${stats.estimated1RM.toFixed(1)}kg</div>
                        <div class="stat-label">Est. 1RM</div>
                    </div>
                </div>
                
                <div class="stat-card" style="background: linear-gradient(135deg, #fd7e14, #dc6502);">
                    <div class="stat-card-content">
                        <div class="stat-value">${stats.totalVolume.toFixed(0)}kg</div>
                        <div class="stat-label">Total Volume</div>
                    </div>
                </div>
            </div>
            
            <!-- Progress Chart -->
            <div class="card mb-4">
                <div class="card-header">
                    <h2 class="card-title">
                        <i data-lucide="trending-up"></i>
                        Weight Progression
                    </h2>
                </div>
                <canvas id="progress-chart" style="max-height: 400px;"></canvas>
            </div>
            
            <!-- Volume Chart -->
            <div class="card">
                <div class="card-header">
                    <h2 class="card-title">
                        <i data-lucide="bar-chart-2"></i>
                        Volume Over Time
                    </h2>
                </div>
                <canvas id="volume-chart" style="max-height: 400px;"></canvas>
            </div>
        `;

        // Render charts
        renderProgressChart(history);
        renderVolumeChart(history);

        lucide.createIcons();

    } catch (error) {
        console.error('Error loading exercise stats:', error);
        showToast('Error loading statistics', 'error');
    } finally {
        hideLoading();
    }
}

function calculateExerciseStats(history) {
    let totalSets = 0;
    let maxWeight = 0;
    let max1RM = 0;
    let totalVolume = 0;

    history.forEach(workoutEx => {
        workoutEx.workout_sets?.forEach(set => {
            totalSets++;
            maxWeight = Math.max(maxWeight, set.weight || 0);
            totalVolume += (set.reps * set.weight);

            const estimated1RM = calculate1RM(set.weight, set.reps);
            max1RM = Math.max(max1RM, estimated1RM);
        });
    });

    return {
        totalSets,
        maxWeight,
        estimated1RM: max1RM,
        totalVolume
    };
}

function renderProgressChart(history) {
    const ctx = document.getElementById('progress-chart');
    if (!ctx) return;

    // Prepare data
    const dataPoints = [];
    history.forEach(workoutEx => {
        const date = new Date(workoutEx.workouts.date);
        workoutEx.workout_sets?.forEach(set => {
            dataPoints.push({
                x: date,
                y: set.weight
            });
        });
    });

    // Sort by date
    dataPoints.sort((a, b) => a.x - b.x);

    new Chart(ctx, {
        type: 'line',
        data: {
            datasets: [{
                label: 'Weight (kg)',
                data: dataPoints,
                borderColor: 'rgb(147, 51, 234)',
                backgroundColor: 'rgba(147, 51, 234, 0.1)',
                tension: 0.4,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                x: {
                    type: 'time',
                    time: {
                        unit: 'day'
                    },
                    title: {
                        display: true,
                        text: 'Date'
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Weight (kg)'
                    },
                    beginAtZero: false
                }
            }
        }
    });
}

function renderVolumeChart(history) {
    const ctx = document.getElementById('volume-chart');
    if (!ctx) return;

    // Group by workout date and calculate volume
    const volumeByDate = {};
    history.forEach(workoutEx => {
        const date = new Date(workoutEx.workouts.date).toLocaleDateString();
        if (!volumeByDate[date]) {
            volumeByDate[date] = 0;
        }
        workoutEx.workout_sets?.forEach(set => {
            volumeByDate[date] += (set.reps * set.weight);
        });
    });

    const labels = Object.keys(volumeByDate);
    const data = Object.values(volumeByDate);

    new Chart(ctx, {
        type: 'bar',
        data: {
            labels,
            datasets: [{
                label: 'Volume (kg)',
                data,
                backgroundColor: 'rgba(236, 72, 153, 0.8)',
                borderColor: 'rgb(236, 72, 153)',
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    title: {
                        display: true,
                        text: 'Volume (kg)'
                    },
                    beginAtZero: true
                }
            }
        }
    });
}
