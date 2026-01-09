// Authentication Module
import { supabase } from './supabase.js';
import { showToast, showLoading, hideLoading, saveCurrentUser, clearCurrentUser } from './utils.js';

// Initialize auth listeners
export function initAuth() {
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const showRegisterLink = document.getElementById('show-register');
    const showLoginLink = document.getElementById('show-login');

    // Form switching
    showRegisterLink?.addEventListener('click', (e) => {
        e.preventDefault();
        loginForm.classList.add('hidden');
        registerForm.classList.remove('hidden');
    });

    showLoginLink?.addEventListener('click', (e) => {
        e.preventDefault();
        registerForm.classList.add('hidden');
        loginForm.classList.remove('hidden');
    });

    // Login form submission
    loginForm?.addEventListener('submit', async (e) => {
        e.preventDefault();
        await handleLogin();
    });

    // Register form submission
    registerForm?.addEventListener('submit', async (e) => {
        e.preventDefault();
        await handleRegister();
    });

    // Check if user is already logged in
    checkAuthStatus();
}

// Handle login
async function handleLogin() {
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    showLoading();

    try {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
        });

        if (error) throw error;

        // Save user info
        saveCurrentUser(data.user);

        showToast('Welcome back!', 'success');

        // Show app, hide auth
        showApp();

    } catch (error) {
        console.error('Login error:', error);
        showToast(error.message || 'Login failed', 'error');
    } finally {
        hideLoading();
    }
}

// Handle registration
async function handleRegister() {
    const name = document.getElementById('register-name').value;
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;

    if (password.length < 6) {
        showToast('Password must be at least 6 characters', 'error');
        return;
    }

    showLoading();

    try {
        // Create auth user
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    full_name: name
                }
            }
        });

        if (error) throw error;

        // Create user profile
        const { error: profileError } = await supabase
            .from('user_profiles')
            .insert({
                user_id: data.user.id,
                name: name,
                email: email
            });

        if (profileError) throw profileError;

        // Save user info
        saveCurrentUser(data.user);

        showToast('Account created successfully!', 'success');

        // Show app, hide auth
        showApp();

    } catch (error) {
        console.error('Registration error:', error);
        showToast(error.message || 'Registration failed', 'error');
    } finally {
        hideLoading();
    }
}

// Check authentication status
export async function checkAuthStatus() {
    showLoading();

    try {
        const { data: { session }, error } = await supabase.auth.getSession();

        if (error) throw error;

        if (session) {
            saveCurrentUser(session.user);
            showApp();
        } else {
            showAuth();
        }
    } catch (error) {
        console.error('Auth check error:', error);
        showAuth();
    } finally {
        hideLoading();
    }
}

// Show app (hide auth)
function showApp() {
    document.getElementById('auth-container').classList.add('hidden');
    document.getElementById('app-container').classList.remove('hidden');

    // Trigger app initialization
    window.dispatchEvent(new Event('app-ready'));
}

// Show auth (hide app)
function showAuth() {
    document.getElementById('auth-container').classList.remove('hidden');
    document.getElementById('app-container').classList.add('hidden');
}

// Logout
export async function logout() {
    showLoading();

    try {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;

        clearCurrentUser();
        showToast('Logged out successfully', 'success');
        showAuth();

        // Reset forms
        document.getElementById('login-form').reset();
        document.getElementById('register-form').reset();

    } catch (error) {
        console.error('Logout error:', error);
        showToast('Logout failed', 'error');
    } finally {
        hideLoading();
    }
}

// Get current session
export async function getCurrentSession() {
    const { data: { session } } = await supabase.auth.getSession();
    return session;
}

// Listen for auth state changes
supabase.auth.onAuthStateChange((event, session) => {
    console.log('Auth state changed:', event);

    if (event === 'SIGNED_OUT') {
        showAuth();
    } else if (event === 'SIGNED_IN') {
        saveCurrentUser(session.user);
        showApp();
    }
});
