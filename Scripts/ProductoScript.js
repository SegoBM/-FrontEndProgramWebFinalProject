const providersUrl = 'https://localhost:7177/api/Proveedores'; // URL para obtener los proveedores
const productUrl = 'https://localhost:7177/api/Productos'; // URL para crear un nuevo producto

document.addEventListener('DOMContentLoaded', async function() {
    await fetchProviders(); // Obtener proveedores al cargar el DOM
    await fetchProducts(); // Obtener productos al cargar el DOM
    document.getElementById('productForm').addEventListener('submit', submitProductForm);
    document.querySelector('[data-target="#productModal"]').addEventListener('click', clearProductForm); // Limpiar el formulario al abrir el modal
});

let providerMap = {}; // Mapeo de proveedores por ID

async function fetchProviders() {
    try {
        const response = await fetch(providersUrl);
        if (!response.ok) {
            throw new Error('Error al obtener los proveedores');
        }
        const providers = await response.json();
        providers.forEach(provider => {
            providerMap[provider.proveedorId] = provider.nombre; // Guardar en el mapeo
        });
        renderProviders(providers);
    } catch (error) {
        console.error('Error:', error);
        alert('Error al obtener los proveedores');
    }
}

function renderProviders(providers) {
    const providerSelect = document.getElementById('productProviderId');
    providerSelect.innerHTML = '';

    const defaultOption = document.createElement('option');
    defaultOption.value = '';
    defaultOption.textContent = 'Seleccionar el proveedor';
    defaultOption.disabled = true;
    defaultOption.selected = true;
    providerSelect.appendChild(defaultOption);
    
    providers.forEach(provider => {
        const option = document.createElement('option');
        option.value = provider.proveedorId;
        option.textContent = provider.nombre;
        providerSelect.appendChild(option);
    });
}

async function fetchProducts() {
    try {
        const response = await fetch(productUrl);
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
    const productTableBody = document.getElementById('productTableBody');
    productTableBody.innerHTML = '';

    products.forEach(product => {
        const providerName = providerMap[product.proveedorId] || 'Proveedor desconocido';
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${product.nombre}</td>
            <td>${product.descripcion}</td>
            <td>$ ${product.precio}</td>
            <td>${product.cantidad}</td>
            <td>${providerName}</td>
            <td>
                <button class="btn btn-warning btn-sm btn-edit" onclick="editProduct('${product.productoId}')">Editar</button>
                <button class="btn btn-danger btn-sm" onclick="deleteProduct('${product.productoId}')">Eliminar</button>
            </td>
        `;
        productTableBody.appendChild(row);
    });
}

async function submitProductForm(event) {
    event.preventDefault();
    const productId = document.getElementById('productId').value;
    const nombre = document.getElementById('productName').value;
    const descripcion = document.getElementById('productDescription').value;
    const precio = parseFloat(document.getElementById('productPrice').value);
    const cantidad = parseInt(document.getElementById('productQuantity').value);
    const proveedorId = document.getElementById('productProviderId').value;

    // Crear el objeto producto sin el campo productoId
    const producto = {
        nombre: nombre,
        descripcion: descripcion,
        precio: precio,
        cantidad: cantidad,
        proveedorId: proveedorId
    };

    // Incluir el campo productoId solo si se está actualizando un producto existente
    if (productId) {
        producto.productoId = productId;
    }

    console.log('Datos a enviar:', producto);

    try {
        let response;
        if (productId) {
            // Actualizar producto existente
            response = await fetch(`${productUrl}/${productId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(producto)
            });
        } else {
            // Crear nuevo producto
            response = await fetch(productUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(producto)
            });
        }

        if (response.ok) {
            alert(productId ? 'Producto actualizado con éxito' : 'Producto registrado con éxito');
            document.getElementById('productForm').reset();
            $('#productModal').modal('hide');
            fetchProducts();
        } else {
            const result = await response.json();
            console.error('Error al registrar el producto:', result);
            alert('Error al registrar el producto: ' + result.title);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error al registrar el producto');
    }
}

function clearProductForm() {
    document.getElementById('productId').value = '';
    document.getElementById('productName').value = '';
    document.getElementById('productDescription').value = '';
    document.getElementById('productPrice').value = '';
    document.getElementById('productQuantity').value = '';
    document.getElementById('productProviderId').value = '';
}

function editProduct(productId) {
    console.log('editProduct called with productId:', productId); // Mensaje de depuración
    fetch(`${productUrl}/${productId}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Error al obtener el producto');
            }
            return response.json();
        })
        .then(product => {
            document.getElementById('productId').value = product.productoId;
            document.getElementById('productName').value = product.nombre;
            document.getElementById('productDescription').value = product.descripcion;
            document.getElementById('productPrice').value = product.precio;
            document.getElementById('productQuantity').value = product.cantidad;
            document.getElementById('productProviderId').value = product.proveedorId;

            $('#productModal').modal('show');
        })
        .catch(error => {
            console.error('Error al cargar el producto:', error);
            alert('Error al cargar el producto');
        });
}

async function deleteProduct(productId) {
    console.log('deleteProduct called with productId:', productId); // Mensaje de depuración
    if (!confirm('¿Estás seguro de que deseas eliminar este producto?')) {
        return;
    }

    try {
        const response = await fetch(`${productUrl}/${productId}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            alert('Producto eliminado con éxito');
            fetchProducts();
        } else {
            const result = await response.json();
            alert('Error al eliminar el producto: ' + result.title);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error al eliminar el producto');
    }
}