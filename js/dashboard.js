const API_URL = 'http://localhost:8080/api';
let selectedProducts = new Map();
let productsList = [];

// Auth check and setup
function checkAuth() {
    const token = localStorage.getItem('authToken');
    if (!token) {
        window.location.href = 'index.html';
        return;
    }

    const userRole = localStorage.getItem('userRole');
    document.getElementById('userEmail').textContent = localStorage.getItem('userName');

    // Show/hide elements based on role
    const userOnlyElements = document.querySelectorAll('.user-only');
    const adminOnlyElements = document.querySelectorAll('.admin-only');

    userOnlyElements.forEach(el => {
        el.style.display = userRole === 'USER' ? 'block' : 'none';
    });

    adminOnlyElements.forEach(el => {
        el.style.display = userRole === 'ADMIN' ? 'block' : 'none';
    });

    if(userRole === 'USER'){
        loadProducts();
    }

    if(userRole === 'ADMIN'){
        loadProducts('ALL');
    }
}

// Loading spinner management
function showLoading() {
    document.getElementById('loadingSpinner').style.display = 'flex';
}

function hideLoading() {
    document.getElementById('loadingSpinner').style.display = 'none';
}

// Toast notifications
function showToast(message, type = 'success') {
    const toastContainer = document.querySelector('.toast-container');
    const toastHtml = `
        <div class="toast align-items-center text-white bg-${type} border-0" role="alert">
            <div class="d-flex">
                <div class="toast-body">
                    ${message}
                </div>
                <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
            </div>
        </div>
    `;
    toastContainer.insertAdjacentHTML('beforeend', toastHtml);
    
    const toastElement = toastContainer.lastElementChild;
    const toast = new bootstrap.Toast(toastElement, { delay: 3000 });
    toast.show();
    
    // Remove toast after it's hidden
    toastElement.addEventListener('hidden.bs.toast', () => {
        toastElement.remove();
    });
}

// API calls
async function fetchWithAuth(url, options = {}) {
    const authToken = localStorage.getItem('authToken');
    if (!authToken) {
        localStorage.clear();
        window.location.href = 'index.html';
        return;
    }

    showLoading();

    try{
        const response = await fetch(url, {
            ...options,
            headers: {
                ...options.headers,
                'Authorization': authToken,
                'Content-Type': 'application/json',
            }
        });

        if (!response.ok) {
            if (response.status === 401) {
                localStorage.clear();
                window.location.href = 'index.html';
                throw new Error('Session expired');
            }
            const error = await response.json();
            throw new Error(error.message || 'API request failed');
        }

        return response;
    }
    finally{
        hideLoading();
    }
}

async function loadProfile() {
    try {
        const response = await fetchWithAuth(`${API_URL}/usuarios/perfil`);
        const profile = await response.json();
        
        document.getElementById('profileName').value = profile.nombre;
        document.getElementById('profileEmail').value = profile.email;
    } catch (error) {
        showError('Error loading profile: ' + error.message);
    }
}

async function updateProfile(event) {
    event.preventDefault();
    
    const profileData = {
        nombre: document.getElementById('profileName').value,
        nuevoEmail: document.getElementById('profileEmail').value
    };

    try {
        await fetchWithAuth(`${API_URL}/usuarios/perfil`, {
            method: 'PUT',
            body: JSON.stringify(profileData)
        });

        showSuccess('Profile updated successfully!');
        localStorage.setItem('userEmail', profileData.nuevoEmail);
        document.getElementById('userEmail').textContent = profileData.nuevoEmail;
    } catch (error) {
        showError('Error updating profile: ' + error.message);
    }
}

async function changePassword(event) {
    event.preventDefault();
    
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    if (newPassword !== confirmPassword) {
        showError('New passwords do not match');
        return;
    }

    const passwordData = {
        currentPassword: document.getElementById('currentPassword').value,
        newPassword: newPassword,
        confirmPassword: confirmPassword
    };

    try {
        await fetchWithAuth(`${API_URL}/usuarios/password`, {
            method: 'PUT',
            body: JSON.stringify(passwordData)
        });

        showSuccess('Password changed successfully!');
        document.getElementById('passwordForm').reset();
    } catch (error) {
        showError('Error changing password: ' + error.message);
    }
}

