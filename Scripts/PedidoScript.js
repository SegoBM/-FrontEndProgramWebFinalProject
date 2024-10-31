const ordersUrl = 'https://localhost:7177/api/Pedidos'; // URL para obtener y gestionar los pedidos
const clientsUrl = 'https://localhost:7177/api/Clientes'; // URL para obtener los clientes
const productsUrl = 'https://localhost:7177/api/Productos'; // URL para obtener los productos

document.addEventListener('DOMContentLoaded', async function() {
    await fetchOrders(); // Obtener pedidos al cargar el DOM
    await fetchClients(); // Obtener clientes al cargar el DOM
    await fetchProducts(); // Obtener productos al cargar el DOM
    document.getElementById('orderForm').addEventListener('submit', submitOrderForm);
    document.getElementById('orderProductId').addEventListener('change', updatePrice);
    document.getElementById('orderQuantity').addEventListener('input', updatePrice);
    document.querySelector('[data-target="#orderModal"]').addEventListener('click', clearOrderForm); // Limpiar el formulario al abrir el modal
});

let productsMap = {}; // Mapeo de productos por ID para obtener el precio

async function fetchOrders() {
    try {
        const response = await fetch(ordersUrl);
        if (!response.ok) {
            throw new Error('Error al obtener los pedidos');
        }
        const orders = await response.json();
        renderOrders(orders);
    } catch (error) {
        console.error('Error:', error);
        alert('Error al obtener los pedidos');
    }
}

function renderOrders(orders) {
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
    const clientSelect = document.getElementById('orderClientId');
    clientSelect.innerHTML = '';

    clients.forEach(client => {
        const option = document.createElement('option');
        option.value = client.clienteId;
        option.textContent = client.nombre;
        clientSelect.appendChild(option);
    });
}

async function fetchProducts() {
    try {
        const response = await fetch(productsUrl);
        if (!response.ok) {
            throw new Error('Error al obtener los productos');
        }
        const products = await response.json();
        renderProducts(products);
    } catch (error) {
        console.error('Error:', error);
        alert('Error al obtener los productos');
    }
}

function renderProducts(products) {
    const productSelect = document.getElementById('orderProductId');
    productSelect.innerHTML = '';

    products.forEach(product => {
        const option = document.createElement('option');
        option.value = product.productoId;
        option.textContent = product.nombre;
        productSelect.appendChild(option);
        productsMap[product.productoId] = product.precio; // Guardar el precio del producto en el mapeo
    });
}

function updatePrice() {
    const productId = document.getElementById('orderProductId').value;
    const quantity = parseInt(document.getElementById('orderQuantity').value);
    const price = productsMap[productId] || 0;
    document.getElementById('orderPrice').value = (price * quantity).toFixed(2);
}

async function submitOrderForm(event) {
    event.preventDefault();
    const orderId = document.getElementById('orderId').value;
    const clienteId = document.getElementById('orderClientId').value;
    const fecha = document.getElementById('orderDate').value;
    const productoId = document.getElementById('orderProductId').value;
    const cantidad = parseInt(document.getElementById('orderQuantity').value);
    const precio = parseFloat(document.getElementById('orderPrice').value);

    // Crear el objeto pedido sin el campo pedidoId
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
            // Actualizar pedido existente
            response = await fetch(`${ordersUrl}/${orderId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(pedido)
            });
        } else {
            // Crear nuevo pedido
            response = await fetch(ordersUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(pedido)
            });
        }

        if (response.ok) {
            // Actualizar inventario del producto
            await fetch(`${productsUrl}/${productoId}/reduce`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ cantidad: cantidad })
            });

            alert(orderId ? 'Pedido actualizado con éxito' : 'Pedido registrado con éxito');
            document.getElementById('orderForm').reset();
            $('#orderModal').modal('hide');
            fetchOrders();
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

function clearOrderForm() {
    document.getElementById('orderId').value = '';
    document.getElementById('orderClientId').value = '';
    document.getElementById('orderDate').value = '';
    document.getElementById('orderProductId').value = '';
    document.getElementById('orderQuantity').value = '';
    document.getElementById('orderPrice').value = '';
}

function editOrder(orderId) {
    console.log('editOrder called with orderId:', orderId); // Mensaje de depuración
    fetch(`${ordersUrl}/${orderId}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Error al obtener el pedido');
            }
            return response.json();
        })
        .then(order => {
            document.getElementById('orderId').value = order.pedidoId;
            document.getElementById('orderClientId').value = order.clienteId;
            document.getElementById('orderDate').value = new Date(order.fecha).toISOString().split('T')[0];
            document.getElementById('orderProductId').value = order.productoId;
            document.getElementById('orderQuantity').value = order.cantidad;
            document.getElementById('orderPrice').value = order.precio;

            $('#orderModal').modal('show');
        })
        .catch(error => {
            console.error('Error al cargar el pedido:', error);
            alert('Error al cargar el pedido');
        });
}

async function deleteOrder(orderId) {
    console.log('deleteOrder called with orderId:', orderId); // Mensaje de depuración
    if (!confirm('¿Estás seguro de que deseas eliminar este pedido?')) {
        return;
    }

    try {
        const response = await fetch(`${ordersUrl}/${orderId}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            alert('Pedido eliminado con éxito');
            fetchOrders();
        } else {
            const result = await response.json();
            alert('Error al eliminar el pedido: ' + result.title);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error al eliminar el pedido');
    }
}