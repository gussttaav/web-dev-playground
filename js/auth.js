const API_URL = 'http://localhost:8080/api';

function toggleForms() {
    document.getElementById('loginForm').classList.toggle('d-none');
    document.getElementById('registerForm').classList.toggle('d-none');
}

function writeLoginErrorMessage(message){
    let loginAlert = document.getElementById('loginAlert')
    loginAlert.classList.remove('d-none');
    loginAlert.textContent = message;
}

async function login(email, password) {
    try {
        const response = await fetch(`${API_URL}/usuarios/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password })
        });

        if (!response.ok) {
            const data = await response.json();

            if("message" in data && data.message.length > 0){
                throw new Error(data.message);
            }
            else{
                throw new Error("Ha ocurrido un error, inténtelo nuevamente!")
            }
        }

        const data = await response.json();
        localStorage.setItem('authToken', 'Basic ' + btoa(email + ':' + password));
        localStorage.setItem('userRole', data.rol);
        localStorage.setItem('userEmail', data.email);
        localStorage.setItem('userName', data.nombre);
        window.location.href = 'dashboard.html';
    } catch (error) {
        writeLoginErrorMessage(error.message);
    }
}

async function register(nombre, email, password) {
    try {
        const response = await fetch(`${API_URL}/usuarios/registro`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ nombre, email, password })
        });

        if (!response.ok) {
            throw new Error('Registration failed');
        }

        alert('Registration successful! Please login.');
        toggleForms();
    } catch (error) {
        alert(error.message);
    }
}

document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    await login(email, password);
});

document.getElementById('register-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const nombre = document.getElementById('reg-nombre').value;
    const email = document.getElementById('reg-email').value;
    const password = document.getElementById('reg-password').value;
    await register(nombre, email, password);
});