class ProductoApp {
    constructor() {
        this.providersUrl = 'https://localhost:7177/api/Proveedores';
        this.productUrl = 'https://localhost:7177/api/Productos';
        this.providerMap = {};
        this.init();
    }

    init() {
        document.addEventListener('DOMContentLoaded', async () => {
            await this.fetchProviders();
            await this.fetchProducts();
            document.getElementById('productForm').addEventListener('submit', (event) => this.submitProductForm(event));
            document.querySelector('[data-target="#productModal"]').addEventListener('click', () => this.clearProductForm());
        });
    }

    async fetchProviders() {
        try {
            const response = await fetch(this.providersUrl);
            if (!response.ok) {
                throw new Error('Error al obtener los proveedores');
            }
            const providers = await response.json();
            providers.forEach(provider => {
                this.providerMap[provider.proveedorId] = provider.nombre;
            });
            this.renderProviders(providers);
        } catch (error) {
            console.error('Error:', error);
            alert('Error al obtener los proveedores');
        }
    }

    renderProviders(providers) {
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

    async fetchProducts() {
        try {
            const response = await fetch(this.productUrl);
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
        const productTableBody = document.getElementById('productTableBody');
        productTableBody.innerHTML = '';

        products.forEach(product => {
            const providerName = this.providerMap[product.proveedorId] || 'Proveedor desconocido';
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${product.nombre}</td>
                <td>${product.descripcion}</td>
                <td>$ ${product.precio}</td>
                <td>${product.cantidad}</td>
                <td>${providerName}</td>
                <td>
                    <button class="btn btn-warning btn-sm btn-edit" onclick="app.editProduct('${product.productoId}')">Editar</button>
                    <button class="btn btn-danger btn-sm" onclick="app.deleteProduct('${product.productoId}')">Eliminar</button>
                </td>
            `;
            productTableBody.appendChild(row);
        });
    }

    async submitProductForm(event) {
        event.preventDefault();
        const productId = document.getElementById('productId').value;
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
            proveedorId: proveedorId
        };

        if (productId) {
            producto.productoId = productId;
        }

        console.log('Datos a enviar:', producto);

        try {
            let response;
            if (productId) {
                response = await fetch(`${this.productUrl}/${productId}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(producto)
                });
            } else {
                response = await fetch(this.productUrl, {
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
                this.fetchProducts();
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

    clearProductForm() {
        document.getElementById('productId').value = '';
        document.getElementById('productName').value = '';
        document.getElementById('productDescription').value = '';
        document.getElementById('productPrice').value = '';
        document.getElementById('productQuantity').value = '';
        document.getElementById('productProviderId').value = '';
    }

    async editProduct(productId) {
        console.log('editProduct called with productId:', productId);
        try {
            const response = await fetch(`${this.productUrl}/${productId}`);
            if (!response.ok) {
                throw new Error('Error al obtener el producto');
            }
            const product = await response.json();
            document.getElementById('productId').value = product.productoId;
            document.getElementById('productName').value = product.nombre;
            document.getElementById('productDescription').value = product.descripcion;
            document.getElementById('productPrice').value = product.precio;
            document.getElementById('productQuantity').value = product.cantidad;
            document.getElementById('productProviderId').value = product.proveedorId;

            $('#productModal').modal('show');
        } catch (error) {
            console.error('Error al cargar el producto:', error);
            alert('Error al cargar el producto');
        }
    }

    async deleteProduct(productId) {
        console.log('deleteProduct called with productId:', productId);
        if (!confirm('¿Estás seguro de que deseas eliminar este producto?')) {
            return;
        }

        try {
            const response = await fetch(`${this.productUrl}/${productId}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                alert('Producto eliminado con éxito');
                this.fetchProducts();
            } else {
                const result = await response.json();
                alert('Error al eliminar el producto: ' + result.title);
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Error al eliminar el producto');
        }
    }
}

const app = new ProductoApp();