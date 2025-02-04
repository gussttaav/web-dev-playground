import { ThemeUtils } from './utils/theme.utils.js';
import { AuthService } from './services/auth.service.js';

/**
 * Toggles visibility between login and registration forms
 * - Hides the currently visible form
 * - Shows the other form
 * Used by both the "Register here" and "Login here" buttons
 */
function toggleForms() {
    document.getElementById('loginForm').classList.toggle('d-none');
    document.getElementById('registerForm').classList.toggle('d-none');
}

/**
 * Displays a login error message
 * Updates the login alert with custom error message and makes it visible
 * @param {string} message - Error message to display
 */
function writeLoginErrorMessage(message) {
    let loginAlert = document.getElementById('loginAlert');
    loginAlert.classList.remove('d-none');
    loginAlert.textContent = message;
}

/**
 * Main controller for authentication functionality
 * Handles:
 * - Initialization of the auth page
 * - Event listeners for forms
 * - Login and registration logic
 * - Theme management
 */
class AuthController {
    constructor() {
        document.addEventListener('DOMContentLoaded', () => {
            this.initializeApp();
        });
    }

    /**
     * Initializes the authentication application
     * - Sets up theme management
     * - Initializes all event listeners
     */
    initializeApp() {
        ThemeUtils.initialize();
        this.initializeEventListeners();
    }

    /**
     * Sets up all event listeners for the auth page
     * Includes:
     * - Theme toggle button
     * - Login form submission
     * - Registration form submission
     */
    initializeEventListeners() {
        // Theme toggle
        document.getElementById('themeToggle')?.addEventListener('click', ThemeUtils.toggle.bind(ThemeUtils));

        // Login form
        document.getElementById('login-form')?.addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.handleLogin(e);
        });

        // Register form
        document.getElementById('register-form')?.addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.handleRegister();
        });
    }

    /**
     * Handles login form submission
     * Attempts to authenticate the user
     * On success:
     * - Redirects to dashboard
     * On error:
     * - Shows error message in login alert
     * @param {Event} event - Form submit event
     */
    async handleLogin(event) {
        event.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        try {
            await AuthService.login(email, password);
            window.location.href = 'dashboard.html';
        } catch (error) {
            const loginAlert = document.getElementById('loginAlert');
            loginAlert.textContent = error.message;
            loginAlert.classList.remove('d-none');
        }
    }

    /**
     * Handles register form submission
     * Displays success/error messages using alerts
     * On success: 
     * - Clears the form
     * - Switches to login view
     * - Shows success message in login alert
     * On error:
     * - Shows error message in register alert
     */
    async handleRegister() {
        const registerAlert = document.getElementById('registerAlert');
        registerAlert.classList.add('d-none');

        try {
            const userData = {
                nombre: document.getElementById('reg-nombre').value,
                email: document.getElementById('reg-email').value,
                password: document.getElementById('reg-password').value
            };
            await AuthService.register(userData);
            
            // Clear form and switch to login view
            document.getElementById('register-form').reset();
            toggleForms();
            
            // Show success message in login form
            const loginAlert = document.getElementById('loginAlert');
            loginAlert.classList.remove('d-none');
            loginAlert.className = loginAlert.className.replace('alert-danger', 'alert-success');
            loginAlert.textContent = 'Registration successful! Please login.';
        } catch (error) {
            registerAlert.textContent = error.message;
            registerAlert.classList.remove('d-none');
        }
    }
}

// Initialize auth controller
const auth = new AuthController();

// Export functions needed for HTML
window.toggleForms = toggleForms;