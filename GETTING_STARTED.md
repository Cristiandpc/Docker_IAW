# 🚀 Guía de Instalación y Ejecución

## Requisitos del Sistema

### Mínimos
- 4GB RAM disponible
- 5GB espacio en disco
- Docker 20.10+
- Docker Compose 2.0+

### Recomendados
- 8GB+ RAM
- 10GB+ espacio en disco
- CPU multi-core
- Linux (óptimo) o Windows con WSL2

### Herramientas Opcionales
- `curl` - Para pruebas de API
- `psql` - Cliente PostgreSQL
- `git` - Control de versiones

---

## Paso 1: Instalación de Docker

### Ubuntu/Debian
```bash
# Actualizar paquetes
sudo apt update && sudo apt upgrade -y

# Instalar Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Instalar Docker Compose
sudo apt install docker-compose-plugin

# Agregar usuario al grupo docker (evita usar sudo)
sudo usermod -aG docker $USER
newgrp docker
```

### macOS
```bash
# Instalar via Homebrew
brew install docker docker-compose

# O descargar Docker Desktop desde https://www.docker.com/products/docker-desktop
```

### Windows
```bash
# Descargar Docker Desktop desde:
# https://www.docker.com/products/docker-desktop

# Habilitar WSL2 en Windows 10/11
wsl --install
```

### Verificar instalación
```bash
docker --version
docker-compose --version
```

---

## Paso 2: Obtener el Código

```bash
# Clonar repositorio
git clone <repository-url>
cd Docker_IAW

# O si tienes el código local, navega a la carpeta
cd /workspaces/Docker_IAW
```

---

## Paso 3: Configuración Inicial

```bash
# Copiar variables de entorno
cp .env.example .env

# (Opcional) Editar .env para cambiar valores
nano .env
```

### Variables por defecto en .env
```
DB_USER=tienda_user
DB_PASSWORD=tienda_pass
DB_NAME=tienda_db
REACT_APP_API_URL=http://localhost/api
```

---

## Paso 4: Construcción de Imágenes

```bash
# Construir todas las imágenes (primera ejecución)
docker-compose build

# O construir servicios específicos
docker-compose build products-service
docker-compose build orders-service
docker-compose build frontend
docker-compose build api-gateway
```

**Nota**: Primera construcción puede tardar 5-10 minutos.

---

## Paso 5: Iniciar los Servicios

```bash
# Iniciar en modo detached (background)
docker-compose up -d

# O iniciar en foreground (ver logs en tiempo real)
docker-compose up
```

### Esperado después de iniciar:
```
Creating tienda_db ... done
Creating products_service ... done
Creating orders_service ... done
Creating frontend_app ... done
Creating api_gateway ... done
```

---

## Paso 6: Verificar Estado

```bash
# Ver estado de todos los servicios
docker-compose ps

# Debería mostrar:
# CONTAINER ID   IMAGE           STATUS              PORTS
# ...
# tienda_db      postgres:15     Up (healthy)        0.0.0.0:5432->5432/tcp
# products_...   ...             Up 1s               0.0.0.0:3001->3001/tcp
# orders_...     ...             Up 1s               0.0.0.0:3002->3002/tcp
# frontend_...   ...             Up 1s               0.0.0.0:3000->3000/tcp
# api_gateway    ...             Up 1s               0.0.0.0:80->80/tcp
```

---

## Paso 7: Acceder a la Aplicación

### URLs de acceso

| Servicio | URL | Descripción |
|----------|-----|-------------|
| Frontend | http://localhost/ | Aplicación principal |
| API Productos | http://localhost/api/products | Endpoint de productos |
| API Órdenes | http://localhost/api/orders | Endpoint de órdenes |
| Health Check | http://localhost/health | Estado general |

### Prueba rápida en navegador
```
Abre: http://localhost/
```
Deberías ver la tienda reactiva con productos.

---

## Troubleshooting Inicial

### Error: "Port 80 is already in use"
```bash
# Cambiar en docker-compose.yml
ports:
  - "8080:80"  # Cambiar 80 a 8080

# Luego acceder a: http://localhost:8080/
```

### Error: "Cannot connect to Docker daemon"
```bash
# Lineart iniciar Docker
sudo systemctl start docker

# O en macOS
open /Applications/Docker.app
```

### Esperar a que la BD esté lista
```bash
# Los logs mostrarán cuando está lista
docker-compose logs db

# Esperar a ver: "database system is ready to accept connections"
```

### Base de datos vacía
```bash
# Los datos de ejemplo se crean automáticamente
# Al iniciar, verás en los logs:
# "Productos de ejemplo insertados"
```

---

## Próximos Pasos

Una vez todo esté corriendo:

1. **Explorar la aplicación**: http://localhost/
2. **Leer documentación de API**: Ver [ARCHITECTURE.md](ARCHITECTURE.md)
3. **Ejecutar pruebas**: Ver [TESTING.md](TESTING.md)
4. **Escalar servicios**: Ver [SCALING.md](SCALING.md)

---

## Parada y Limpieza

### Detener servicios (mantener datos)
```bash
docker-compose down
```

### Detener y limpiar todo (elimina datos)
```bash
docker-compose down -v
```

### Reiniciar un servicio específico
```bash
docker-compose restart products-service
```

---

## Logs y Debugging

```bash
# Ver todos los logs
docker-compose logs -f

# Ver logs de un servicio
docker-compose logs -f products-service

# Ver últimas N líneas
docker-compose logs --tail=50 products-service

# Ver logs con timestamps
docker-compose logs -f --timestamps api-gateway
```

---

## Próximos Capítulos

- [ARCHITECTURE.md](ARCHITECTURE.md) - Detalles de arquitectura
- [TESTING.md](TESTING.md) - Guía de pruebas
- [DEPLOYMENT.md](DEPLOYMENT.md) - Despliegue en producción
