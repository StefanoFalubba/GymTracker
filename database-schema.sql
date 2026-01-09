-- GymTracker Database Schema for Supabase
-- Run this in your Supabase SQL Editor to create all necessary tables

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- User Profiles Table
CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
    name TEXT,
    email TEXT,
    age INTEGER,
    weight DECIMAL(5,2),
    height INTEGER,
    goals TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Exercises Table (both default and custom)
CREATE TABLE IF NOT EXISTS exercises (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    category TEXT,
    muscle_group TEXT,
    equipment TEXT,
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Training Cards Table
CREATE TABLE IF NOT EXISTS training_cards (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    assigned_days JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Training Card Exercises Table (junction table with exercise details)
CREATE TABLE IF NOT EXISTS training_card_exercises (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    training_card_id UUID REFERENCES training_cards(id) ON DELETE CASCADE NOT NULL,
    exercise_id UUID REFERENCES exercises(id) ON DELETE CASCADE NOT NULL,
    order_index INTEGER DEFAULT 0,
    sets INTEGER NOT NULL DEFAULT 3,
    reps INTEGER NOT NULL DEFAULT 10,
    weight DECIMAL(6,2),
    rest_time INTEGER DEFAULT 90,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Workouts Table (completed workout sessions)
CREATE TABLE IF NOT EXISTS workouts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    training_card_id UUID REFERENCES training_cards(id) ON DELETE SET NULL,
    date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    duration INTEGER,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Workout Exercises Table (exercises performed in a workout)
CREATE TABLE IF NOT EXISTS workout_exercises (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workout_id UUID REFERENCES workouts(id) ON DELETE CASCADE NOT NULL,
    exercise_id UUID REFERENCES exercises(id) ON DELETE CASCADE NOT NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Workout Sets Table (individual sets performed)
CREATE TABLE IF NOT EXISTS workout_sets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workout_exercise_id UUID REFERENCES workout_exercises(id) ON DELETE CASCADE NOT NULL,
    set_number INTEGER NOT NULL,
    reps INTEGER NOT NULL,
    weight DECIMAL(6,2) NOT NULL,
    completed BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User Settings Table
CREATE TABLE IF NOT EXISTS user_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
    theme_primary_hue INTEGER DEFAULT 260,
    theme_accent_hue INTEGER DEFAULT 340,
    dark_mode BOOLEAN DEFAULT FALSE,
    units TEXT DEFAULT 'kg',
    rest_timer_sound BOOLEAN DEFAULT TRUE,
    default_rest_time INTEGER DEFAULT 90,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_exercises_user_id ON exercises(user_id);
CREATE INDEX IF NOT EXISTS idx_training_cards_user_id ON training_cards(user_id);
CREATE INDEX IF NOT EXISTS idx_training_card_exercises_card_id ON training_card_exercises(training_card_id);
CREATE INDEX IF NOT EXISTS idx_workouts_user_id ON workouts(user_id);
CREATE INDEX IF NOT EXISTS idx_workouts_date ON workouts(date);
CREATE INDEX IF NOT EXISTS idx_workout_exercises_workout_id ON workout_exercises(workout_id);
CREATE INDEX IF NOT EXISTS idx_workout_sets_workout_exercise_id ON workout_sets(workout_exercise_id);

-- Enable Row Level Security (RLS)
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE training_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE training_card_exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE workouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_sets ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_profiles
CREATE POLICY "Users can view own profile" ON user_profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON user_profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON user_profiles FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for exercises
CREATE POLICY "Users can view own and default exercises" ON exercises FOR SELECT USING (auth.uid() = user_id OR is_default = TRUE);
CREATE POLICY "Users can insert own exercises" ON exercises FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own exercises" ON exercises FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own exercises" ON exercises FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for training_cards
CREATE POLICY "Users can view own training cards" ON training_cards FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own training cards" ON training_cards FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own training cards" ON training_cards FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own training cards" ON training_cards FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for training_card_exercises
CREATE POLICY "Users can view own training card exercises" ON training_card_exercises FOR SELECT 
    USING (EXISTS (SELECT 1 FROM training_cards WHERE training_cards.id = training_card_exercises.training_card_id AND training_cards.user_id = auth.uid()));
CREATE POLICY "Users can insert own training card exercises" ON training_card_exercises FOR INSERT 
    WITH CHECK (EXISTS (SELECT 1 FROM training_cards WHERE training_cards.id = training_card_exercises.training_card_id AND training_cards.user_id = auth.uid()));
CREATE POLICY "Users can update own training card exercises" ON training_card_exercises FOR UPDATE 
    USING (EXISTS (SELECT 1 FROM training_cards WHERE training_cards.id = training_card_exercises.training_card_id AND training_cards.user_id = auth.uid()));
CREATE POLICY "Users can delete own training card exercises" ON training_card_exercises FOR DELETE 
    USING (EXISTS (SELECT 1 FROM training_cards WHERE training_cards.id = training_card_exercises.training_card_id AND training_cards.user_id = auth.uid()));

-- RLS Policies for workouts
CREATE POLICY "Users can view own workouts" ON workouts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own workouts" ON workouts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own workouts" ON workouts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own workouts" ON workouts FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for workout_exercises
CREATE POLICY "Users can view own workout exercises" ON workout_exercises FOR SELECT 
    USING (EXISTS (SELECT 1 FROM workouts WHERE workouts.id = workout_exercises.workout_id AND workouts.user_id = auth.uid()));
CREATE POLICY "Users can insert own workout exercises" ON workout_exercises FOR INSERT 
    WITH CHECK (EXISTS (SELECT 1 FROM workouts WHERE workouts.id = workout_exercises.workout_id AND workouts.user_id = auth.uid()));
CREATE POLICY "Users can update own workout exercises" ON workout_exercises FOR UPDATE 
    USING (EXISTS (SELECT 1 FROM workouts WHERE workouts.id = workout_exercises.workout_id AND workouts.user_id = auth.uid()));
CREATE POLICY "Users can delete own workout exercises" ON workout_exercises FOR DELETE 
    USING (EXISTS (SELECT 1 FROM workouts WHERE workouts.id = workout_exercises.workout_id AND workouts.user_id = auth.uid()));

-- RLS Policies for workout_sets
CREATE POLICY "Users can view own workout sets" ON workout_sets FOR SELECT 
    USING (EXISTS (SELECT 1 FROM workout_exercises JOIN workouts ON workouts.id = workout_exercises.workout_id WHERE workout_exercises.id = workout_sets.workout_exercise_id AND workouts.user_id = auth.uid()));
CREATE POLICY "Users can insert own workout sets" ON workout_sets FOR INSERT 
    WITH CHECK (EXISTS (SELECT 1 FROM workout_exercises JOIN workouts ON workouts.id = workout_exercises.workout_id WHERE workout_exercises.id = workout_sets.workout_exercise_id AND workouts.user_id = auth.uid()));
CREATE POLICY "Users can update own workout sets" ON workout_sets FOR UPDATE 
    USING (EXISTS (SELECT 1 FROM workout_exercises JOIN workouts ON workouts.id = workout_exercises.workout_id WHERE workout_exercises.id = workout_sets.workout_exercise_id AND workouts.user_id = auth.uid()));
CREATE POLICY "Users can delete own workout sets" ON workout_sets FOR DELETE 
    USING (EXISTS (SELECT 1 FROM workout_exercises JOIN workouts ON workouts.id = workout_exercises.workout_id WHERE workout_exercises.id = workout_sets.workout_exercise_id AND workouts.user_id = auth.uid()));

-- RLS Policies for user_settings
CREATE POLICY "Users can view own settings" ON user_settings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own settings" ON user_settings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own settings" ON user_settings FOR UPDATE USING (auth.uid() = user_id);

-- Insert some default exercises
INSERT INTO exercises (name, category, muscle_group, equipment, is_default) VALUES
    ('Bench Press', 'Strength', 'Chest', 'Barbell', TRUE),
    ('Squat', 'Strength', 'Legs', 'Barbell', TRUE),
    ('Deadlift', 'Strength', 'Back', 'Barbell', TRUE),
    ('Overhead Press', 'Strength', 'Shoulders', 'Barbell', TRUE),
    ('Barbell Row', 'Strength', 'Back', 'Barbell', TRUE),
    ('Pull-ups', 'Strength', 'Back', 'Bodyweight', TRUE),
    ('Dips', 'Strength', 'Chest', 'Bodyweight', TRUE),
    ('Bicep Curls', 'Isolation', 'Arms', 'Dumbbell', TRUE),
    ('Tricep Extensions', 'Isolation', 'Arms', 'Dumbbell', TRUE),
    ('Lateral Raises', 'Isolation', 'Shoulders', 'Dumbbell', TRUE),
    ('Leg Press', 'Strength', 'Legs', 'Machine', TRUE),
    ('Leg Curl', 'Isolation', 'Legs', 'Machine', TRUE),
    ('Leg Extension', 'Isolation', 'Legs', 'Machine', TRUE),
    ('Lat Pulldown', 'Strength', 'Back', 'Machine', TRUE),
    ('Cable Flyes', 'Isolation', 'Chest', 'Cable', TRUE),
    ('Face Pulls', 'Isolation', 'Shoulders', 'Cable', TRUE),
    ('Plank', 'Core', 'Abs', 'Bodyweight', TRUE),
    ('Crunches', 'Core', 'Abs', 'Bodyweight', TRUE),
    ('Russian Twists', 'Core', 'Abs', 'Bodyweight', TRUE),
    ('Lunges', 'Strength', 'Legs', 'Bodyweight', TRUE)
ON CONFLICT DO NOTHING;
