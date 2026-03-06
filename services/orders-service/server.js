const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const { v4: uuidv4 } = require('uuid');

const app = express();
const port = 3002;

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

    // Crear tabla de órdenes si no existe
    await pool.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id SERIAL PRIMARY KEY,
        order_number VARCHAR(50) UNIQUE NOT NULL,
        items JSONB NOT NULL,
        total DECIMAL(10, 2) NOT NULL,
        status VARCHAR(50) DEFAULT 'pendiente',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log('Tabla de órdenes lista');
  } catch (err) {
    console.error('Error inicializando la base de datos:', err);
    process.exit(1);
  }
}

// Rutas

// GET /orders - Obtener todas las órdenes
app.get('/orders', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM orders ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching orders:', err);
    res.status(500).json({ error: 'Error al obtener órdenes' });
  }
});

// GET /orders/:id - Obtener orden por ID
app.get('/orders/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM orders WHERE id = $1 OR order_number = $1', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Orden no encontrada' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error fetching order:', err);
    res.status(500).json({ error: 'Error al obtener la orden' });
  }
});

// POST /orders - Crear nueva orden
app.post('/orders', async (req, res) => {
  try {
    const { items, total, timestamp } = req.body;

    if (!items || !total) {
      return res.status(400).json({ error: 'Faltan campos requeridos' });
    }

    const orderNumber = `ORD-${uuidv4().substring(0, 8).toUpperCase()}`;

    const result = await pool.query(
      'INSERT INTO orders (order_number, items, total, status) VALUES ($1, $2, $3, $4) RETURNING *',
      [orderNumber, JSON.stringify(items), total, 'pendiente']
    );

    console.log(`Nueva orden creada: ${orderNumber}`);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error creating order:', err);
    res.status(500).json({ error: 'Error al crear la orden' });
  }
});

// PUT /orders/:id - Actualizar estado de la orden
app.put('/orders/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ error: 'Estado requerido' });
    }

    const result = await pool.query(
      'UPDATE orders SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 OR order_number = $2 RETURNING *',
      [status, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Orden no encontrada' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error updating order:', err);
    res.status(500).json({ error: 'Error al actualizar la orden' });
  }
});

// DELETE /orders/:id - Eliminar orden
app.delete('/orders/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM orders WHERE id = $1 OR order_number = $1 RETURNING *', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Orden no encontrada' });
    }

    res.json({ message: 'Orden eliminada', order: result.rows[0] });
  } catch (err) {
    console.error('Error deleting order:', err);
    res.status(500).json({ error: 'Error al eliminar la orden' });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', service: 'orders-service' });
});

// Iniciar servidor
async function start() {
  await initializeDatabase();
  
  app.listen(port, () => {
    console.log(`Orders Service corriendo en puerto ${port}`);
  });
}

start();
