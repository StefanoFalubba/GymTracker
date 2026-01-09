// Supabase Client Initialization
import { SUPABASE_CONFIG } from './config.js';

// Initialize Supabase client
export const supabase = window.supabase.createClient(
    SUPABASE_CONFIG.url,
    SUPABASE_CONFIG.anonKey
);

// Database helper functions
export const db = {
    // User Profile
    async getUserProfile(userId) {
        const { data, error } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('user_id', userId)
            .single();

        if (error && error.code !== 'PGRST116') throw error;
        return data;
    },

    async upsertUserProfile(userId, profile) {
        const { data, error } = await supabase
            .from('user_profiles')
            .upsert({ user_id: userId, ...profile })
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    // Exercises
    async getExercises(userId) {
        const { data, error } = await supabase
            .from('exercises')
            .select('*')
            .or(`user_id.eq.${userId},is_default.eq.true`)
            .order('name');

        if (error) throw error;
        return data || [];
    },

    async createExercise(userId, exercise) {
        const { data, error } = await supabase
            .from('exercises')
            .insert({ user_id: userId, ...exercise })
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    async updateExercise(exerciseId, updates) {
        const { data, error } = await supabase
            .from('exercises')
            .update(updates)
            .eq('id', exerciseId)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    async deleteExercise(exerciseId) {
        const { error } = await supabase
            .from('exercises')
            .delete()
            .eq('id', exerciseId);

        if (error) throw error;
    },

    // Training Cards
    async getTrainingCards(userId) {
        const { data, error } = await supabase
            .from('training_cards')
            .select(`
                *,
                training_card_exercises (
                    *,
                    exercises (*)
                )
            `)
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data || [];
    },

    async getTrainingCard(cardId) {
        const { data, error } = await supabase
            .from('training_cards')
            .select(`
                *,
                training_card_exercises (
                    *,
                    exercises (*)
                )
            `)
            .eq('id', cardId)
            .single();

        if (error) throw error;
        return data;
    },

    async createTrainingCard(userId, card) {
        const { data, error } = await supabase
            .from('training_cards')
            .insert({ user_id: userId, ...card })
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    async updateTrainingCard(cardId, updates) {
        const { data, error } = await supabase
            .from('training_cards')
            .update(updates)
            .eq('id', cardId)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    async deleteTrainingCard(cardId) {
        const { error } = await supabase
            .from('training_cards')
            .delete()
            .eq('id', cardId);

        if (error) throw error;
    },

    // Training Card Exercises
    async addExerciseToCard(cardId, exercise) {
        const { data, error } = await supabase
            .from('training_card_exercises')
            .insert({ training_card_id: cardId, ...exercise })
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    async updateCardExercise(exerciseId, updates) {
        const { data, error } = await supabase
            .from('training_card_exercises')
            .update(updates)
            .eq('id', exerciseId)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    async deleteCardExercise(exerciseId) {
        const { error } = await supabase
            .from('training_card_exercises')
            .delete()
            .eq('id', exerciseId);

        if (error) throw error;
    },

    // Workouts
    async getWorkouts(userId, filters = {}) {
        let query = supabase
            .from('workouts')
            .select(`
                *,
                training_cards (name),
                workout_exercises (
                    *,
                    exercises (name, muscle_group),
                    workout_sets (*)
                )
            `)
            .eq('user_id', userId)
            .order('date', { ascending: false });

        if (filters.startDate) {
            query = query.gte('date', filters.startDate);
        }
        if (filters.endDate) {
            query = query.lte('date', filters.endDate);
        }
        if (filters.trainingCardId) {
            query = query.eq('training_card_id', filters.trainingCardId);
        }

        const { data, error } = await query;

        if (error) throw error;
        return data || [];
    },

    async getWorkout(workoutId) {
        const { data, error } = await supabase
            .from('workouts')
            .select(`
                *,
                training_cards (name),
                workout_exercises (
                    *,
                    exercises (name, muscle_group),
                    workout_sets (*)
                )
            `)
            .eq('id', workoutId)
            .single();

        if (error) throw error;
        return data;
    },

    async createWorkout(userId, workout) {
        const { data, error } = await supabase
            .from('workouts')
            .insert({ user_id: userId, ...workout })
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    async deleteWorkout(workoutId) {
        const { error } = await supabase
            .from('workouts')
            .delete()
            .eq('id', workoutId);

        if (error) throw error;
    },

    // Workout Exercises
    async addExerciseToWorkout(workoutId, exercise) {
        const { data, error } = await supabase
            .from('workout_exercises')
            .insert({ workout_id: workoutId, ...exercise })
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    // Workout Sets
    async addSetToWorkoutExercise(workoutExerciseId, set) {
        const { data, error } = await supabase
            .from('workout_sets')
            .insert({ workout_exercise_id: workoutExerciseId, ...set })
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    // Statistics
    async getExerciseHistory(userId, exerciseId) {
        const { data, error } = await supabase
            .from('workout_exercises')
            .select(`
                *,
                workouts!inner (user_id, date),
                workout_sets (*)
            `)
            .eq('exercise_id', exerciseId)
            .eq('workouts.user_id', userId)
            .order('workouts.date', { ascending: true });

        if (error) throw error;
        return data || [];
    },

    async getPersonalRecords(userId) {
        // This would require a more complex query or RPC function
        // For now, we'll fetch all workouts and calculate on client side
        const { data, error } = await supabase
            .from('workout_exercises')
            .select(`
                exercise_id,
                exercises (name),
                workout_sets (weight, reps),
                workouts!inner (user_id, date)
            `)
            .eq('workouts.user_id', userId);

        if (error) throw error;
        return data || [];
    },

    // User Settings
    async getUserSettings(userId) {
        const { data, error } = await supabase
            .from('user_settings')
            .select('*')
            .eq('user_id', userId)
            .single();

        if (error && error.code !== 'PGRST116') throw error;
        return data;
    },

    async upsertUserSettings(userId, settings) {
        const { data, error } = await supabase
            .from('user_settings')
            .upsert({ user_id: userId, ...settings })
            .select()
            .single();

        if (error) throw error;
        return data;
    }
};
