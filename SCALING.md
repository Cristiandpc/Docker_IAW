# 📈 Escalabilidad y Optimización

## Escalabilidad Horizontal

### Docker Compose con réplicas

Para escalar servicios en desarrollo:

```bash
# Ejecutar 3 instancias del servicio de productos
docker-compose up -d --scale products-service=3

# Ejecutar 2 instancias del servicio de órdenes
docker-compose up -d --scale orders-service=2
```

**Nota**: Esto ejecutaría en puertos incrementales (3001, 3001:1, 3001:2).

### Load Balancing Manual en Nginx

Actualizar `api-gateway/default.conf`:

```nginx
upstream products_backend {
    server products-service:3001;
    server products-service:3001;  # Mismo contenedor (réplicas)
    server products-service:3001;  # pero en Compose se manejaría diferente
}

upstream orders_backend {
    server orders-service:3002;
    server orders-service:3002;
}

server {
    listen 80;
    
    location /api/products {
        proxy_pass http://products_backend;
        proxy_set_header Host $host;
    }
    
    location /api/orders {
        proxy_pass http://orders_backend;
        proxy_set_header Host $host;
    }
}
```

---

## Migración a Kubernetes

### Beneficios
- Orquestación automática
- Auto-scaling basado en métricas
- Self-healing
- Rolling updates
- Multi-zona

### Archivos de configuración necesarios

**products-deployment.yaml**:
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: products-service
spec:
  replicas: 3
  selector:
    matchLabels:
      app: products-service
  template:
    metadata:
      labels:
        app: products-service
    spec:
      containers:
      - name: products-service
        image: tienda/products-service:latest
        ports:
        - containerPort: 3001
        env:
        - name: DB_HOST
          value: postgres-service
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
---
apiVersion: v1
kind: Service
metadata:
  name: products-service
spec:
  selector:
    app: products-service
  ports:
    - protocol: TCP
      port: 3001
      targetPort: 3001
  type: ClusterIP
```

---

## Optimizaciones de Rendimiento

### Frontend React

1. **Code Splitting**
```javascript
import React, { lazy, Suspense } from 'react';

const ProductList = lazy(() => import('./components/ProductList'));

function App() {
  return (
    <Suspense fallback={<div>Cargando...</div>}>
      <ProductList />
    </Suspense>
  );
}
```

2. **Memoización de componentes**
```javascript
import { memo } from 'react';

const ProductCard = memo(({ product, onAddToCart }) => {
  return (
    // Component JSX
  );
});

export default ProductCard;
```

3. **Lazy loading de imágenes**
```javascript
<img 
  src={product.image}
  loading="lazy"
  alt={product.name}
/>
```

### Base de Datos

1. **Índices**
```sql
-- Crear índice en categoría
CREATE INDEX idx_products_category ON products(category);

-- Crear índice en status de órdenes
CREATE INDEX idx_orders_status ON orders(status);

-- Índice de búsqueda full-text en nombres
CREATE INDEX idx_products_name ON products USING GIN(
  to_tsvector('spanish', name)
);
```

2. **Connection Pooling**

En los servicios Node.js:
```javascript
const pool = new Pool({
  host: 'db',
  // ... credenciales
  max: 20,                    // Máximo de conexiones
  idleTimeoutMillis: 30000,   // Timeout de inactividad
  connectionTimeoutMillis: 2000,
});
```

3. **Caché en Nginx**

Agregar a `default.conf`:
```nginx
proxy_cache_path /var/cache/nginx levels=1:2 keys_zone=api_cache:10m;

location /api/products {
    proxy_cache api_cache;
    proxy_cache_valid 200 1h;    # Cachear productos 1 hora
    proxy_cache_key "$scheme$request_method$host$request_uri";
    
    add_header X-Cache-Status $upstream_cache_status;
    proxy_pass http://products_backend;
}
```

---

## Monitoreo y Logging

### Stack ELK (Elasticsearch, Logstash, Kibana)

**docker-compose-monitoring.yml**:
```yaml
version: '3.9'

services:
  elasticsearch:
    image: docker.elastic.co/elasticsearch/elasticsearch:8.0.0
    environment:
      - xpack.security.enabled=false
      - "discovery.type=single-node"
    ports:
      - "9200:9200"

  kibana:
    image: docker.elastic.co/kibana/kibana:8.0.0
    ports:
      - "5601:5601"
    depends_on:
      - elasticsearch

  logstash:
    image: docker.elastic.co/logstash/logstash:8.0.0
    volumes:
      - ./logstash.conf:/usr/share/logstash/pipeline/logstash.conf
    ports:
      - "5000:5000"
```

### Prometheus + Grafana

Agregar métricas a Express.js:

```javascript
const prometheus = require('prom-client');

