function filterProducts() {
    const category = document.getElementById('category').value;
    window.location.href = `/?category=${category}`;
}

function addToCart(id) {
    alert('Producto ' + id + ' añadido al carrito');
}