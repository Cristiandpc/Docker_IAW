# 🧪 Guía de Pruebas

## Pruebas Manuales con cURL

### 1. Health Checks

```bash
# Verificar que el gateway está corriendo
curl http://localhost/health

# Respuesta esperada:
# healthy

# Verificar health de productos
curl http://localhost/health/products

# Respuesta esperada:
# {"status":"OK","service":"products-service"}

# Verificar health de órdenes
curl http://localhost/health/orders

# Respuesta esperada:
# {"status":"OK","service":"orders-service"}
```

---

### 2. API de Productos

#### Obtener todos los productos
```bash
curl http://localhost/api/products

# Respuesta esperada:
# [
#   {
#     "id": 1,
#     "name": "Smartphone",
#     "category": "electronica",
#     "price": "300.00",
#     ...
#   },
#   ...
# ]
```

#### Filtrar por categoría
```bash
# Electrónica
curl "http://localhost/api/products?category=electronica"

# Ropa
curl "http://localhost/api/products?category=ropa"

# Hogar
curl "http://localhost/api/products?category=hogar"
```

#### Obtener producto específico
```bash
curl http://localhost/api/products/1
```

#### Crear nuevo producto
```bash
curl -X POST http://localhost/api/products \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Monitor 4K",
    "category": "electronica",
    "price": 450,
    "description": "Monitor UltraHD 32 pulgadas",
    "image": "https://via.placeholder.com/200x150?text=Monitor"
  }'
```

#### Actualizar producto
```bash
curl -X PUT http://localhost/api/products/1 \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Smartphone Pro",
    "category": "electronica",
    "price": 350,
    "description": "Versión mejorada",
    "image": "https://via.placeholder.com/200x150?text=SmartphonePro"
  }'
```

#### Eliminar producto
```bash
curl -X DELETE http://localhost/api/products/1
```

---

### 3. API de Órdenes

#### Obtener todas las órdenes
```bash
curl http://localhost/api/orders

# Respuesta esperada:
# [
#   {
#     "id": 1,
#     "order_number": "ORD-A1B2C3D4",
#     "items": [...],
#     "total": "600.00",
#     "status": "pendiente",
#     ...
#   }
# ]
```

#### Crear nueva orden
```bash
curl -X POST http://localhost/api/orders \
  -H "Content-Type: application/json" \
  -d '{
    "items": [
      {
        "id": 1,
        "name": "Smartphone",
        "price": 300,
        "quantity": 2
      },
      {
        "id": 2,
        "name": "Camiseta",
        "price": 20,
        "quantity": 1
      }
    ],
    "total": 620
  }'

# Respuesta (con número de orden único):
# {
#   "id": 1,
#   "order_number": "ORD-A1B2C3D4",
#   "items": [...],
#   "total": "620.00",
#   "status": "pendiente",
#   ...
# }
```

#### Obtener orden específica
```bash
# Por ID
curl http://localhost/api/orders/1

# Por número de orden
curl http://localhost/api/orders/ORD-A1B2C3D4
```

#### Actualizar estado de orden
```bash
curl -X PUT http://localhost/api/orders/ORD-A1B2C3D4 \
  -H "Content-Type: application/json" \
  -d '{"status": "procesando"}'

# Estados válidos:
# - pendiente
# - procesando
# - enviado
# - entregado
# - cancelado
```

#### Eliminar orden
```bash
curl -X DELETE http://localhost/api/orders/1
```

---

## Pruebas en la Base de Datos

### Conectarse a PostgreSQL
```bash
docker-compose exec db psql -U tienda_user -d tienda_db
```

### Consultas útiles en psql

```sql
-- Ver todos los productos
SELECT * FROM products;

-- Contar productos por categoría
SELECT category, COUNT(*) as total FROM products GROUP BY category;

-- Ver todas las órdenes
SELECT * FROM orders;

-- Ver detalles de órdenes (JSON)
SELECT order_number, items, total, status FROM orders;

-- Filtrar órdenes por estado
SELECT * FROM orders WHERE status = 'pendiente';

-- Contar órdenes por estado
SELECT status, COUNT(*) as total FROM orders GROUP BY status;

-- Salir
\q
```

---

