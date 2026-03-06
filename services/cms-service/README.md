# CMS Service - Strapi

Este microservicio proporciona gestión de contenido para la tienda usando Strapi.

## Características

- Gestión de banners promocionales
- Categorías de productos
- Páginas estáticas (acerca de, contacto, etc.)
- Sistema de usuarios y permisos
- API REST y GraphQL
- Panel de administración
- Integración con servicios existentes

## Endpoints

### Banners
- `GET /api/banners` - Obtener banners activos
- `GET /api/banners/active` - Banners activos ordenados

### Categorías
- `GET /api/product-categories` - Obtener categorías
- `POST /api/product-categories` - Crear categoría

### Páginas
- `GET /api/pages` - Obtener páginas
- `GET /api/pages/:slug` - Página por slug

### Admin
- `POST /admin/sync/products` - Sincronizar con servicio de productos

## Panel de Administración

Accede a http://localhost:1337/admin para gestionar el contenido.

Credenciales iniciales:
- Email: admin@tienda.com
- Password: Admin123

### Roles y Autenticación
El CMS viene configurado con varios roles predeterminados (public, authenticated, editor, admin). El script de
inicialización (`lib/init.js`) crea estos roles y puede utilizarse para generar usuarios
de prueba. Los roles controlan el acceso a los endpoints y al panel de administración.

- **public**: permisos para visitantes anónimos.
- **authenticated**: usuarios que han iniciado sesión.
- **editor**: permisos de editar contenido, aprovar y publicar.
- **admin**: acceso completo al panel y configuración.

Puedes crear usuarios adicionales desde el panel de administración o usando la API
`/admin/users`. La autenticación de la API se obtiene a través de JSON Web Tokens
(JWT) generados en `/auth/local`.

Ejemplo de login (curl):

```bash
curl -X POST http://localhost:1337/api/auth/local \
  -H "Content-Type: application/json" \
  -d '{"identifier":"editor@tienda.com","password":"Editor123"}'
```

## Integración

El CMS se integra con:
- Servicio de Productos (sincronización de categorías)
- Frontend React (consumo de banners y páginas)
- API Gateway (enrutamiento)