async function loadUsers() {
    try {
        const response = await fetchWithAuth(`${API_URL}/usuarios/admin/listar`);
        const users = await response.json();
        displayUsers(users);
    } catch (error) {
        showError('Error loading users: ' + error.message);
    }
}

async function loadProducts(status = 'ACTIVE') {
    try {
        const response = await fetchWithAuth(`${API_URL}/productos/listar?status=${status}`);
        productsList = await response.json();
        if (localStorage.getItem('userRole') === 'ADMIN') {
            displayAdminProducts(productsList);
        } else {
            displayProducts(productsList);
        }
    } catch (error) {
        showError('Error loading products: ' + error.message);
    }
}

async function loadPurchases() {
    try {
        const response = await fetchWithAuth(`${API_URL}/compras/listar`);
        const purchases = await response.json();
        displayPurchases(purchases);
    } catch (error) {
        showError('Error loading purchases: ' + error.message);
    }
}

// Display functions
function displayProducts(products) {
    // Display in product cards (for both users and admins)
    const container = document.getElementById('productsList');
    container.innerHTML = '';

    products.forEach(product => {
        const card = document.createElement('div');
        card.className = 'col-md-4 mb-4';
        card.innerHTML = `
            <div class="card">
                <div class="card-body">
                    <h5 class="card-title">${product.nombre}</h5>
                    <p class="card-text">${product.descripcion || 'No description available'}</p>
                    <p class="card-text">$${product.precio}</p>
                    ${localStorage.getItem('userRole') === 'USER' ? `
                        <div class="d-flex align-items-center">
                            <input type="number" class="form-control form-control-sm w-25 me-2" 
                                   value="1" min="1" id="qty-${product.id}">
                            <button class="btn btn-primary" onclick="addToCart(${product.id})">
                                Add to Cart
                            </button>
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
        container.appendChild(card);
    });
}

function displayAdminProducts(products) {
    const tbody = document.getElementById('adminProductsList');
    tbody.innerHTML = '';

    products.forEach(product => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${product.nombre}</td>
            <td>${product.descripcion || 'No description'}</td>
            <td>$${product.precio}</td>
            <td>
                <div class="form-check">
                    <input class="form-check-input" type="checkbox" 
                           id="active-${product.id}" 
                           ${product.activo ? 'checked' : ''}
                           onchange="toggleProductStatus(${product.id}, this.checked)">
                    <label class="form-check-label" for="active-${product.id}">
                        Active
                    </label>
                </div>
            </td>
            <td>
                <button class="btn btn-sm btn-primary me-2" onclick="showAddProductModal(${product.id})">
                    Edit
                </button>
            </td>
        `;
        tbody.appendChild(row);
    });
}


function displayUsers(users) {
    const tbody = document.getElementById('adminUsersList');
    tbody.innerHTML = '';

    users.forEach(user => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${user.nombre}</td>
            <td>${user.email}</td>
            <td>${user.rol}</td>
            <td>${new Date(user.fechaCreacion).toLocaleString()}</td>
            <td>
                <button class="btn btn-sm btn-outline-danger" onclick="toggleUserRole(${user.id}, '${user.rol}')">
                    Change Role
                </button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

async function toggleProductStatus(productId, isActive) {
    try {
        const product = productsList.find(p => p.id === productId);
        if (!product) return;

        const updatedProduct = {
            nombre: product.nombre,
            descripcion: product.descripcion,
            precio: product.precio,
            activo: isActive
        };

        await fetchWithAuth(`${API_URL}/productos/actualizar/${productId}`, {
            method: 'PUT',
            body: JSON.stringify(updatedProduct)
        });

        showSuccess(`Product ${isActive ? 'activated' : 'deactivated'} successfully!`);
        
        // Reload products with current filter
        const statusFilter = document.getElementById('statusFilter').value;
        await loadProducts(statusFilter);
    } catch (error) {
        showError('Error updating product status: ' + error.message);
        // Revert checkbox state on error
        document.getElementById(`active-${productId}`).checked = !isActive;
    }
}

async function toggleUserRole(userId, role) {
    if (!confirm('Are you sure you want to change this user\'s role?')) {
        return;
    }

    newRole = role === 'ADMIN' ? 'USER' : 'ADMIN';
    try {
        await fetchWithAuth(`${API_URL}/usuarios/admin/change-role?userId=${userId}&newRole=${newRole}`, {
            method: 'PUT'
        });
        showSuccess('User role updated successfully!');
        loadUsers();
    } catch (error) {
        showError('Error updating user role: ' + error.message);
    }
}

function displayPurchases(purchases) {
    const tbody = document.getElementById('purchasesList');
    tbody.innerHTML = '';

    purchases.forEach(purchase => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${new Date(purchase.fecha).toLocaleString()}</td>
            <td>
                <ul class="list-unstyled">
                    ${purchase.productos.map(prod => 
                        `<li>${prod.productoNombre} x ${prod.cantidad} - $${prod.subtotal}</li>`
                    ).join('')}
                </ul>
            </td>
            <td>$${purchase.total}</td>
        `;
        tbody.appendChild(row);
    });
}

