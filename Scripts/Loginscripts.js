const providersUrl = 'https://localhost:7177/api/Proveedores'; // URL para obtener los proveedores

document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM fully loaded and parsed');
    fetchProviders(); // Obtener proveedores al cargar el DOM

    
    // Agregar evento de submit al formulario de registro
    document.getElementById('registerForm').addEventListener('submit', async function(event) {
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
                toggleForms(); // Cambiar a formulario de inicio de sesión
            } else {
                alert('Error al registrar el usuario: ' + result.title);
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Error al registrar el usuario');
        }
    });

    // Agregar evento de submit al formulario de inicio de sesión
    document.getElementById('loginForm').addEventListener('submit', async function(event) {
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
                window.location.href = 'index.html'; // Redirigir a otra página
            } else {
                alert('Error al iniciar sesión: ' + result.message);
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Error al iniciar sesión');
        }
    });
});

// Función para obtener proveedores
async function fetchProviders() {
    try {
        const response = await fetch(providersUrl);
        const providers = await response.json();
        console.log(providers);
        // Aquí puedes agregar código para manejar los proveedores obtenidos
    } catch (error) {
        console.error('Error al obtener proveedores:', error);
    }
}

// Función para alternar entre formularios de inicio de sesión y registro
function toggleForms() {
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    if (loginForm.style.display === 'none') {
        loginForm.style.display = 'block'; // Mostrar formulario de inicio de sesión
        registerForm.style.display = 'none'; // Ocultar formulario de registro
    } else {
        loginForm.style.display = 'none'; // Ocultar formulario de inicio de sesión
        registerForm.style.display = 'block'; // Mostrar formulario de registro
    }
}