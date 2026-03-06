# CMS Service - Guía de Inicio Rápido

## 🚀 Inicio Rápido

### 1. Instalar dependencias
```bash
cd services/cms-service
npm install
```

### 2. Configurar base de datos
El CMS usa la misma base de datos PostgreSQL que los otros servicios.

### 3. Ejecutar Strapi
```bash
npm run develop
```

### 4. Acceder al panel de administración
- URL: http://localhost:1337/admin
- Email: admin@tienda.com
- Password: Admin123

## 📊 Content Types Disponibles

### Banners
- Gestiona banners promocionales
- Imágenes, títulos, descripciones
- Enlaces a categorías o productos
- Orden y activación

### Categorías de Productos
- Organiza productos por categorías
- Jerarquía padre-hijo
- Imágenes representativas
- Sincronización automática con productos

### Páginas Estáticas
- Acerca de, contacto, términos, etc.
- Contenido enriquecido
- SEO (meta title, description)
- Publicación programada

## 🔗 Integración con Otros Servicios

### Sincronización con Productos
```bash
# Desde el panel admin o via API
POST /admin/sync/products
```

### Consumo desde Frontend
```javascript
// Obtener banners activos
const banners = await fetch('/api/cms/banners/active');

// Obtener página por slug
const page = await fetch('/api/cms/pages/acerca-de');
```

## 🛠️ Desarrollo

### Agregar nuevo Content Type
1. Ir al Content-Types Builder
2. Crear nuevo tipo
3. Configurar campos
4. Guardar y publicar

### Personalizar API
- Modificar controllers en `src/api/`
- Agregar middlewares en `src/middlewares/`
- Crear servicios personalizados

### Plugins útiles
- SEO
- Comments
- Newsletter
- Analytics

## 📚 Recursos

- [Documentación Strapi](https://docs.strapi.io/)
- [Guía de despliegue](DEPLOYMENT.md)
- [API Reference](https://docs.strapi.io/developer-docs/latest/developer-resources/database-apis-reference/rest-api.html)
