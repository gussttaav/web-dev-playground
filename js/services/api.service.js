import { UiUtils } from '../utils/ui.utils.js';

/**
 * Base URL for all API endpoints
 * Used as prefix for all API requests
 * @constant {string} API_URL - Base URL for API calls
 */
const API_URL = 'http://localhost:8080/api';

/**
 * Makes an authenticated fetch request
 * Handles:
 * - Authentication token validation
 * - Request headers setup
 * - Error responses (401, etc.)
 * - Loading spinner management
 * - Session expiration
 * - Automatic redirect on auth failure
 * @param {string} url - URL to fetch
 * @param {Object} options - Fetch options
 * @returns {Promise} - Fetch response
 */
export async function fetchWithAuth(url, options = {}) {
    const token = localStorage.getItem('authToken');
    if (!token) {
        window.location.href = 'index.html';
        throw new Error('No auth token found');
    }

    const defaultOptions = {
        headers: {
            'Authorization': token,
            'Content-Type': 'application/json'
        }
    };

    UiUtils.showSpinner();
    
    try {
        const response = await fetch(url, { ...defaultOptions, ...options });
        
        if (response.status === 401) {
            localStorage.clear();
            window.location.href = 'index.html';
            throw new Error('Session expired');
        }

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Network response was not ok');
        }

        return response;
    } finally {
        UiUtils.hideSpinner();
    }
}

/**
 * Service to handle API calls
 * Provides standardized methods for:
 * - GET requests
 * - POST requests with JSON body
 * - PUT requests with JSON body
 * All methods:
 * - Include authentication
 * - Handle empty responses
 * - Parse JSON when present
 */
export const ApiService = {
    API_URL,

    /**
     * Makes a GET request to the API
     * Handles empty responses and JSON parsing
     * Includes authentication headers
     * @param {string} endpoint - API endpoint
     * @returns {Promise} - API response
     */
    async get(endpoint) {
        const response = await fetchWithAuth(`${API_URL}${endpoint}`);
        const text = await response.text();
        return text ? JSON.parse(text) : null;
    },

    /**
     * Makes a POST request to the API
     * Automatically:
     * - Converts body to JSON
     * - Adds content-type headers
     * - Handles empty responses
     * @param {string} endpoint - API endpoint
     * @param {Object} data - Request body
     * @returns {Promise} - API response
     */
    async post(endpoint, data) {
        const response = await fetchWithAuth(`${API_URL}${endpoint}`, {
            method: 'POST',
            body: JSON.stringify(data)
        });
        const text = await response.text();
        return text ? JSON.parse(text) : null;
    },

    /**
     * Makes a PUT request to the API
     * Similar to POST but for updates
     * Handles:
     * - JSON conversion
     * - Authentication
     * - Empty responses
     * @param {string} endpoint - API endpoint
     * @param {Object} data - Request body
     * @returns {Promise} - API response
     */
    async put(endpoint, data) {
        const response = await fetchWithAuth(`${API_URL}${endpoint}`, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
        const text = await response.text();
        return text ? JSON.parse(text) : null;
    }
}; 