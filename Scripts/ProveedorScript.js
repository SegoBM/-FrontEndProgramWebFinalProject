class ProveedorApp {
    constructor() {
        this.providersUrl = 'https://localhost:7177/api/Proveedores';
        this.init();
    }

    init() {
        document.addEventListener('DOMContentLoaded', async () => {
            await this.fetchProviders();
            document.getElementById('providerForm').addEventListener('submit', (event) => this.submitProviderForm(event));
            document.querySelector('[data-target="#providerModal"]').addEventListener('click', () => this.clearProviderForm());
        });
    }

    async fetchProviders() {
        try {
            const response = await fetch(this.providersUrl);
            if (!response.ok) {
                throw new Error('Error al obtener los proveedores');
            }
            const providers = await response.json();
            this.renderProviders(providers);
        } catch (error) {
            console.error('Error:', error);
            alert('Error al obtener los proveedores');
        }
    }

    renderProviders(providers) {
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
                    <button class="btn btn-warning btn-sm btn-edit" onclick="app.editProvider('${provider.proveedorId}')">Editar</button>
                    <button class="btn btn-danger btn-sm" onclick="app.deleteProvider('${provider.proveedorId}')">Eliminar</button>
                </td>
            `;
            providerTableBody.appendChild(row);
        });
    }

    async submitProviderForm(event) {
        event.preventDefault();
        const providerId = document.getElementById('providerId').value;
        const nombre = document.getElementById('providerName').value;
        const telefono = document.getElementById('providerPhone').value;
        const correo = document.getElementById('providerEmail').value;
        const direccion = document.getElementById('providerAddress').value;

        const proveedor = {
            nombre: nombre,
            telefono: telefono,
            correo: correo,
            direccion: direccion
        };

        if (providerId) {
            proveedor.proveedorId = providerId;
        }

        console.log('Datos a enviar:', proveedor);

        try {
            let response;
            if (providerId) {
                response = await fetch(`${this.providersUrl}/${providerId}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(proveedor)
                });
            } else {
                response = await fetch(this.providersUrl, {
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
                this.fetchProviders();
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

    clearProviderForm() {
        document.getElementById('providerId').value = '';
        document.getElementById('providerName').value = '';
        document.getElementById('providerPhone').value = '';
        document.getElementById('providerEmail').value = '';
        document.getElementById('providerAddress').value = '';
    }

    async editProvider(providerId) {
        console.log('editProvider called with providerId:', providerId);
        try {
            const response = await fetch(`${this.providersUrl}/${providerId}`);
            if (!response.ok) {
                throw new Error('Error al obtener el proveedor');
            }
            const provider = await response.json();
            document.getElementById('providerId').value = provider.proveedorId;
            document.getElementById('providerName').value = provider.nombre;
            document.getElementById('providerPhone').value = provider.telefono;
            document.getElementById('providerEmail').value = provider.correo;
            document.getElementById('providerAddress').value = provider.direccion;

            $('#providerModal').modal('show');
        } catch (error) {
            console.error('Error al cargar el proveedor:', error);
            alert('Error al cargar el proveedor');
        }
    }

    async deleteProvider(providerId) {
        console.log('deleteProvider called with providerId:', providerId);
        if (!confirm('¿Estás seguro de que deseas eliminar este proveedor?')) {
            return;
        }

        try {
            const response = await fetch(`${this.providersUrl}/${providerId}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                alert('Proveedor eliminado con éxito');
                this.fetchProviders();
            } else {
                const result = await response.json();
                alert('Error al eliminar el proveedor: ' + result.title);
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Error al eliminar el proveedor');
        }
    }
}

const app = new ProveedorApp();