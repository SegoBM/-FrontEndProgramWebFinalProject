const clientsUrl = 'https://localhost:7177/api/Clientes'; // URL para obtener y gestionar los clientes

document.addEventListener('DOMContentLoaded', async function() {
    await fetchClients(); // Obtener clientes al cargar el DOM
    document.getElementById('clientForm').addEventListener('submit', submitClientForm);
    document.querySelector('[data-target="#clientModal"]').addEventListener('click', clearClientForm); // Limpiar el formulario al abrir el modal
});

async function fetchClients() {
    try {
        const response = await fetch(clientsUrl);
        if (!response.ok) {
            throw new Error('Error al obtener los clientes');
        }
        const clients = await response.json();
        renderClients(clients);
    } catch (error) {
        console.error('Error:', error);
        alert('Error al obtener los clientes');
    }
}

function renderClients(clients) {
    const clientTableBody = document.getElementById('clientTableBody');
    clientTableBody.innerHTML = '';

    clients.forEach(client => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${client.nombre}</td>
            <td>${client.correo}</td>
            <td>${client.telefono}</td>
            <td>${client.direccion}</td>
            <td>
                <button class="btn btn-warning btn-sm btn-edit" onclick="editClient('${client.clienteId}')">Editar</button>
                <button class="btn btn-danger btn-sm" onclick="deleteClient('${client.clienteId}')">Eliminar</button>
            </td>
        `;
        clientTableBody.appendChild(row);
    });
}

async function submitClientForm(event) {
    event.preventDefault();
    const clientId = document.getElementById('clientId').value;
    const nombre = document.getElementById('clientName').value;
    const correo = document.getElementById('clientEmail').value;
    const telefono = document.getElementById('clientPhone').value;
    const direccion = document.getElementById('clientAddress').value;

    // Crear el objeto cliente sin el campo clienteId
    const cliente = {
        nombre: nombre,
        correo: correo,
        telefono: telefono,
        direccion: direccion
    };

    // Incluir el campo clienteId solo si se está actualizando un cliente existente
    if (clientId) {
        cliente.clienteId = clientId;
    }

    console.log('Datos a enviar:', cliente);

    try {
        let response;
        if (clientId) {
            // Actualizar cliente existente
            response = await fetch(`${clientsUrl}/${clientId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(cliente)
            });
        } else {
            // Crear nuevo cliente
            response = await fetch(clientsUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(cliente)
            });
        }

        if (response.ok) {
            alert(clientId ? 'Cliente actualizado con éxito' : 'Cliente registrado con éxito');
            document.getElementById('clientForm').reset();
            $('#clientModal').modal('hide');
            fetchClients();
        } else {
            const result = await response.json();
            console.error('Error al registrar el cliente:', result);
            alert('Error al registrar el cliente: ' + result.title);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error al registrar el cliente');
    }
}

function clearClientForm() {
    document.getElementById('clientId').value = '';
    document.getElementById('clientName').value = '';
    document.getElementById('clientEmail').value = '';
    document.getElementById('clientPhone').value = '';
    document.getElementById('clientAddress').value = '';
}

function editClient(clientId) {
    console.log('editClient called with clientId:', clientId); // Mensaje de depuración
    fetch(`${clientsUrl}/${clientId}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Error al obtener el cliente');
            }
            return response.json();
        })
        .then(client => {
            document.getElementById('clientId').value = client.clienteId;
            document.getElementById('clientName').value = client.nombre;
            document.getElementById('clientEmail').value = client.correo;
            document.getElementById('clientPhone').value = client.telefono;
            document.getElementById('clientAddress').value = client.direccion;

            $('#clientModal').modal('show');
        })
        .catch(error => {
            console.error('Error al cargar el cliente:', error);
            alert('Error al cargar el cliente');
        });
}

async function deleteClient(clientId) {
    console.log('deleteClient called with clientId:', clientId); // Mensaje de depuración
    if (!confirm('¿Estás seguro de que deseas eliminar este cliente?')) {
        return;
    }

    try {
        const response = await fetch(`${clientsUrl}/${clientId}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            alert('Cliente eliminado con éxito');
            fetchClients();
        } else {
            const result = await response.json();
            alert('Error al eliminar el cliente: ' + result.title);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error al eliminar el cliente');
    }
}