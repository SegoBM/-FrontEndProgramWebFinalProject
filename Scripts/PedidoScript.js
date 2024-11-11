class PedidoApp {
    constructor() {
        this.ordersUrl = 'https://localhost:7177/api/Pedidos';
        this.clientsUrl = 'https://localhost:7177/api/Clientes';
        this.productsUrl = 'https://localhost:7177/api/Productos';
        this.productsMap = {};
        this.init();
    }

    init() {
        document.addEventListener('DOMContentLoaded', async () => {
            await this.fetchOrders();
            await this.fetchClients();
            await this.fetchProducts();
            document.getElementById('orderForm').addEventListener('submit', (event) => this.submitOrderForm(event));
            document.getElementById('orderProductId').addEventListener('change', () => this.updatePrice());
            document.getElementById('orderQuantity').addEventListener('input', () => this.updatePrice());
            document.querySelector('[data-target="#orderModal"]').addEventListener('click', () => this.clearOrderForm());
        });
    }

    async fetchOrders() {
        try {
            const response = await fetch(this.ordersUrl);
            if (!response.ok) {
                throw new Error('Error al obtener los pedidos');
            }
            const orders = await response.json();
            this.renderOrders(orders);
        } catch (error) {
            console.error('Error:', error);
            alert('Error al obtener los pedidos');
        }
    }

    renderOrders(orders) {
        const orderTableBody = document.getElementById('orderTableBody');
        orderTableBody.innerHTML = '';

        orders.forEach(order => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${order.clienteNombre || 'Cliente desconocido'}</td>
                <td>${order.productoNombre || 'Producto desconocido'}</td>
                <td>${order.cantidad}</td>
                <td>$ ${order.precio}</td>
                <td>${new Date(order.fecha).toLocaleDateString()}</td>
            `;
            orderTableBody.appendChild(row);
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
        const clientSelect = document.getElementById('orderClientId');
        clientSelect.innerHTML = '';

        clients.forEach(client => {
            const option = document.createElement('option');
            option.value = client.clienteId;
            option.textContent = client.nombre;
            clientSelect.appendChild(option);
        });
    }

    async fetchProducts() {
        try {
            const response = await fetch(this.productsUrl);
            if (!response.ok) {
                throw new Error('Error al obtener los productos');
            }
            const products = await response.json();
            this.renderProducts(products);
        } catch (error) {
            console.error('Error:', error);
            alert('Error al obtener los productos');
        }
    }

    renderProducts(products) {
        const productSelect = document.getElementById('orderProductId');
        productSelect.innerHTML = '';

        products.forEach(product => {
            const option = document.createElement('option');
            option.value = product.productoId;
            option.textContent = product.nombre;
            productSelect.appendChild(option);
            this.productsMap[product.productoId] = product.precio;
        });
    }

    updatePrice() {
        const productId = document.getElementById('orderProductId').value;
        const quantity = parseInt(document.getElementById('orderQuantity').value);
        const price = this.productsMap[productId] || 0;
        document.getElementById('orderPrice').value = (price * quantity).toFixed(2);
    }

    async submitOrderForm(event) {
        event.preventDefault();
        const orderId = document.getElementById('orderId').value;
        const clienteId = document.getElementById('orderClientId').value;
        const fecha = document.getElementById('orderDate').value;
        const productoId = document.getElementById('orderProductId').value;
        const cantidad = parseInt(document.getElementById('orderQuantity').value);
        const precio = parseFloat(document.getElementById('orderPrice').value);

        const pedido = {
            clienteId: clienteId,
            fecha: fecha,
            productoId: productoId,
            cantidad: cantidad,
            precio: precio
        };

        console.log('Datos a enviar:', pedido);

        try {
            let response;
            if (orderId) {
                response = await fetch(`${this.ordersUrl}/${orderId}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(pedido)
                });
            } else {
                response = await fetch(this.ordersUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(pedido)
                });
            }

            if (response.ok) {
                await fetch(`${this.productsUrl}/${productoId}/reduce`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ cantidad: cantidad })
                });

                alert(orderId ? 'Pedido actualizado con éxito' : 'Pedido registrado con éxito');
                document.getElementById('orderForm').reset();
                $('#orderModal').modal('hide');
                this.fetchOrders();
            } else {
                const result = await response.json();
                console.error('Error al registrar el pedido:', result);
                alert('Error al registrar el pedido: ' + result.title);
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Error al registrar el pedido');
        }
    }

    clearOrderForm() {
        document.getElementById('orderId').value = '';
        document.getElementById('orderClientId').value = '';
        document.getElementById('orderDate').value = '';
        document.getElementById('orderProductId').value = '';
        document.getElementById('orderQuantity').value = '';
        document.getElementById('orderPrice').value = '';
    }

    async editOrder(orderId) {
        console.log('editOrder called with orderId:', orderId);
        try {
            const response = await fetch(`${this.ordersUrl}/${orderId}`);
            if (!response.ok) {
                throw new Error('Error al obtener el pedido');
            }
            const order = await response.json();
            document.getElementById('orderId').value = order.pedidoId;
            document.getElementById('orderClientId').value = order.clienteId;
            document.getElementById('orderDate').value = new Date(order.fecha).toISOString().split('T')[0];
            document.getElementById('orderProductId').value = order.productoId;
            document.getElementById('orderQuantity').value = order.cantidad;
            document.getElementById('orderPrice').value = order.precio;

            $('#orderModal').modal('show');
        } catch (error) {
            console.error('Error al cargar el pedido:', error);
            alert('Error al cargar el pedido');
        }
    }

    async deleteOrder(orderId) {
        console.log('deleteOrder called with orderId:', orderId);
        if (!confirm('¿Estás seguro de que deseas eliminar este pedido?')) {
            return;
        }

        try {
            const response = await fetch(`${this.ordersUrl}/${orderId}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                alert('Pedido eliminado con éxito');
                this.fetchOrders();
            } else {
                const result = await response.json();
                alert('Error al eliminar el pedido: ' + result.title);
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Error al eliminar el pedido');
        }
    }
}

const app = new PedidoApp();