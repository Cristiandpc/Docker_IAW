const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
const port = 3001;

// Configuración de CORS
app.use(cors());
app.use(express.json());

// Conexión a PostgreSQL
const pool = new Pool({
  user: process.env.DB_USER || 'tienda_user',
  host: process.env.DB_HOST || 'db',
  database: process.env.DB_NAME || 'tienda_db',
  password: process.env.DB_PASSWORD || 'tienda_pass',
  port: process.env.DB_PORT || 5432,
});

// Función para inicializar la base de datos
async function initializeDatabase() {
  try {
    // Esperar a que la base de datos esté lista
    let connected = false;
    let attempts = 0;
    while (!connected && attempts < 30) {
      try {
        await pool.query('SELECT NOW()');
        connected = true;
        console.log('Conectado a la base de datos');
      } catch (err) {
        attempts++;
        console.log(`Intento de conexión ${attempts}/30...`);
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    if (!connected) {
      throw new Error('No se pudo conectar a la base de datos después de 30 intentos');
    }

    // Crear tabla de productos si no existe
    await pool.query(`
      CREATE TABLE IF NOT EXISTS products (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        category VARCHAR(100) NOT NULL,
        price DECIMAL(10, 2) NOT NULL,
        description TEXT,
        image VARCHAR(500),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Insertar productos de ejemplo si la tabla está vacía
    const result = await pool.query('SELECT COUNT(*) FROM products');
    if (result.rows[0].count === '0') {
      await pool.query(`
        INSERT INTO products (name, category, price, description, image) VALUES
        ('Smartphone', 'electronica', 300, 'Teléfono inteligente de última generación', 'https://via.placeholder.com/200x150?text=Smartphone'),
        ('Camiseta', 'ropa', 20, 'Camiseta de algodón 100%', 'https://via.placeholder.com/200x150?text=Camiseta'),
        ('Laptop', 'electronica', 800, 'Portátil de alta performance', 'https://via.placeholder.com/200x150?text=Laptop'),
        ('Sofá', 'hogar', 500, 'Sofá cómodo de 3 plazas', 'https://via.placeholder.com/200x150?text=Sofa'),
        ('Pantalón', 'ropa', 40, 'Pantalón vaquero de moda', 'https://via.placeholder.com/200x150?text=Pantalon');
      `);
      console.log('Productos de ejemplo insertados');
    }
  } catch (err) {
    console.error('Error inicializando la base de datos:', err);
    process.exit(1);
  }
}

// Rutas

// GET /products - Obtener todos los productos o filtrar por categoría
app.get('/products', async (req, res) => {
  try {
    const { category } = req.query;
    
    let query = 'SELECT * FROM products';
    const params = [];

    if (category && category !== 'all') {
      query += ' WHERE category = $1';
      params.push(category);
    }

    query += ' ORDER BY id';

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching products:', err);
    res.status(500).json({ error: 'Error al obtener productos' });
  }
});

// GET /products/:id - Obtener producto por ID
app.get('/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM products WHERE id = $1', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error fetching product:', err);
    res.status(500).json({ error: 'Error al obtener el producto' });
  }
});

// POST /products - Crear nuevo producto
app.post('/products', async (req, res) => {
  try {
    const { name, category, price, description, image } = req.body;

    if (!name || !category || !price) {
      return res.status(400).json({ error: 'Faltan campos requeridos' });
    }

    const result = await pool.query(
      'INSERT INTO products (name, category, price, description, image) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [name, category, price, description, image]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error creating product:', err);
    res.status(500).json({ error: 'Error al crear el producto' });
  }
});

// PUT /products/:id - Actualizar producto
app.put('/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, category, price, description, image } = req.body;

    const result = await pool.query(
      'UPDATE products SET name = $1, category = $2, price = $3, description = $4, image = $5 WHERE id = $6 RETURNING *',
      [name, category, price, description, image, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error updating product:', err);
    res.status(500).json({ error: 'Error al actualizar el producto' });
  }
});

// DELETE /products/:id - Eliminar producto
app.delete('/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM products WHERE id = $1 RETURNING *', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    res.json({ message: 'Producto eliminado', product: result.rows[0] });
  } catch (err) {
    console.error('Error deleting product:', err);
    res.status(500).json({ error: 'Error al eliminar el producto' });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', service: 'products-service' });
});

// Iniciar servidor
async function start() {
  await initializeDatabase();
  
  app.listen(port, () => {
    console.log(`Productos Service corriendo en puerto ${port}`);
  });
}

start();
