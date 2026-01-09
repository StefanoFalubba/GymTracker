// Workout Page Module - Active Workout Session
import { db } from './supabase.js';
import { getCurrentUser, showToast, showLoading, hideLoading, formatDuration } from './utils.js';
import { navigateTo } from './app.js';

let activeWorkout = null;
let workoutTimer = null;
let workoutStartTime = null;

export async function renderWorkout(container) {
    showLoading();

    try {
        const user = getCurrentUser();
        const selectedCardId = sessionStorage.getItem('selectedTrainingCard');

        if (!selectedCardId) {
            // Show card selection
            const cards = await db.getTrainingCards(user.id);
            renderCardSelection(container, cards);
        } else if (!activeWorkout) {
            // Load card and start workout
            const card = await db.getTrainingCard(selectedCardId);
            startWorkout(container, card);
        } else {
            // Continue active workout
            renderActiveWorkout(container);
        }

    } catch (error) {
        console.error('Error rendering workout:', error);
        showToast('Error loading workout', 'error');
    } finally {
        hideLoading();
    }
}

function renderCardSelection(container, cards) {
    container.innerHTML = `
        <div class="page-header">
            <h1 class="page-title">Start Workout</h1>
            <p class="page-subtitle">Select a training card to begin</p>
        </div>
        
        <div class="grid grid-2">
            ${cards.map(card => `
                <div class="card">
                    <h3 style="font-size: var(--font-size-xl); font-weight: 700; margin-bottom: var(--spacing-md);">
                        ${card.name}
                    </h3>
                    <p style="color: var(--text-secondary); margin-bottom: var(--spacing-lg);">
                        ${card.training_card_exercises?.length || 0} exercises
                    </p>
                    <button class="btn btn-primary btn-block select-card-btn" data-card-id="${card.id}">
                        <i data-lucide="play"></i>
                        Start Workout
                    </button>
                </div>
            `).join('')}
        </div>
    `;

    document.querySelectorAll('.select-card-btn').forEach(btn => {
        btn.addEventListener('click', async () => {
            const cardId = btn.dataset.cardId;
            sessionStorage.setItem('selectedTrainingCard', cardId);
            const card = await db.getTrainingCard(cardId);
            startWorkout(container, card);
        });
    });

    lucide.createIcons();
}

function startWorkout(container, card) {
    workoutStartTime = new Date();
    activeWorkout = {
        trainingCardId: card.id,
        cardName: card.name,
        exercises: card.training_card_exercises.map(ex => ({
            id: ex.id,
            exerciseId: ex.exercise_id,
            name: ex.exercises.name,
            targetSets: ex.sets,
            targetReps: ex.reps,
            targetWeight: ex.weight,
            completedSets: []
        })),
        startTime: workoutStartTime
    };

    // Start timer
    workoutTimer = setInterval(() => {
        updateWorkoutTimer();
    }, 1000);

    renderActiveWorkout(container);
}

function renderActiveWorkout(container) {
    const duration = Math.floor((new Date() - workoutStartTime) / 1000);
    const completedSets = activeWorkout.exercises.reduce((sum, ex) => sum + ex.completedSets.length, 0);
    const totalSets = activeWorkout.exercises.reduce((sum, ex) => sum + ex.targetSets, 0);

    container.innerHTML = `
        <div class="page-header flex-between">
            <div>
                <h1 class="page-title">${activeWorkout.cardName}</h1>
                <p class="page-subtitle">
                    <span id="workout-timer">${formatDuration(duration)}</span> • 
                    ${completedSets}/${totalSets} sets completed
                </p>
            </div>
            <div class="flex gap-2">
                <button class="btn btn-success" id="finish-workout-btn">
                    <i data-lucide="check"></i>
                    Finish
                </button>
                <button class="btn btn-danger" id="cancel-workout-btn">
                    <i data-lucide="x"></i>
                    Cancel
                </button>
            </div>
        </div>
        
        <div style="display: flex; flex-direction: column; gap: var(--spacing-lg);">
            ${activeWorkout.exercises.map((ex, exIndex) => `
                <div class="card">
                    <h3 class="card-title">${ex.name}</h3>
                    <p style="color: var(--text-secondary); margin-bottom: var(--spacing-md);">
                        Target: ${ex.targetSets} sets × ${ex.targetReps} reps ${ex.targetWeight ? `@ ${ex.targetWeight}kg` : ''}
                    </p>
                    
                    <div style="display: flex; flex-direction: column; gap: var(--spacing-sm);">
                        ${Array.from({ length: ex.targetSets }, (_, setIndex) => {
        const completed = ex.completedSets[setIndex];
        return `
                                <div style="display: flex; gap: var(--spacing-md); align-items: center; padding: var(--spacing-md); background: var(--bg-secondary); border-radius: var(--radius-md);">
                                    <div style="font-weight: 600; min-width: 60px;">Set ${setIndex + 1}</div>
                                    <input type="number" class="set-reps-input" data-ex-index="${exIndex}" data-set-index="${setIndex}" 
                                           placeholder="Reps" value="${completed?.reps || ex.targetReps}" 
                                           style="width: 80px; padding: 0.5rem; border: 2px solid var(--border-color); border-radius: var(--radius-sm);">
                                    <input type="number" class="set-weight-input" data-ex-index="${exIndex}" data-set-index="${setIndex}" 
                                           placeholder="Weight" value="${completed?.weight || ex.targetWeight || ''}" step="0.5"
                                           style="width: 80px; padding: 0.5rem; border: 2px solid var(--border-color); border-radius: var(--radius-sm);">
                                    <button class="btn ${completed ? 'btn-success' : 'btn-secondary'} btn-sm complete-set-btn" 
                                            data-ex-index="${exIndex}" data-set-index="${setIndex}">
                                        <i data-lucide="${completed ? 'check-circle' : 'circle'}"></i>
                                    </button>
                                </div>
                            `;
    }).join('')}
                    </div>
                </div>
            `).join('')}
        </div>
    `;

    setupWorkoutListeners();
    lucide.createIcons();
}

