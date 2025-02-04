import { ProductService } from '../services/product.service.js';
import { UiUtils } from '../utils/ui.utils.js';
import { cart } from './cart.component.js';

/**
 * Component to handle product-related UI and operations
 * Manages:
 * - Product listing and display
 * - Product creation (admin)
 * - Product updates (admin)
 * - Product status toggling
 * - Cart integration
 * - Different views for admin/user
 */
class ProductComponent {
    constructor() {
        this.products = [];
        this.initializeEventListeners();
    }

    /**
     * Initializes product-related event listeners
     * - Form submissions
     * - Modal controls
     * - Status toggle buttons
     * - Add to cart buttons
     * - Called on component creation
     * @private
     */
    initializeEventListeners() {
        document.getElementById('statusFilter')?.addEventListener('change', (e) => {
            this.loadProducts(e.target.value);
        });
        // Product form submission
        document.getElementById('productForm')?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveProduct();
        });

        // Add Product button
        document.getElementById('addProductButton')?.addEventListener('click', () => {
            this.showEditModal();
        });
    }

    /**
     * Loads and displays products
     * - Fetches products by status
     * - Different displays for admin/user
     * - Handles loading states
     * - Shows errors if any
     * - Adds interactive controls
     * @param {string} status - Product status filter
     */
    async loadProducts(status = 'ACTIVE') {
        try {
            this.products = await ProductService.getProducts(status);
            if (localStorage.getItem('userRole') === 'ADMIN') {
                this.displayAdminProducts();
            } else {
                this.displayUserProducts();
            }
        } catch (error) {
            UiUtils.showError('Error loading products: ' + error.message);
        }
    }

    /**
     * Displays products in user view
     * - Creates product cards
     * - Shows prices and descriptions
     * - Adds cart controls
     * - Handles empty states
     * - Responsive grid layout
     * @private
     * @param {Array} products - List of products to display
     */
    displayUserProducts() {
        const container = document.getElementById('productsList');
        container.innerHTML = '';

        this.products.forEach(product => {
            const card = document.createElement('div');
            card.className = 'col-md-4 mb-4';
            
            const quantityInput = document.createElement('input');
            quantityInput.type = 'number';
            quantityInput.className = 'form-control form-control-sm w-25 me-2';
            quantityInput.value = '1';
            quantityInput.min = '1';

            const addButton = document.createElement('button');
            addButton.className = 'btn btn-primary';
            addButton.textContent = 'Add to Cart';
            addButton.addEventListener('click', () => this.addToCart(product.id, parseInt(quantityInput.value)));

            const cardHtml = `
                <div class="card">
                    <div class="card-body">
                        <h5 class="card-title">${product.nombre}</h5>
                        <p class="card-text">${product.descripcion || 'No description available'}</p>
                        <p class="card-text">$${product.precio}</p>
                        <div class="d-flex align-items-center"></div>
                    </div>
                </div>
            `;

            card.innerHTML = cardHtml;
            const controlsContainer = card.querySelector('.d-flex');
            controlsContainer.appendChild(quantityInput);
            controlsContainer.appendChild(addButton);

            container.appendChild(card);
        });
    }

    /**
     * Displays products in admin view
     * - Creates product table
     * - Shows all product details
     * - Adds edit/status controls
     * - Includes creation date
     * - Status indicators
     * @private
     * @param {Array} products - List of products to display
     */
    displayAdminProducts() {
        const tbody = document.getElementById('adminProductsList');
        tbody.innerHTML = '';

        this.products.forEach(product => {
            const row = document.createElement('tr');
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.className = 'form-check-input';
            checkbox.checked = product.activo;
            checkbox.addEventListener('change', () => this.toggleStatus(product.id, checkbox.checked));

            const editButton = document.createElement('button');
            editButton.className = 'btn btn-link p-0 me-2';
            editButton.innerHTML = '<i class="bi bi-pencil-square"></i>';
            editButton.addEventListener('click', () => {
                this.showEditModal(product.id);
            });

            row.innerHTML = `
                <td>${product.nombre}</td>
                <td>${product.descripcion || 'No description'}</td>
                <td>$${product.precio}</td>
                <td>
                    <div class="form-check"></div>
                </td>
                <td></td>
            `;

            // Add checkbox and button to their cells
            row.querySelector('.form-check').appendChild(checkbox);
            row.querySelector('td:last-child').appendChild(editButton);

            tbody.appendChild(row);
        });
    }

    /**
     * Shows modal for adding/editing product
     * - Resets form for new product
     * - Populates form for edit
     * - Sets modal title
     * - Prepares validation
     * - Admin only function
     * @param {Object} [product] - Product to edit (if editing)
     */
    async showEditModal(productId = null) {
        const modal = document.getElementById('productModal');
        const title = document.getElementById('productModalTitle');
        const form = document.getElementById('productForm');

        form.reset();
        if (productId) {
            const product = this.products.find(p => p.id === productId);
            if (product) {
                title.textContent = 'Edit Product';
                document.getElementById('productId').value = product.id;
                document.getElementById('productName').value = product.nombre;
                document.getElementById('productDescription').value = product.descripcion || '';
                document.getElementById('productPrice').value = product.precio;
            }
        } else {
            title.textContent = 'Add Product';
            document.getElementById('productId').value = '';
        }

        new bootstrap.Modal(modal).show();
    }

    /**
     * Saves product (create/update)
     * - Validates form data
     * - Creates or updates product
     * - Refreshes product list
     * - Shows feedback
     * - Closes modal on success
     */
    async saveProduct() {
        const productId = document.getElementById('productId').value;
        const productData = {
            nombre: document.getElementById('productName').value,
            descripcion: document.getElementById('productDescription').value,
            precio: parseFloat(document.getElementById('productPrice').value),
            activo: true
        };

        try {
            if (productId) {
                const existingProduct = this.products.find(p => p.id === parseInt(productId));
                if (existingProduct) {
                    productData.activo = existingProduct.activo;
                }
                await ProductService.updateProduct(productId, productData);
            } else {
                await ProductService.createProduct(productData);
            }

            bootstrap.Modal.getInstance(document.getElementById('productModal')).hide();
            UiUtils.showSuccess('Product saved successfully!');
            this.loadProducts(document.getElementById('statusFilter').value);
        } catch (error) {
            UiUtils.showError('Error saving product: ' + error.message);
        }
    }

    /**
     * Toggles product status
     * - Switches active/inactive
     * - Updates UI immediately
     * - Shows confirmation
     * - Handles errors
     * - Admin only function
     * @param {number} productId - Product ID
     * @param {boolean} currentStatus - Current product status
     */
    async toggleStatus(productId, isActive) {
        try {
            await ProductService.toggleStatus(productId, isActive);
            UiUtils.showSuccess(`Product ${isActive ? 'activated' : 'deactivated'} successfully!`);
            this.loadProducts(document.getElementById('statusFilter').value);
        } catch (error) {
            UiUtils.showError('Error updating product status: ' + error.message);
            document.getElementById(`active-${productId}`).checked = !isActive;
        }
    }

    /**
     * Adds a product to the cart
     * @param {number} productId - Product ID to add
     * @param {number} quantity - Quantity to add
     */
    addToCart(productId, quantity) {
        const product = this.products.find(p => p.id === productId);
        
        try {
            cart.addProduct(product, quantity);
            UiUtils.showSuccess(`Added ${quantity} ${product.nombre} to cart`);
        } catch (error) {
            UiUtils.showError(error.message);
        }
    }

    /**
     * Shows modal for adding a new product
     */
    showAddProductModal() {
        this.showEditModal(); // Reuse showEditModal with no productId
    }
}

export const productComponent = new ProductComponent(); 