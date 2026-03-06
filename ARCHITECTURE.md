# Architectural Diagram - Tienda Reactiva Microservicios

## Flujo de Solicitud HTTP

```
┌────────────────────────────────────────────────────────────────────┐
│ 1. CLIENTE REALIZA SOLICITUD                                       │
│    Usuario abre navegador y accede a http://localhost/             │
└────────────────────┬─────────────────────────────────────────────┘
                     │
                     ▼
┌────────────────────────────────────────────────────────────────────┐
│ 2. LLEGADA AL API GATEWAY (Nginx Puerto 80)                        │
│    - Recibe la solicitud HTTP                                      │
│    - Aplica Rate Limiting                                          │
│    - Verifica Headers de Seguridad                                 │
│    - Enruta según la ruta solicitada                               │
└────────────────────┬──────────────────────┬──────────────────────┘
                     │                      │
         ┌───────────┴────────┐  ┌─────────┴─────────────┐
         │                    │  │                       │
         ▼                    ▼  ▼                       ▼
    Frontend      /api/products  /api/orders      Health Check
    (React 3000)   (3001)         (3002)            endpoints
         │          │             │                   │
         │          │             │                   │
    ┌────┴──┐   ┌───┴──┐    ┌────┴──┐           ┌─────┴──┐
    │        │   │      │    │       │           │        │
    ▼        ▼   ▼      ▼    ▼       ▼           ▼        ▼

┌──────────────────────────────────────────────────────────────────┐
│ 3. PROCESAMIENTO EN MICROSERVICIOS                                │
│                                                                  │
│  Frontend Service           Products Service  Orders Service    │
│  ├─ Sirve React App         ├─ GET productos  ├─ GET órdenes   │
│  └─ Actualiza en vivo       ├─ POST producto  ├─ POST orden     │
│                             ├─ PUT producto   ├─ PUT estado     │
│                             └─ DELETE         └─ DELETE orden   │
│                                                                  │
│  Todos se conectan a: PostgreSQL (Puerto 5432)                 │
│  ├─ Tabla: products                                             │
│  └─ Tabla: orders                                              │
└──────────────────────────────────────────────────────────────────┘
                     │
                     ▼
┌────────────────────────────────────────────────────────────────────┐
│ 4. RESPUESTA AL CLIENTE                                            │
│    - Compresión Gzip (si es aplicable)                             │
│    - Headers de Seguridad añadidos                                 │
│    - Contenido enviado al navegador                                │
└────────────────────┬─────────────────────────────────────────────┘
                     │
                     ▼
┌────────────────────────────────────────────────────────────────────┐
│ 5. RENDERIZADO EN CLIENTE                                          │
│    - React renderiza componentes                                   │
│    - Actualiza solo partes necesarias (Virtual DOM)                │
│    - Usuario interactúa con la aplicación                          │
└────────────────────────────────────────────────────────────────────┘
```

## Comunicación Entre Servicios

```
┌─────────────────────────────────────────────────────────────┐
│               COMUNICACIÓN INTER-SERVICIOS                  │
└─────────────────────────────────────────────────────────────┘

Frontend (React)
    │
    └──► Axios Request ──► API Gateway
                              │
                    ┌─────────┼─────────┐
                    │         │         │
                    ▼         ▼         ▼
            Products API  Orders API  Health Checks
            (Port 3001)    (Port 3002)
                    │         │
                    └──────┬──┘
                           │ Pool de conexiones
                           ▼
                     PostgreSQL DB
                    (Port 5432)
                    
                    ├─ products table
                    └─ orders table
```

## Stack Tecnológico

