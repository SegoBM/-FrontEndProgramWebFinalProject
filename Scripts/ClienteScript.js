class ClienteApp {
    constructor() {
        this.clientsUrl = 'https://localhost:7177/api/Clientes';
        this.init();
    }

    init() {
        document.addEventListener('DOMContentLoaded', async () => {
            await this.fetchClients();
            document.getElementById('clientForm').addEventListener('submit', (event) => this.submitClientForm(event));
            document.querySelector('[data-target="#clientModal"]').addEventListener('click', () => this.clearClientForm());
        });
    }

    async fetchClients() {
        try {
            const response = await fetch(this.clientsUrl);
            if (!response.ok) {
                throw new Error('Error al obtener los clientes');
            }
            const clients = await response.json();
            this.renderClients(clients);
        } catch (error) {
            console.error('Error:', error);
            alert('Error al obtener los clientes');
        }
    }

    renderClients(clients) {
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
                    <button class="btn btn-warning btn-sm btn-edit" onclick="app.editClient('${client.clienteId}')">Editar</button>
                    <button class="btn btn-danger btn-sm" onclick="app.deleteClient('${client.clienteId}')">Eliminar</button>
                </td>
            `;
            clientTableBody.appendChild(row);
        });
    }

    async submitClientForm(event) {
        event.preventDefault();
        const clientId = document.getElementById('clientId').value;
        const nombre = document.getElementById('clientName').value;
        const correo = document.getElementById('clientEmail').value;
        const telefono = document.getElementById('clientPhone').value;
        const direccion = document.getElementById('clientAddress').value;

        const cliente = {
            nombre: nombre,
            correo: correo,
            telefono: telefono,
            direccion: direccion
        };

        if (clientId) {
            cliente.clienteId = clientId;
        }

        console.log('Datos a enviar:', cliente);

        try {
            let response;
            if (clientId) {
                response = await fetch(`${this.clientsUrl}/${clientId}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(cliente)
                });
            } else {
                response = await fetch(this.clientsUrl, {
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
                this.fetchClients();
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

    clearClientForm() {
        document.getElementById('clientId').value = '';
        document.getElementById('clientName').value = '';
        document.getElementById('clientEmail').value = '';
        document.getElementById('clientPhone').value = '';
        document.getElementById('clientAddress').value = '';
    }

    async editClient(clientId) {
        console.log('editClient called with clientId:', clientId);
        try {
            const response = await fetch(`${this.clientsUrl}/${clientId}`);
            if (!response.ok) {
                throw new Error('Error al obtener el cliente');
            }
            const client = await response.json();
            document.getElementById('clientId').value = client.clienteId;
            document.getElementById('clientName').value = client.nombre;
            document.getElementById('clientEmail').value = client.correo;
            document.getElementById('clientPhone').value = client.telefono;
            document.getElementById('clientAddress').value = client.direccion;

            $('#clientModal').modal('show');
        } catch (error) {
            console.error('Error al cargar el cliente:', error);
            alert('Error al cargar el cliente');
        }
    }

    async deleteClient(clientId) {
        console.log('deleteClient called with clientId:', clientId);
        if (!confirm('¿Estás seguro de que deseas eliminar este cliente?')) {
            return;
        }

        try {
            const response = await fetch(`${this.clientsUrl}/${clientId}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                alert('Cliente eliminado con éxito');
                this.fetchClients();
            } else {
                const result = await response.json();
                alert('Error al eliminar el cliente: ' + result.title);
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Error al eliminar el cliente');
        }
    }
}

const app = new ClienteApp();