class Carrito {
    constructor(productos) {
        this.catalogo = productos; 
        this.cesta = []; 
    }

    actualizarUnidades(sku, unidades) {
        let producto = this.cesta.find(item => item.sku === sku);
        if (producto) {
            producto.quantity = unidades;
        } else {
            this.cesta.push({ sku: sku, quantity: unidades });
        }
    }

    obtenerInformacionProducto(sku) {
        let datosBase = this.catalogo.find(p => p.SKU === sku);
        let enCesta = this.cesta.find(item => item.sku === sku);
        return {
            sku: datosBase.SKU,
            title: datosBase.title,
            price: parseFloat(datosBase.price),
            quantity: enCesta ? enCesta.quantity : 0
        };
    }

    obtenerCarrito() {
        let total = 0;
        let productosComprados = [];
        this.cesta.forEach(item => { 
            if (item.quantity > 0) {
                let info = this.obtenerInformacionProducto(item.sku);
                total += (info.price * info.quantity);
                productosComprados.push(info);
            }
        });
        return { total: total.toFixed(2), currency: "€", products: productosComprados };
    }
}

let miCarrito;
const apiUrl = "https://jsonblob.com/api/jsonBlob/01a17972-324b-7a54-aae3-f9d9774cd9c1";

document.addEventListener("DOMContentLoaded", () => {
    fetch(apiUrl)
        .then(res => res.json())
        .then(datos => {
            console.log("Datos que llegan de la API:", datos); 
            
            if (!datos.products) {
                console.error("¡Cuidado! El JSON devuelto no contiene el array 'products'.");
                return;
            }
            
            miCarrito = new Carrito(datos.products);
            pintarProductos();
        })
        .catch(err => console.error("Error en la petición fetch:", err));
});
function pintarProductos() {
    let contenedor = document.getElementById("lista-productos");
    contenedor.innerHTML = ""; 
    miCarrito.catalogo.forEach(prod => {
        let info = miCarrito.obtenerInformacionProducto(prod.SKU);
        let totalLinea = (info.price * info.quantity).toFixed(2);
        contenedor.innerHTML += `
            <div class="row align-items-center border-bottom pb-3 mb-3">
                <div class="col-4"><strong>${prod.title}</strong><br><small>REF: ${prod.SKU}</small></div>
                <div class="col-3">
                    <button class="btn btn-sm btn-outline-dark" onclick="modificarCantidad('${prod.SKU}', -1)">-</button>
                    <span class="mx-2 fw-bold">${info.quantity}</span>
                    <button class="btn btn-sm btn-outline-dark" onclick="modificarCantidad('${prod.SKU}', 1)">+</button>
                </div>
                <div class="col-2">${prod.price}€</div>
                <div class="col-3">${totalLinea}€</div>
            </div>
        `;
    });
    actualizarPanelDerecho();
}

function modificarCantidad(sku, cambio) {
    let info = miCarrito.obtenerInformacionProducto(sku);
    let nuevaCantidad = info.quantity + cambio;
    if (nuevaCantidad >= 0) {
        miCarrito.actualizarUnidades(sku, nuevaCantidad);
        pintarProductos(); 
    }
}

function actualizarPanelDerecho() {
    let datosCarrito = miCarrito.obtenerCarrito();
    let contenedorResumen = document.getElementById("resumen-lista");
    contenedorResumen.innerHTML = "";
    datosCarrito.products.forEach(p => {
        contenedorResumen.innerHTML += `<div class="d-flex justify-content-between border-bottom pb-1 mb-1"><span>${p.quantity} x ${p.title}</span><span>${(p.price * p.quantity).toFixed(2)}€</span></div>`;
    });
    document.getElementById("precio-total").innerText = datosCarrito.total;
}