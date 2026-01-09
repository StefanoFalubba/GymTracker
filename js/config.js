// Supabase Configuration
// IMPORTANT: Replace these with your actual Supabase project credentials
// Get them from: https://app.supabase.com/project/_/settings/api

export const SUPABASE_CONFIG = {
    url: 'https://lymwbqttehyxdroeeqpi.supabase.co', // e.g., 'https://xxxxx.supabase.co'
    anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx5bXdicXR0ZWh5eGRyb2VlcXBpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc5NDUzNzIsImV4cCI6MjA4MzUyMTM3Mn0.VgbG-ZXCJPM56GT55U0QTHZsfx-7FufDWaNRQv0M6fs' // Your public anon key
};

// App Configuration
export const APP_CONFIG = {
    appName: 'GymTracker',
    version: '1.0.0',
    defaultTheme: 'light', // 'light' or 'dark'
    defaultUnits: 'kg', // 'kg' or 'lbs'
    defaultRestTime: 90, // seconds
};
