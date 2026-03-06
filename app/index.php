<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Catálogo Interactivo - Tienda Local</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .product { border: 1px solid #ddd; padding: 10px; margin: 10px; display: inline-block; width: 200px; }
        .product img { max-width: 100%; height: auto; }
        .filter { margin-bottom: 20px; }
    </style>
</head>
<body>
    <h1>Catálogo de Productos</h1>
    <div class="filter">
        <label for="category">Filtrar por categoría:</label>
        <select id="category" onchange="filterProducts()">
            <option value="all">Todos</option>
            <option value="electronica">Electrónica</option>
            <option value="ropa">Ropa</option>
            <option value="hogar">Hogar</option>
        </select>
    </div>
    <div id="products">
        <?php
        $products = [
            ['id' => 1, 'name' => 'Smartphone', 'category' => 'electronica', 'price' => 300, 'image' => 'https://via.placeholder.com/200x150?text=Smartphone'],
            ['id' => 2, 'name' => 'Camiseta', 'category' => 'ropa', 'price' => 20, 'image' => 'https://via.placeholder.com/200x150?text=Camiseta'],
            ['id' => 3, 'name' => 'Laptop', 'category' => 'electronica', 'price' => 800, 'image' => 'https://via.placeholder.com/200x150?text=Laptop'],
            ['id' => 4, 'name' => 'Sofá', 'category' => 'hogar', 'price' => 500, 'image' => 'https://via.placeholder.com/200x150?text=Sofa'],
            ['id' => 5, 'name' => 'Pantalón', 'category' => 'ropa', 'price' => 40, 'image' => 'https://via.placeholder.com/200x150?text=Pantalon'],
        ];

        foreach ($products as $product) {
            echo "<div class='product' data-category='{$product['category']}'>";
            echo "<img src='{$product['image']}' alt='{$product['name']}'>";
            echo "<h3>{$product['name']}</h3>";
            echo "<p>Precio: \${$product['price']}</p>";
            echo "<button onclick='addToCart({$product['id']})'>Añadir al carrito</button>";
            echo "</div>";
        }
        ?>
    </div>

    <script>
        function filterProducts() {
            const category = document.getElementById('category').value;
            const products = document.querySelectorAll('.product');
            products.forEach(product => {
                if (category === 'all' || product.dataset.category === category) {
                    product.style.display = 'inline-block';
                } else {
                    product.style.display = 'none';
                }
            });
        }

        function addToCart(id) {
            alert('Producto ' + id + ' añadido al carrito');
        }
    </script>
</body>
</html>