// Cart functions
function addToCart(productId) {
    const product = productsList.find(p => p.id === productId);
    const quantity = parseInt(document.getElementById(`qty-${productId}`).value);

    if (quantity < 1) {
        showError('Quantity must be greater than 0');
        return;
    }

    selectedProducts.set(productId, {
        ...product,
        quantity
    });

    updateCartButton();
}

function updateCartButton() {
    if (selectedProducts.size > 0) {
        const total = calculateTotal();
        showPurchaseModal();
    }
}

function calculateTotal() {
    let total = 0;
    selectedProducts.forEach(item => {
        total += item.precio * item.quantity;
    });
    return total;
}

// Purchase Modal functions
function showPurchaseModal() {
    const detailsContainer = document.getElementById('purchaseDetails');
    const totalElement = document.getElementById('purchaseTotal');
    
    detailsContainer.innerHTML = '';
    selectedProducts.forEach(item => {
        const itemDiv = document.createElement('div');
        itemDiv.className = 'mb-2';
        itemDiv.innerHTML = `
            <div class="d-flex justify-content-between">
                <span>${item.nombre} x ${item.quantity}</span>
                <span>$${(item.precio * item.quantity).toFixed(2)}</span>
            </div>
        `;
        detailsContainer.appendChild(itemDiv);
    });

    totalElement.textContent = calculateTotal().toFixed(2);
    new bootstrap.Modal(document.getElementById('purchaseModal')).show();
}

async function showAddUserModal() {
    const modal = document.getElementById('userModal');
    const title = document.getElementById('userModalTitle');
    const form = document.getElementById('userForm');

    form.reset();
    title.textContent = 'Add Admin User';
    document.getElementById('userId').value = '';
    document.getElementById('userPassword').required = true;

    new bootstrap.Modal(modal).show();
}

async function confirmPurchase() {
    try {
        const purchaseData = {
            productos: Array.from(selectedProducts.values()).map(item => ({
                productoId: item.id,
                cantidad: item.quantity
            }))
        };

        await fetchWithAuth(`${API_URL}/compras/nueva`, {
            method: 'POST',
            body: JSON.stringify(purchaseData)
        });

        selectedProducts.clear();
        updateCartCount();
        bootstrap.Modal.getInstance(document.getElementById('checkoutModal')).hide();
        showSuccess('Purchase completed successfully!');
        loadPurchases();
    } catch (error) {
        showError('Error completing purchase: ' + error.message);
    }
}

