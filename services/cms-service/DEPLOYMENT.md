# Guía de Despliegue en Vercel

## Opción 1: Despliegue Completo de Strapi en Vercel

### Requisitos
- Cuenta en Vercel
- Base de datos PostgreSQL (Neon.tech, Supabase, etc.)
- Repositorio Git

### Pasos

1. **Crear base de datos PostgreSQL**
   ```bash
   # Usar Neon.tech o Supabase para PostgreSQL serverless
   # Obtener DATABASE_URL
   ```

2. **Configurar variables de entorno en Vercel**
   ```
   DATABASE_URL=postgresql://...
   ADMIN_JWT_SECRET=tu-jwt-secret
   API_TOKEN_SALT=tu-api-salt
   TRANSFER_TOKEN_SALT=tu-transfer-salt
   NODE_ENV=production
   ```

3. **Desplegar desde Git**
   ```bash
   # Conectar repositorio a Vercel
   # Vercel detectará automáticamente vercel.json
   ```

4. **Configurar dominio**
   - Ir a Settings > Domains
   - Agregar dominio personalizado

## Opción 2: Solo API Routes (Recomendado)

### Ventajas
- Más rápido
- Menos recursos
- Mejor escalabilidad
- Más económico

### Estructura
```
services/cms-service/
├── pages/
│   └── api/
│       ├── banners/
│       │   └── active.js
│       ├── pages/
│       │   └── [slug].js
│       └── admin/
│           └── sync/
│               └── products.js
├── lib/
│   ├── db.js
│   ├── banners.js
│   ├── pages.js
│   └── sync.js
└── vercel.json
```

### Despliegue
```bash
# Instalar Vercel CLI
npm i -g vercel

# Desplegar
cd services/cms-service
vercel --prod
```

## Integración con Arquitectura Existente

### Actualizar API Gateway
```nginx
# En api-gateway/default.conf
location /api/cms/ {
    proxy_pass http://cms-service:1337/;
    # O para Vercel:
    # proxy_pass https://tu-app.vercel.app/api/;
}
```

### Actualizar Frontend
```javascript
// En frontend/src/App.js
const CMS_API_URL = process.env.REACT_APP_CMS_API_URL || 'http://localhost/api/cms';

// Obtener banners
const banners = await axios.get(`${CMS_API_URL}/banners/active`);
```

## URLs de Acceso

### Desarrollo (Docker)
- Admin: http://localhost:1337/admin
- API: http://localhost:1337/api/

### Producción (Vercel)
- Admin: https://tu-app.vercel.app/admin
- API: https://tu-app.vercel.app/api/

## Base de Datos

### Para desarrollo
- PostgreSQL local en Docker

### Para producción
- Neon.tech (PostgreSQL serverless)
- Supabase
- PlanetScale
- Railway

## Costos Aproximados

### Vercel
- Hobby: $0/mes
- Pro: $20/mes
- Enterprise: Personalizado

### Base de Datos
- Neon.tech: $0-20/mes
- Supabase: $0-25/mes

## Monitoreo

### Vercel Analytics
- Métricas de rendimiento
- Logs de funciones
- Uso de recursos

### Integración con otros servicios
- Webhooks para notificaciones
- API para sincronización automática