// Crear métrica
const httpRequestDuration = new prometheus.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code']
});

// Middleware
app.use((req, res, next) => {
  const end = prometheus.HistogramEnd(httpRequestDuration);
  res.on('finish', () => {
    end({ method: req.method, route: req.route?.path, status_code: res.statusCode });
  });
  next();
});

// Endpoint de métricas
app.get('/metrics', (req, res) => {
  res.set('Content-Type', prometheus.register.contentType);
  res.end(prometheus.register.metrics());
});
```

---

## Despliegue en Producción

### Variables de Entorno Sensibles

Usar secretos en lugar de .env:

```bash
# En Kubernetes
kubectl create secret generic db-credentials \
  --from-literal=username=tienda_user \
  --from-literal=password=<strong-password>

# En Docker Swarm
echo "tienda_pass" | docker secret create db_password -
```

### SSL/TLS en Nginx

```nginx
server {
    listen 443 ssl http2;
    server_name tu-dominio.com;

    ssl_certificate /etc/nginx/certs/cert.pem;
    ssl_certificate_key /etc/nginx/certs/key.pem;

    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    # Redirigir HTTP a HTTPS
    if ($scheme != "https") {
        return 301 https://$server_name$request_uri;
    }

    # Resto de configuración...
}
```

### Backup de Datos

```bash
#!/bin/bash
# backup.sh

BACKUP_DIR="./backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

# Crear directorio de backup
mkdir -p $BACKUP_DIR

# Hacer dump de la base de datos
docker-compose exec -T db pg_dump \
  -U tienda_user -d tienda_db \
  > $BACKUP_DIR/backup_$TIMESTAMP.sql

echo "Backup creado: $BACKUP_DIR/backup_$TIMESTAMP.sql"

# Comprimir
gzip $BACKUP_DIR/backup_$TIMESTAMP.sql

# Opcional: Subir a S3
# aws s3 cp $BACKUP_DIR/backup_$TIMESTAMP.sql.gz s3://tu-bucket/backups/
```

Ejecutar periódicamente:
```bash
chmod +x backup.sh
0 2 * * * /path/to/backup.sh  # Diariamente a las 2 AM
```

---

## Health Checks Avanzados

### Kubernetes Probes

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: products-service
spec:
  containers:
  - name: products-service
    image: products-service:latest
    
    # Liveness: ¿El servicio está vivo?
    livenessProbe:
      httpGet:
        path: /health
        port: 3001
      initialDelaySeconds: 30
      periodSeconds: 10
      
    # Readiness: ¿El servicio está listo para recibir tráfico?
    readinessProbe:
      httpGet:
        path: /health
        port: 3001
      initialDelaySeconds: 5
      periodSeconds: 5
      
    # Startup: ¿El servicio ha iniciado?
    startupProbe:
      httpGet:
        path: /health
        port: 3001
      failureThreshold: 30
      periodSeconds: 10
```

---

## Seguridad en Producción

### CORS avanzado

```nginx
location /api/ {
    set $allowed_origin "";
    
    if ($http_origin ~* ^(https?://(www\.)?(ejemplo\.com|localhost))$) {
        set $allowed_origin $http_origin;
    }
    
    add_header 'Access-Control-Allow-Origin' $allowed_origin;
    add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE';
    add_header 'Access-Control-Allow-Headers' 'Content-Type, Authorization';
}
```

### Rate Limiting Avanzado

```nginx
# Por IP
limit_req_zone $binary_remote_addr zone=one:10m rate=10r/s;

# Por usuario (requiere autenticación)
limit_req_zone $remote_user zone=user:10m rate=100r/s;

location /api/orders {
    limit_req zone=one burst=20 nodelay;
    limit_req zone=user burst=100 nodelay;
    
    proxy_pass http://orders_backend;
}
```

### WAF (Web Application Firewall)

Con ModSecurity en Nginx:

```nginx
# Bloquear SQL injection
location /api/ {
    set $sql_injection 0;
    
    if ($args ~* "(union|select|insert|update|delete|drop)") {
        set $sql_injection 1;
    }
    
    if ($sql_injection = 1) {
        return 403;
    }
    
    proxy_pass http://backend;
}
```

---

## Troubleshooting en Producción

### Alto uso de memoria
```bash
docker stats
docker-compose ps --sizes
```

### Conexiones a BD
```sql
SELECT datname, count(datid) FROM pg_stat_activity GROUP BY datid, datname;
```

### Logs centralizados
```bash
docker-compose logs --tail=1000 > logs.txt
```

### Debug de Nginx
```nginx
error_log /var/log/nginx/error.log debug;
access_log /var/log/nginx/access.log combined;
```
