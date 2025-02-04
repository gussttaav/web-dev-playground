import { ApiService } from './api.service.js';

/**
 * Service to handle product-related operations
 * Manages:
 * - Product listing with status filtering
 * - Product creation
 * - Product updates
 * - Product status toggling
 * All operations require authentication
 */
class ProductService {
    /**
     * Fetches products based on status
     * - Supports filtering by ALL, ACTIVE, INACTIVE
     * - Returns filtered product list
     * - Used in both user and admin views
     * - Requires authentication
     * @param {string} status - Product status filter ('ALL', 'ACTIVE', 'INACTIVE')
     * @returns {Promise<Array>} List of products
     */
    static async getProducts(status = 'ACTIVE') {
        return ApiService.get(`/productos/listar?status=${status}`);
    }

    /**
     * Creates a new product
     * - Admin only operation
     * - Validates product data
     * - Creates product in database
     * - Returns created product details
     * @param {Object} productData - Product information
     * @returns {Promise<Object>} Created product
     */
    static async createProduct(productData) {
        return ApiService.post('/productos/crear', productData);
    }

    /**
     * Updates an existing product
     * - Admin only operation
     * - Updates all product fields
     * - Validates product existence
     * - Returns updated product
     * @param {number} productId - Product ID
     * @param {Object} productData - Updated product information
     * @returns {Promise<Object>} Updated product
     */
    static async updateProduct(productId, productData) {
        return ApiService.put(`/productos/actualizar/${productId}`, productData);
    }

    /**
     * Toggles product status
     * - Switches between active/inactive
     * - Admin only operation
     * - Fetches current product first
     * - Updates only status field
     * - Handles product not found case
     * @param {number} productId - Product ID
     * @param {boolean} isActive - New status
     * @returns {Promise<Object>} Updated product
     */
    static async toggleStatus(productId, isActive) {
        const product = await this.getProducts('ALL')
            .then(products => products.find(p => p.id === productId));
        
        if (!product) {
            throw new Error('Product not found');
        }

        return this.updateProduct(productId, {
            ...product,
            activo: isActive
        });
    }
}

export { ProductService }; 