```
┌─────────────────────────────────────────────────────────┐
│              CAPAS DE LA ARQUITECTURA                    │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  PRESENTATION LAYER (Frontend)                         │
│  ├─ React 18                                           │
│  ├─ Axios (HTTP Client)                                │
│  └─ CSS/Componentes Reutilizables                      │
│                                                         │
│  API GATEWAY LAYER                                     │
│  ├─ Nginx (Reverse Proxy)                              │
│  ├─ Rate Limiting                                      │
│  ├─ Compression                                        │
│  └─ Security Headers                                   │
│                                                         │
│  APPLICATION LAYER (Microservicios)                    │
│  ├─ Express.js (API Framework)                         │
│  ├─ CORS handling                                      │
│  ├─ Business Logic                                     │
│  └─ Data Validation                                    │
│                                                         │
│  DATA LAYER                                            │
│  ├─ PostgreSQL (RDBMS)                                 │
│  ├─ Connection Pooling                                 │
│  └─ Transacciones ACID                                 │
│                                                         │
│  ORCHESTRATION LAYER                                   │
│  ├─ Docker Compose                                     │
│  ├─ Container Management                               │
│  └─ Service Discovery                                  │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

## Ejemplo de Flujo Completo: Compra de Producto

```
1. Usuario abre navegador
   └─► GET http://localhost/
       └─► API Gateway recibe
           └─► Enruta a Frontend React

2. Frontend se carga
   └─► React hace solicitud con Axios
       └─► GET /api/products
           └─► API Gateway routea a Products Service
               └─► Products Service consulta PostgreSQL
                   └─► Retorna lista de productos
               └─► Respuesta a Frontend

3. Usuario filtra por categoría
   └─► GET /api/products?category=electronica
       └─► Mismo flujo, pero con filtro

4. Usuario agrega producto al carrito
   └─► Estado local en React (sin backend)
       └─► Carrito se actualiza en tiempo real

5. Usuario realiza compra
   └─► POST /api/orders
       ├─ Body: {items: [...], total: 600}
       └─► API Gateway routea a Orders Service
           └─► Orders Service
               ├─ Genera order_number único
               ├─ Guarda en PostgreSQL
               └─► Retorna confirmación
       └─► Frontend actualiza UI con confirmación

6. El flujo completo ocurre en < 200ms
   └─► Gracias a la arquitectura de microservicios
       └─► Escalabilidad independiente
           └─► Mejor rendimiento
```

## Ventajas Arquitectónicas

```
✅ ESCALABILIDAD
   └─ Cada microservicio puede escalar independientemente
   └─ Load balancer en gateway distribuye tráfico

✅ MANTENIBILIDAD
   └─ Código modular y separado por dominio
   └─ Fácil de entender y modificar

✅ RESILIENCIA
   └─ Si un servicio falla, otros siguen operando
   └─ Health checks automáticos

✅ INDEPENDENCIA TECNOLÓGICA
   └─ Cada servicio puede usar tech stack diferente
   └─ Fácil actualizar tecnologías

✅ DESPLIEGUE INDEPENDIENTE
   └─ Deploy de cada servicio sin afectar otros
   └─ CI/CD más rápido y seguro

✅ SEPARACIÓN DE RESPONSABILIDADES
   └─ Frontend: presentación y UX
   └─ Products: gestión de catálogo
   └─ Orders: gestión de compras
   └─ DB: persistencia de datos
```

## Diagrama de Red

```
┌──────────────────────────────────────────────────────────┐
│              DOCKER NETWORK: microservices               │
│              Type: Bridge Network                        │
└──────────────────────────────────────────────────────────┘

External Network (Host)
│
│ Port Mappings:
│ ├─ 80 ──────────► API Gateway:80
│ ├─ 3000 ────────► Frontend:3000
│ ├─ 3001 ────────► Products:3001
│ ├─ 3002 ────────► Orders:3002
│ └─ 5432 ────────► PostgreSQL:5432
│
└─► Bridge Network (Internal)
    │
    ├─ api-gateway     (hostname interno)
    ├─ frontend        (hostname interno)
    ├─ products-service (hostname interno)
    ├─ orders-service  (hostname interno)
    └─ db              (hostname interno)

    Internal Communication via hostnames:
    └─ frontend:3000 (accesible como "frontend" desde otros contenedores)
    └─ db:5432 (accesible como "db" desde otros contenedores)
```

## Estados de Órdenes

```
pendiente ──► procesando ──► enviado ──► entregado
   │              │            │          │
   │              │            │          └──► completado
   │              │            │
   │              └────────────┴──────────► cancelado
   │
   └────────────────────────────────────► rechazado
```
