// Training Cards Page Module
import { db } from './supabase.js';
import { getCurrentUser, showToast, showLoading, hideLoading, sanitizeHTML } from './utils.js';

let exercises = [];
let trainingCards = [];

export async function renderTrainingCards(container) {
    showLoading();

    try {
        const user = getCurrentUser();
        const userId = user.id;

        // Fetch data
        [exercises, trainingCards] = await Promise.all([
            db.getExercises(userId),
            db.getTrainingCards(userId)
        ]);

        container.innerHTML = `
            <div class="page-header flex-between">
                <div>
                    <h1 class="page-title">Training Cards</h1>
                    <p class="page-subtitle">Create and manage your workout programs</p>
                </div>
                <button class="btn btn-primary" id="create-card-btn">
                    <i data-lucide="plus"></i>
                    New Training Card
                </button>
            </div>
            
            <div id="cards-list" class="grid grid-2">
                ${renderCardsList()}
            </div>
            
            <!-- Modal for creating/editing card -->
            <div id="card-modal" class="hidden"></div>
        `;

        setupTrainingCardsListeners();

    } catch (error) {
        console.error('Error rendering training cards:', error);
        showToast('Error loading training cards', 'error');
    } finally {
        hideLoading();
    }
}

function renderCardsList() {
    if (trainingCards.length === 0) {
        return `
            <div class="card" style="grid-column: 1 / -1;">
                <div class="empty-state">
                    <i data-lucide="clipboard-list"></i>
                    <h3>No Training Cards Yet</h3>
                    <p>Create your first training card to organize your workouts</p>
                    <button class="btn btn-primary" id="create-first-card">
                        <i data-lucide="plus"></i>
                        Create Training Card
                    </button>
                </div>
            </div>
        `;
    }

    return trainingCards.map(card => `
        <div class="card">
            <div class="card-header">
                <h3 class="card-title">${sanitizeHTML(card.name)}</h3>
                <div class="flex gap-1">
                    <button class="btn btn-ghost btn-sm edit-card-btn" data-card-id="${card.id}">
                        <i data-lucide="edit-2"></i>
                    </button>
                    <button class="btn btn-ghost btn-sm delete-card-btn" data-card-id="${card.id}">
                        <i data-lucide="trash-2"></i>
                    </button>
                </div>
            </div>
            
            <div style="margin-bottom: var(--spacing-md);">
                ${card.assigned_days ? `
                    <div style="display: flex; gap: var(--spacing-xs); flex-wrap: wrap;">
                        ${JSON.parse(card.assigned_days).map(day => `
                            <span style="padding: 0.25rem 0.5rem; background: var(--primary-100); color: var(--primary-600); border-radius: var(--radius-sm); font-size: var(--font-size-xs); font-weight: 600;">
                                ${day}
                            </span>
                        `).join('')}
                    </div>
                ` : '<p style="color: var(--text-secondary); font-size: var(--font-size-sm);">No days assigned</p>'}
            </div>
            
            <div style="margin-bottom: var(--spacing-md);">
                <div style="font-weight: 600; margin-bottom: var(--spacing-sm); font-size: var(--font-size-sm);">
                    Exercises (${card.training_card_exercises?.length || 0})
                </div>
                ${renderCardExercises(card.training_card_exercises)}
            </div>
            
            <button class="btn btn-accent btn-block start-workout-btn" data-card-id="${card.id}">
                <i data-lucide="play"></i>
                Start Workout
            </button>
        </div>
    `).join('');
}

function renderCardExercises(cardExercises) {
    if (!cardExercises || cardExercises.length === 0) {
        return '<p style="color: var(--text-secondary); font-size: var(--font-size-sm);">No exercises added</p>';
    }

    return `
        <div style="display: flex; flex-direction: column; gap: var(--spacing-sm);">
            ${cardExercises.slice(0, 5).map(ex => `
                <div style="padding: var(--spacing-sm); background: var(--bg-secondary); border-radius: var(--radius-sm); font-size: var(--font-size-sm);">
                    <div style="font-weight: 500;">${ex.exercises?.name || 'Unknown'}</div>
                    <div style="color: var(--text-secondary); font-size: var(--font-size-xs);">
                        ${ex.sets} sets × ${ex.reps} reps ${ex.weight ? `@ ${ex.weight}kg` : ''}
                    </div>
                </div>
            `).join('')}
            ${cardExercises.length > 5 ? `
                <div style="color: var(--text-secondary); font-size: var(--font-size-sm); text-align: center;">
                    +${cardExercises.length - 5} more
                </div>
            ` : ''}
        </div>
    `;
}

