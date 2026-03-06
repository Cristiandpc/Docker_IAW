FROM node:18-alpine

WORKDIR /app

# Instalar dependencias del sistema para Strapi
RUN apk add --no-cache python3 make g++ curl

# Copiar archivos de configuración
COPY package*.json ./

# Instalar dependencias
    RUN npm install
# Copiar código fuente
COPY . .

# Crear directorio para uploads
RUN mkdir -p public/uploads

# Dar permisos de ejecución al script de inicialización
RUN chmod +x lib/init.js

# Exponer puerto
EXPOSE 1337

# Comando para inicializar y ejecutar Strapi
CMD ["sh", "-c", "node lib/init.js && npm run develop"]
