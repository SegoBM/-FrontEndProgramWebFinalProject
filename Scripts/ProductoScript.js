const providersUrl = 'https://localhost:7177/api/Proveedores'; // URL para obtener los proveedores
const productUrl = 'https://localhost:7177/api/Productos'; // URL para crear un nuevo producto

document.addEventListener('DOMContentLoaded', async function() {
    await fetchProviders(); // Obtener proveedores al cargar el DOM
    await fetchProducts(); // Obtener productos al cargar el DOM
    document.getElementById('productForm').addEventListener('submit', submitProductForm);
});

let providerMap = {}; // Mapeo de proveedores por ID

async function fetchProviders() {
    try {
        console.log('Fetching providers from:', providersUrl);
        const response = await fetch(providersUrl);
        console.log('Response status:', response.status); // Agregar estado de la respuesta
        if (!response.ok) {
            throw new Error('Error al obtener los proveedores');
        }
        const providers = await response.json();
        console.log('Providers fetched:', providers);
        
        providers.forEach(provider => {
            console.log(`ID del proveedor: ${provider.proveedorId}, Nombre: ${provider.nombre}`);
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
    if (!providerSelect) {
        console.error('Element with ID productProviderId not found');
        return;
    }
    providerSelect.innerHTML = '';

    const defaultOption = document.createElement('option');
    defaultOption.value = ''; // Valor vacío
    defaultOption.textContent = 'Seleccionar el proveedor'; // Leyenda predeterminada
    defaultOption.disabled = true; // Deshabilitar opción para que no se pueda seleccionar
    defaultOption.selected = true; // Hacerla seleccionada por defecto
    providerSelect.appendChild(defaultOption);
    
    providers.forEach(provider => {
        const option = document.createElement('option');
        option.value = provider.proveedorId; // ID del proveedor
        option.textContent = provider.nombre; // Nombre del proveedor
        providerSelect.appendChild(option);
    });
    console.log('Providers rendered in select element');
}

async function fetchProducts() {
    try {
        console.log('Fetching products from:', productUrl);
        const response = await fetch(productUrl);
        console.log('Response status:', response.status); // Agregar estado de la respuesta
        if (!response.ok) {
            throw new Error('Error al obtener los productos');
        }
        const products = await response.json();
        console.log('Products fetched:', products);

        renderProducts(products);
    } catch (error) {
        console.error('Error:', error);
        alert('Error al obtener los productos');
    }
}

function renderProducts(products) {
    const productTableBody = document.getElementById('productTableBody');
    if (!productTableBody) {
        console.error('Element with ID productTableBody not found');
        return;
    }
    productTableBody.innerHTML = '';

    products.forEach(product => {
        const providerName = providerMap[product.proveedorId] || 'Proveedor desconocido';
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${product.nombre}</td>
            <td>${product.descripcion}</td>
            <td>${product.precio}</td>
            <td>${product.cantidad}</td>
            <td>${providerName}</td>
            <td>
                <button class="btn btn-warning btn-sm btn-editar">Editar</button>
                <button class="btn btn-danger btn-sm">Eliminar</button>
            </td>
        `;
        productTableBody.appendChild(row);
    });
    console.log('Products rendered in table');
}

async function submitProductForm(event) {
    event.preventDefault(); // Evita el comportamiento predeterminado del formulario

    const nombre = document.getElementById('productName').value;
    const descripcion = document.getElementById('productDescription').value;
    const precio = parseFloat(document.getElementById('productPrice').value);
    const cantidad = parseInt(document.getElementById('productQuantity').value);
    const proveedorId = document.getElementById('productProviderId').value;

    const producto = {
        nombre: nombre,
        descripcion: descripcion,
        precio: precio,
        cantidad: cantidad,
        proveedorId: proveedorId // Asegurarse de enviar solo el ID del proveedor
    };

    try {
        const response = await fetch(productUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(producto)
        });

        const result = await response.json();
        console.log(result);

        if (response.ok) {
            alert('Producto registrado con éxito');
            document.getElementById('productForm').reset();
            $('#productModal').modal('hide');
            fetchProducts(); // Actualizar la tabla de productos
        } else {
            alert('Error al registrar el producto: ' + result.title);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error al registrar el producto');
    }
}