function setupTrainingCardsListeners() {
    // Create card button
    document.getElementById('create-card-btn')?.addEventListener('click', () => showCardModal());
    document.getElementById('create-first-card')?.addEventListener('click', () => showCardModal());

    // Edit card buttons
    document.querySelectorAll('.edit-card-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const cardId = btn.dataset.cardId;
            const card = trainingCards.find(c => c.id === cardId);
            showCardModal(card);
        });
    });

    // Delete card buttons
    document.querySelectorAll('.delete-card-btn').forEach(btn => {
        btn.addEventListener('click', async () => {
            const cardId = btn.dataset.cardId;
            if (confirm('Are you sure you want to delete this training card?')) {
                await deleteCard(cardId);
            }
        });
    });

    // Start workout buttons
    document.querySelectorAll('.start-workout-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const cardId = btn.dataset.cardId;
            sessionStorage.setItem('selectedTrainingCard', cardId);
            window.dispatchEvent(new CustomEvent('navigate', { detail: { page: 'workout' } }));
        });
    });
}

function showCardModal(card = null) {
    const modal = document.getElementById('card-modal');
    const isEdit = !!card;

    modal.innerHTML = `
        <div style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); backdrop-filter: blur(4px); z-index: 1000; display: flex; align-items: center; justify-content: center; padding: var(--spacing-lg);">
            <div class="card" style="max-width: 600px; width: 100%; max-height: 90vh; overflow-y: auto;">
                <div class="card-header">
                    <h2 class="card-title">${isEdit ? 'Edit' : 'Create'} Training Card</h2>
                    <button class="btn btn-ghost btn-sm" id="close-modal">
                        <i data-lucide="x"></i>
                    </button>
                </div>
                
                <form id="card-form">
                    <div class="form-group">
                        <label for="card-name">Card Name</label>
                        <input type="text" id="card-name" required placeholder="e.g., Push Day, Full Body" value="${card?.name || ''}">
                    </div>
                    
                    <div class="form-group">
                        <label for="card-days">Assigned Days (comma-separated)</label>
                        <input type="text" id="card-days" placeholder="e.g., Monday, Wednesday, Friday" value="${card?.assigned_days ? JSON.parse(card.assigned_days).join(', ') : ''}">
                    </div>
                    
                    <div class="form-group">
                        <label>Exercises</label>
                        <div id="card-exercises-list" style="display: flex; flex-direction: column; gap: var(--spacing-md); margin-bottom: var(--spacing-md);">
                            ${renderCardExercisesForm(card?.training_card_exercises || [])}
                        </div>
                        <button type="button" class="btn btn-secondary btn-sm" id="add-exercise-btn">
                            <i data-lucide="plus"></i>
                            Add Exercise
                        </button>
                    </div>
                    
                    <div class="flex gap-2">
                        <button type="submit" class="btn btn-primary">
                            <i data-lucide="save"></i>
                            ${isEdit ? 'Update' : 'Create'} Card
                        </button>
                        <button type="button" class="btn btn-ghost" id="cancel-modal">
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    `;

    modal.classList.remove('hidden');
    lucide.createIcons();

    setupModalListeners(card);
}

function renderCardExercisesForm(cardExercises) {
    if (cardExercises.length === 0) {
        return '<p style="color: var(--text-secondary); font-size: var(--font-size-sm);">No exercises added yet</p>';
    }

    return cardExercises.map((ex, index) => `
        <div class="card-exercise-item" data-index="${index}" style="padding: var(--spacing-md); background: var(--bg-secondary); border-radius: var(--radius-md);">
            <div class="flex-between mb-2">
                <select class="exercise-select" style="flex: 1; margin-right: var(--spacing-md);">
                    ${exercises.map(exercise => `
                        <option value="${exercise.id}" ${ex.exercise_id === exercise.id ? 'selected' : ''}>
                            ${exercise.name}
                        </option>
                    `).join('')}
                </select>
                <button type="button" class="btn btn-ghost btn-sm remove-exercise-btn">
                    <i data-lucide="trash-2"></i>
                </button>
            </div>
            <div class="grid grid-3 gap-2">
                <div class="form-group" style="margin: 0;">
                    <label style="font-size: var(--font-size-xs);">Sets</label>
                    <input type="number" class="exercise-sets" value="${ex.sets || 3}" min="1" required>
                </div>
                <div class="form-group" style="margin: 0;">
                    <label style="font-size: var(--font-size-xs);">Reps</label>
                    <input type="number" class="exercise-reps" value="${ex.reps || 10}" min="1" required>
                </div>
                <div class="form-group" style="margin: 0;">
                    <label style="font-size: var(--font-size-xs);">Weight (kg)</label>
                    <input type="number" class="exercise-weight" value="${ex.weight || ''}" step="0.5">
                </div>
            </div>
        </div>
    `).join('');
}

