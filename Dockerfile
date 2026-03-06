FROM php:8.1-fpm

# Instalar extensiones necesarias
RUN docker-php-ext-install pdo pdo_mysql

# Copiar archivos de la app
COPY app/ /var/www/html/

# Cambiar permisos
RUN chown -R www-data:www-data /var/www/html

# Exponer puerto
EXPOSE 9000