// Admin functions
async function showAddProductModal(productId = null) {
    const modal = document.getElementById('productModal');
    const title = document.getElementById('productModalTitle');
    const form = document.getElementById('productForm');

    form.reset();
    if (productId) {
        const product = productsList.find(p => p.id === productId);
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

async function saveProduct() {
    const productId = document.getElementById('productId').value;
    const productData = {
        nombre: document.getElementById('productName').value,
        descripcion: document.getElementById('productDescription').value,
        precio: parseFloat(document.getElementById('productPrice').value),
        activo: true
    };

    try {
        let response;
        if (productId) {

            const existingProduct = productsList.find(p => p.id === parseInt(productId));
            if (existingProduct) {
                productData.activo = existingProduct.activo;
            }

            response = await fetchWithAuth(`${API_URL}/productos/actualizar/${productId}`, {
                method: 'PUT',
                body: JSON.stringify(productData)
            });
        } else {
            response = await fetchWithAuth(`${API_URL}/productos/crear`, {
                method: 'POST',
                body: JSON.stringify(productData)
            });
        }

        const savedProduct = await response.json();
        
        // Update local products list
        if (productId) {
            const index = productsList.findIndex(p => p.id === parseInt(productId));
            if (index !== -1) {
                productsList[index] = savedProduct;
            }
        } else {
            productsList.push(savedProduct);
        }

        bootstrap.Modal.getInstance(document.getElementById('productModal')).hide();
        showSuccess('Product saved successfully!');

        // Reload products with current filter
        const statusFilter = document.getElementById('statusFilter').value;
        await loadProducts(statusFilter);
    } catch (error) {
        showError('Error saving product: ' + error.message);
    }
}

async function saveUser() {
    const userData = {
        nombre: document.getElementById('userName').value,
        email: document.getElementById('newUserEmail').value,
        password: document.getElementById('userPassword').value,
        rol: 'ADMIN'
    };

    try {

        // Create new admin user
        await fetchWithAuth(`${API_URL}/usuarios/admin/registro`, {
            method: 'POST',
            body: JSON.stringify(userData)
        });

        bootstrap.Modal.getInstance(document.getElementById('userModal')).hide();
        showSuccess('User saved successfully!');
        loadUsers();
    } catch (error) {
        showError('Error saving user: ' + error.message);
    }
}

function addToCart(productId) {
    const product = productsList.find(p => p.id === productId);
    const quantity = parseInt(document.getElementById(`qty-${productId}`).value);

    if (quantity < 1) {
        showError('Quantity must be greater than 0');
        return;
    }

    if (selectedProducts.has(productId)) {
        const currentItem = selectedProducts.get(productId);
        selectedProducts.set(productId, {
            ...currentItem,
            quantity: currentItem.quantity + quantity
        });
    } else {
        selectedProducts.set(productId, {
            ...product,
            quantity
        });
    }

    updateCartCount();
    showSuccess(`Added ${quantity} ${product.nombre} to cart`);
}

function updateCartCount() {
    const count = Array.from(selectedProducts.values()).reduce((total, item) => total + item.quantity, 0);
    document.getElementById('cartCount').textContent = count;
}

function showCartModal() {
    const tbody = document.getElementById('cartItems');
    const totalElement = document.getElementById('cartTotal');
    tbody.innerHTML = '';

    selectedProducts.forEach((item, productId) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${item.nombre}</td>
            <td>$${item.precio}</td>
            <td>
                <div class="input-group input-group-sm" style="width: 120px">
                    <button class="btn btn-outline-secondary" type="button" 
                            onclick="updateCartItemQuantity(${productId}, ${item.quantity - 1})">-</button>
                    <input type="number" class="form-control text-center" value="${item.quantity}" 
                           onchange="updateCartItemQuantity(${productId}, this.value)"
                           min="1">
                    <button class="btn btn-outline-secondary" type="button"
                            onclick="updateCartItemQuantity(${productId}, ${item.quantity + 1})">+</button>
                </div>
            </td>
            <td>$${(item.precio * item.quantity).toFixed(2)}</td>
            <td>
                <button class="btn btn-sm btn-danger" onclick="removeFromCart(${productId})">
                    <i class="bi bi-trash"></i>
                </button>
            </td>
        `;
        tbody.appendChild(tr);
    });

    totalElement.textContent = calculateTotal().toFixed(2);
    new bootstrap.Modal(document.getElementById('cartModal')).show();
}

function updateCartItemQuantity(productId, newQuantity) {
    newQuantity = parseInt(newQuantity);
    if (newQuantity < 1) {
        showError('Quantity must be greater than 0');
        return;
    }

    const item = selectedProducts.get(productId);
    if (item) {
        selectedProducts.set(productId, {
            ...item,
            quantity: newQuantity
        });
        updateCartCount();
        showCartModal(); // Refresh the modal
    }
}

function removeFromCart(productId) {
    selectedProducts.delete(productId);
    updateCartCount();
    showCartModal(); // Refresh the modal
}

function proceedToCheckout() {
    if (selectedProducts.size === 0) {
        showError('Your cart is empty');
        return;
    }

    // Hide cart modal and show checkout modal
    bootstrap.Modal.getInstance(document.getElementById('cartModal')).hide();
    showCheckoutModal();
}

function showCheckoutModal() {
    const detailsContainer = document.getElementById('purchaseDetails');
    const totalElement = document.getElementById('purchaseTotal');
    
    detailsContainer.innerHTML = '';
    selectedProducts.forEach(item => {
        const itemDiv = document.createElement('div');
        itemDiv.className = 'mb-2';
        itemDiv.innerHTML = `
            <div class="d-flex justify-content-between">
                <span>${item.nombre} x ${item.quantity}</span>
                <span>$${(item.precio * item.quantity).toFixed(2)}</span>
            </div>
        `;
        detailsContainer.appendChild(itemDiv);
    });

    totalElement.textContent = calculateTotal().toFixed(2);
    new bootstrap.Modal(document.getElementById('checkoutModal')).show();
}

// Utility functions
function showError(message) {
    showToast(message, 'danger');
}

function showSuccess(message) {
    showToast(message, 'success');
}

// Theme management
function initializeTheme() {
    // Si el usuario ya ha establecido una preferencia, usarla
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        document.documentElement.setAttribute('data-bs-theme', savedTheme);
        updateThemeButton(savedTheme);
        return;
    }

    // Detectar preferencia del sistema
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const systemTheme = prefersDark ? 'dark' : 'light';
    
    document.documentElement.setAttribute('data-bs-theme', systemTheme);
    localStorage.setItem('theme', systemTheme);
    updateThemeButton(systemTheme);
}

function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-bs-theme');
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-bs-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateThemeButton(newTheme);
}

function updateThemeButton(theme) {
    const button = document.getElementById('themeToggle');
    const icon = button.querySelector('i');
    if (theme === 'dark') {
        icon.classList.replace('bi-moon-fill', 'bi-sun-fill');
    } else {
        icon.classList.replace('bi-sun-fill', 'bi-moon-fill');
    }
}

function logout() {
    localStorage.clear();
    window.location.href = 'index.html';
}

function hideAllSections() {
    const sections = [
        'productsSection',
        'purchasesSection',
        'adminSection',
        'profileSection',
        'passwordSection',
        'adminUsersSection'
    ];
    sections.forEach(section => {
        document.getElementById(section).classList.add('d-none');
    });
}

// Event Listeners and Navigation
document.addEventListener('DOMContentLoaded', () => {
    initializeTheme();
    checkAuth();

    document.getElementById('productsLink').addEventListener('click', (e) => {
        e.preventDefault();
        hideAllSections();
        document.getElementById('productsSection').classList.remove('d-none');
        document.getElementById('purchasesLink').classList.remove('active');
        document.getElementById('productsLink').classList.add('active');
    });

    document.getElementById('purchasesLink').addEventListener('click', (e) => {
        e.preventDefault();
        hideAllSections();
        document.getElementById('purchasesSection').classList.remove('d-none');
        document.getElementById('productsLink').classList.remove('active');
        document.getElementById('purchasesLink').classList.add('active');
        loadPurchases();
    });

    document.getElementById('adminProductsLink')?.addEventListener('click', (e) => {
        e.preventDefault();
        hideAllSections();
        document.getElementById('adminSection').classList.remove('d-none');
        document.getElementById('adminUsersLink').classList.remove('active');
        document.getElementById('adminProductsLink').classList.add('active');
        loadProducts('ALL');
    });

    document.getElementById('statusFilter')?.addEventListener('change', (e) => {
        loadProducts(e.target.value);
    });

    document.getElementById('profileLink').addEventListener('click', (e) => {
        e.preventDefault();
        hideAllSections();
        document.getElementById('profileSection').classList.remove('d-none');
        loadProfile();
    });

    document.getElementById('changePasswordLink').addEventListener('click', (e) => {
        e.preventDefault();
        hideAllSections();
        document.getElementById('passwordSection').classList.remove('d-none');
    });

    document.getElementById('adminUsersLink')?.addEventListener('click', (e) => {
        e.preventDefault();
        hideAllSections();
        document.getElementById('adminUsersSection').classList.remove('d-none');
        document.getElementById('adminProductsLink').classList.remove('active');
        document.getElementById('adminUsersLink').classList.add('active');
        loadUsers();
    });

    document.getElementById('cartButton')?.addEventListener('click', (e) => {
        e.preventDefault();
        showCartModal();
    });

    document.getElementById('profileForm').addEventListener('submit', updateProfile);
    document.getElementById('passwordForm').addEventListener('submit', changePassword);
    document.getElementById('themeToggle').addEventListener('click', toggleTheme);
});