function setupModalListeners(card) {
    const modal = document.getElementById('card-modal');

    // Close modal
    document.getElementById('close-modal')?.addEventListener('click', () => {
        modal.classList.add('hidden');
    });

    document.getElementById('cancel-modal')?.addEventListener('click', () => {
        modal.classList.add('hidden');
    });

    // Add exercise
    document.getElementById('add-exercise-btn')?.addEventListener('click', () => {
        const list = document.getElementById('card-exercises-list');
        const index = list.querySelectorAll('.card-exercise-item').length;

        const newExercise = document.createElement('div');
        newExercise.className = 'card-exercise-item';
        newExercise.dataset.index = index;
        newExercise.innerHTML = `
            <div style="padding: var(--spacing-md); background: var(--bg-secondary); border-radius: var(--radius-md);">
                <div class="flex-between mb-2">
                    <select class="exercise-select" style="flex: 1; margin-right: var(--spacing-md);">
                        ${exercises.map(exercise => `
                            <option value="${exercise.id}">${exercise.name}</option>
                        `).join('')}
                    </select>
                    <button type="button" class="btn btn-ghost btn-sm remove-exercise-btn">
                        <i data-lucide="trash-2"></i>
                    </button>
                </div>
                <div class="grid grid-3 gap-2">
                    <div class="form-group" style="margin: 0;">
                        <label style="font-size: var(--font-size-xs);">Sets</label>
                        <input type="number" class="exercise-sets" value="3" min="1" required>
                    </div>
                    <div class="form-group" style="margin: 0;">
                        <label style="font-size: var(--font-size-xs);">Reps</label>
                        <input type="number" class="exercise-reps" value="10" min="1" required>
                    </div>
                    <div class="form-group" style="margin: 0;">
                        <label style="font-size: var(--font-size-xs);">Weight (kg)</label>
                        <input type="number" class="exercise-weight" value="" step="0.5">
                    </div>
                </div>
            </div>
        `;

        list.appendChild(newExercise);
        lucide.createIcons();

        // Add remove listener
        newExercise.querySelector('.remove-exercise-btn').addEventListener('click', () => {
            newExercise.remove();
        });
    });

    // Remove exercise buttons
    document.querySelectorAll('.remove-exercise-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            btn.closest('.card-exercise-item').remove();
        });
    });

    // Form submission
    document.getElementById('card-form')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        await saveCard(card);
    });
}

async function saveCard(existingCard) {
    showLoading();

    try {
        const user = getCurrentUser();
        const name = document.getElementById('card-name').value;
        const daysInput = document.getElementById('card-days').value;
        const days = daysInput ? daysInput.split(',').map(d => d.trim()) : [];

        // Collect exercises
        const exerciseItems = document.querySelectorAll('.card-exercise-item');
        const cardExercises = Array.from(exerciseItems).map((item, index) => ({
            exercise_id: item.querySelector('.exercise-select').value,
            order_index: index,
            sets: parseInt(item.querySelector('.exercise-sets').value),
            reps: parseInt(item.querySelector('.exercise-reps').value),
            weight: parseFloat(item.querySelector('.exercise-weight').value) || null
        }));

        if (existingCard) {
            // Update existing card
            await db.updateTrainingCard(existingCard.id, {
                name,
                assigned_days: JSON.stringify(days)
            });

            // Delete old exercises and add new ones
            for (const ex of existingCard.training_card_exercises || []) {
                await db.deleteCardExercise(ex.id);
            }

            for (const ex of cardExercises) {
                await db.addExerciseToCard(existingCard.id, ex);
            }

            showToast('Training card updated!', 'success');
        } else {
            // Create new card
            const newCard = await db.createTrainingCard(user.id, {
                name,
                assigned_days: JSON.stringify(days)
            });

            // Add exercises
            for (const ex of cardExercises) {
                await db.addExerciseToCard(newCard.id, ex);
            }

            showToast('Training card created!', 'success');
        }

        // Close modal and refresh
        document.getElementById('card-modal').classList.add('hidden');
        await renderTrainingCards(document.getElementById('page-content'));
        lucide.createIcons();

    } catch (error) {
        console.error('Error saving card:', error);
        showToast('Error saving training card', 'error');
    } finally {
        hideLoading();
    }
}

async function deleteCard(cardId) {
    showLoading();

    try {
        await db.deleteTrainingCard(cardId);
        showToast('Training card deleted', 'success');

        // Refresh list
        await renderTrainingCards(document.getElementById('page-content'));
        lucide.createIcons();

    } catch (error) {
        console.error('Error deleting card:', error);
        showToast('Error deleting training card', 'error');
    } finally {
        hideLoading();
    }
}
