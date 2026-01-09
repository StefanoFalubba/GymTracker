// Supabase Configuration
// IMPORTANT: Replace these with your actual Supabase project credentials
// Get them from: https://app.supabase.com/project/_/settings/api

export const SUPABASE_CONFIG = {
    url: 'YOUR_SUPABASE_URL', // e.g., 'https://xxxxx.supabase.co'
    anonKey: 'YOUR_SUPABASE_ANON_KEY' // Your public anon key
};

// App Configuration
export const APP_CONFIG = {
    appName: 'GymTracker',
    version: '1.0.0',
    defaultTheme: 'light', // 'light' or 'dark'
    defaultUnits: 'kg', // 'kg' or 'lbs'
    defaultRestTime: 90, // seconds
};