function setupWorkoutListeners() {
    // Complete set buttons
    document.querySelectorAll('.complete-set-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const exIndex = parseInt(btn.dataset.exIndex);
            const setIndex = parseInt(btn.dataset.setIndex);

            const repsInput = document.querySelector(`.set-reps-input[data-ex-index="${exIndex}"][data-set-index="${setIndex}"]`);
            const weightInput = document.querySelector(`.set-weight-input[data-ex-index="${exIndex}"][data-set-index="${setIndex}"]`);

            const reps = parseInt(repsInput.value) || 0;
            const weight = parseFloat(weightInput.value) || 0;

            if (reps > 0) {
                activeWorkout.exercises[exIndex].completedSets[setIndex] = { reps, weight };
                renderActiveWorkout(document.getElementById('page-content'));
                lucide.createIcons();
            }
        });
    });

    // Finish workout
    document.getElementById('finish-workout-btn')?.addEventListener('click', finishWorkout);

    // Cancel workout
    document.getElementById('cancel-workout-btn')?.addEventListener('click', () => {
        if (confirm('Are you sure you want to cancel this workout? All progress will be lost.')) {
            cancelWorkout();
        }
    });
}

function updateWorkoutTimer() {
    const timerEl = document.getElementById('workout-timer');
    if (timerEl && workoutStartTime) {
        const duration = Math.floor((new Date() - workoutStartTime) / 1000);
        timerEl.textContent = formatDuration(duration);
    }
}

async function finishWorkout() {
    showLoading();

    try {
        const user = getCurrentUser();
        const duration = Math.floor((new Date() - workoutStartTime) / 1000);

        // Create workout
        const workout = await db.createWorkout(user.id, {
            training_card_id: activeWorkout.trainingCardId,
            date: workoutStartTime.toISOString(),
            duration
        });

        // Add exercises and sets
        for (const ex of activeWorkout.exercises) {
            if (ex.completedSets.length > 0) {
                const workoutExercise = await db.addExerciseToWorkout(workout.id, {
                    exercise_id: ex.exerciseId
                });

                for (let i = 0; i < ex.completedSets.length; i++) {
                    const set = ex.completedSets[i];
                    await db.addSetToWorkoutExercise(workoutExercise.id, {
                        set_number: i + 1,
                        reps: set.reps,
                        weight: set.weight,
                        completed: true
                    });
                }
            }
        }

        showToast('Workout completed! Great job! 💪', 'success');

        // Clear workout state
        clearInterval(workoutTimer);
        activeWorkout = null;
        workoutStartTime = null;
        sessionStorage.removeItem('selectedTrainingCard');

        // Navigate to dashboard
        navigateTo('dashboard');

    } catch (error) {
        console.error('Error finishing workout:', error);
        showToast('Error saving workout', 'error');
    } finally {
        hideLoading();
    }
}

function cancelWorkout() {
    clearInterval(workoutTimer);
    activeWorkout = null;
    workoutStartTime = null;
    sessionStorage.removeItem('selectedTrainingCard');
    navigateTo('dashboard');
}
