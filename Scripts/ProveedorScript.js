const providersUrl = 'https://localhost:7177/api/Proveedores'; // URL para obtener y gestionar los proveedores

document.addEventListener('DOMContentLoaded', async function() {
    await fetchProviders(); // Obtener proveedores al cargar el DOM
    document.getElementById('providerForm').addEventListener('submit', submitProviderForm);
    document.querySelector('[data-target="#providerModal"]').addEventListener('click', clearProviderForm); // Limpiar el formulario al abrir el modal
});

async function fetchProviders() {
    try {
        const response = await fetch(providersUrl);
        if (!response.ok) {
            throw new Error('Error al obtener los proveedores');
        }
        const providers = await response.json();
        renderProviders(providers);
    } catch (error) {
        console.error('Error:', error);
        alert('Error al obtener los proveedores');
    }
}

function renderProviders(providers) {
    const providerTableBody = document.getElementById('providerTableBody');
    providerTableBody.innerHTML = '';

    providers.forEach(provider => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${provider.nombre}</td>
            <td>${provider.telefono}</td>
            <td>${provider.correo}</td>
            <td>${provider.direccion}</td>
            <td>
                <button class="btn btn-warning btn-sm btn-edit" onclick="editProvider('${provider.proveedorId}')">Editar</button>
                <button class="btn btn-danger btn-sm" onclick="deleteProvider('${provider.proveedorId}')">Eliminar</button>
            </td>
        `;
        providerTableBody.appendChild(row);
    });
}

async function submitProviderForm(event) {
    event.preventDefault();
    const providerId = document.getElementById('providerId').value;
    const nombre = document.getElementById('providerName').value;
    const telefono = document.getElementById('providerPhone').value;
    const correo = document.getElementById('providerEmail').value;
    const direccion = document.getElementById('providerAddress').value;

    // Crear el objeto proveedor sin el campo proveedorId
    const proveedor = {
        nombre: nombre,
        telefono: telefono,
        correo: correo,
        direccion: direccion
    };

    // Incluir el campo proveedorId solo si se está actualizando un proveedor existente
    if (providerId) {
        proveedor.proveedorId = providerId;
    }

    console.log('Datos a enviar:', proveedor);

    try {
        let response;
        if (providerId) {
            // Actualizar proveedor existente
            response = await fetch(`${providersUrl}/${providerId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(proveedor)
            });
        } else {
            // Crear nuevo proveedor
            response = await fetch(providersUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(proveedor)
            });
        }

        if (response.ok) {
            alert(providerId ? 'Proveedor actualizado con éxito' : 'Proveedor registrado con éxito');
            document.getElementById('providerForm').reset();
            $('#providerModal').modal('hide');
            fetchProviders();
        } else {
            const result = await response.json();
            console.error('Error al registrar el proveedor:', result);
            alert('Error al registrar el proveedor: ' + result.title);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error al registrar el proveedor');
    }
}

function clearProviderForm() {
    document.getElementById('providerId').value = '';
    document.getElementById('providerName').value = '';
    document.getElementById('providerPhone').value = '';
    document.getElementById('providerEmail').value = '';
    document.getElementById('providerAddress').value = '';
}

function editProvider(providerId) {
    console.log('editProvider called with providerId:', providerId); // Mensaje de depuración
    fetch(`${providersUrl}/${providerId}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Error al obtener el proveedor');
            }
            return response.json();
        })
        .then(provider => {
            document.getElementById('providerId').value = provider.proveedorId;
            document.getElementById('providerName').value = provider.nombre;
            document.getElementById('providerPhone').value = provider.telefono;
            document.getElementById('providerEmail').value = provider.correo;
            document.getElementById('providerAddress').value = provider.direccion;

            $('#providerModal').modal('show');
        })
        .catch(error => {
            console.error('Error al cargar el proveedor:', error);
            alert('Error al cargar el proveedor');
        });
}

async function deleteProvider(providerId) {
    console.log('deleteProvider called with providerId:', providerId); // Mensaje de depuración
    if (!confirm('¿Estás seguro de que deseas eliminar este proveedor?')) {
        return;
    }

    try {
        const response = await fetch(`${providersUrl}/${providerId}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            alert('Proveedor eliminado con éxito');
            fetchProviders();
        } else {
            const result = await response.json();
            alert('Error al eliminar el proveedor: ' + result.title);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error al eliminar el proveedor');
    }
}