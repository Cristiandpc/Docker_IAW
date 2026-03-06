const express = require('express');
const app = express();
const port = 3000;

// Configurar EJS como motor de plantillas
app.set('view engine', 'ejs');
app.set('views', './views');

// Middleware para archivos estáticos
app.use(express.static('public'));

// Datos de productos (simulando base de datos)
const products = [
  { id: 1, name: 'Smartphone', category: 'electronica', price: 300, image: 'https://via.placeholder.com/200x150?text=Smartphone' },
  { id: 2, name: 'Camiseta', category: 'ropa', price: 20, image: 'https://via.placeholder.com/200x150?text=Camiseta' },
  { id: 3, name: 'Laptop', category: 'electronica', price: 800, image: 'https://via.placeholder.com/200x150?text=Laptop' },
  { id: 4, name: 'Sofá', category: 'hogar', price: 500, image: 'https://via.placeholder.com/200x150?text=Sofa' },
  { id: 5, name: 'Pantalón', category: 'ropa', price: 40, image: 'https://via.placeholder.com/200x150?text=Pantalon' },
];

// Ruta principal
app.get('/', (req, res) => {
  const category = req.query.category || 'all';
  let filteredProducts = products;
  if (category !== 'all') {
    filteredProducts = products.filter(p => p.category === category);
  }
  res.render('index', { products: filteredProducts, selectedCategory: category });
});

// Ruta para producto individual
app.get('/product/:id', (req, res) => {
  const product = products.find(p => p.id == req.params.id);
  if (product) {
    res.render('product', { product });
  } else {
    res.status(404).send('Producto no encontrado');
  }
});

app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});