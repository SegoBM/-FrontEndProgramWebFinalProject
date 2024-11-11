class AuthApp {
    constructor() {
        this.providersUrl = 'https://localhost:7177/api/Proveedores';
        this.init();
        window.toggleForms = this.toggleForms.bind(this); 
    }

    init() {
        document.addEventListener('DOMContentLoaded', () => {
            console.log('DOM fully loaded and parsed');
            this.fetchProviders();
            this.addEventListeners();
        });
    }

    addEventListeners() {
        document.getElementById('registerForm').addEventListener('submit', (event) => this.registerUser(event));
        document.getElementById('loginForm').addEventListener('submit', (event) => this.loginUser(event));
    }

    async registerUser(event) {
        event.preventDefault();
        const nombre = document.getElementById('username').value;
        const contraseña = document.getElementById('password').value;
        const rol = document.getElementById('userType').value;

        try {
            const response = await fetch('https://localhost:7177/api/Usuarios', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    nombre: nombre,
                    contraseña: contraseña,
                    rol: rol
                })
            });

            const result = await response.json();
            console.log(result);

            if (response.ok) {
                alert('Usuario registrado con éxito');
                this.toggleForms();
            } else {
                alert('Error al registrar el usuario: ' + result.title);
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Error al registrar el usuario');
        }
    }

    async loginUser(event) {
        event.preventDefault();
        const nombre = document.getElementById('loginUsername').value;
        const contraseña = document.getElementById('loginPassword').value;

        try {
            const response = await fetch('https://localhost:7177/api/Usuarios/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    nombre: nombre,
                    contraseña: contraseña
                })
            });

            const result = await response.json();
            console.log(result);

            if (response.ok) {
                alert('Inicio de sesión exitoso');
                window.location.href = 'index.html';
            } else {
                alert('Error al iniciar sesión: ' + result.message);
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Error al iniciar sesión');
        }
    }

    async fetchProviders() {
        try {
            const response = await fetch(this.providersUrl);
            const providers = await response.json();
            console.log(providers);
            // Aquí puedes agregar código para manejar los proveedores obtenidos
        } catch (error) {
            console.error('Error al obtener proveedores:', error);
        }
    }

    toggleForms() {
        const loginForm = document.getElementById('login-form');
        const registerForm = document.getElementById('register-form');
        if (loginForm.style.display === 'none') {
            loginForm.style.display = 'block';
            registerForm.style.display = 'none';
        } else {
            loginForm.style.display = 'none';
            registerForm.style.display = 'block';
        }
    }
}

const authApp = new AuthApp();