## Pruebas en la Interfaz de Usuario (Manual)

### Escenario 1: Navegar y Explorar
1. Abrir http://localhost/
2. Esperar a que carguen los productos
3. Verificar que se muestran 5 productos de ejemplo
4. Hacer clic en cada categoría (Todos, Electrónica, Ropa, Hogar)
5. Verificar que el filtrado funciona

### Escenario 2: Agregar al Carrito
1. Hacer clic en "Agregar al carrito" en un producto
2. Verificar que el contador del carrito aumenta
3. Agregar el mismo producto nuevamente
4. Verificar que la cantidad aumenta (no se agrega duplicado)

### Escenario 3: Gestionar Carrito
1. Abrir el carrito (lado derecho)
2. Aumentar cantidad de un artículo
3. Disminuir cantidad
4. Eliminar un artículo
5. Verificar que el total se recalcula

### Escenario 4: Realizar Compra
1. Agregar varios artículos al carrito
2. Hacer clic en "Realizar Compra"
3. Verificar alert de éxito
4. Verificar que el carrito se vacía
5. Usar cURL para obtener `/api/orders` y verificar que se creó

---

## Scripts de Prueba Automatizadas

### Script bash para pruebas rápidas

Crear archivo `test.sh`:

```bash
#!/bin/bash

echo "=== Pruebas de API ==="

echo -e "\n1. Health Check"
curl -s http://localhost/health | jq .

echo -e "\n2. Obtener Productos"
curl -s http://localhost/api/products | jq '. | length'

echo -e "\n3. Crear Producto"
NEW_PRODUCT=$(curl -s -X POST http://localhost/api/products \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Producto Test",
    "category": "test",
    "price": 99,
    "description": "Test",
    "image": "https://placeholder.com"
  }')
echo $NEW_PRODUCT | jq .

echo -e "\n4. Crear Orden"
curl -s -X POST http://localhost/api/orders \
  -H "Content-Type: application/json" \
  -d '{
    "items": [{"id": 1, "name": "Test", "price": 10, "quantity": 1}],
    "total": 10
  }' | jq .

echo -e "\n5. Ver Órdenes"
curl -s http://localhost/api/orders | jq '. | length'

echo -e "\n✅ Pruebas completadas"
```

Ejecutar:
```bash
chmod +x test.sh
./test.sh
```

---

## Performance Testing (carga)

### Prueba simple con Apache Bench

```bash
# Instalar
sudo apt install apache2-utils

# Prueba simple: 1000 requests, 10 concurrentes
ab -n 1000 -c 10 http://localhost/

# Prueba de API de productos
ab -n 1000 -c 10 http://localhost/api/products
```

### Prueba con wrk (más realista)

```bash
# Instalar
git clone https://github.com/wg/wrk.git
cd wrk && make

# Ejecutar prueba
./wrk -t12 -c400 -d30s http://localhost/
```

---

## Checklist de Verificación

- [ ] Frontend carga correctamente
- [ ] Productos se muestran en la interfaz
- [ ] Filtrado por categoría funciona
- [ ] Agregar al carrito actualiza contador
- [ ] Carrito calcula totales correctamente
- [ ] Realizar compra crea orden en BD
- [ ] API Gateway enruta correctamente
- [ ] Health checks retornan estado OK
- [ ] Logs no muestran errores
- [ ] Base de datos tiene datos de ejemplo

---

## Herramientas Adicionales

### Postman (GUI para endpoints)

1. Descargar desde https://www.postman.com/downloads/
2. Importar requests:
   - GET http://localhost/api/products
   - POST http://localhost/api/orders
   - PUT http://localhost/api/orders/{id}

### Insomnia (Alternativa a Postman)

1. Descargar desde https://insomnia.rest/
2. Crear requests similar a Postman

### Bruno (Open Source)

```bash
npm install -g @usebruno/cli
bruno run --collection ./insomnia-export.json
```

---

## Métricas a Monitorear

```bash
# Ver uso de recursos
docker stats

# Ver logs en tiempo real
docker-compose logs -f

# Conexiones a BD
docker-compose exec db psql -U tienda_user -d tienda_db \
  -c "SELECT datname, count(*) FROM pg_stat_activity GROUP BY datname;"
```
