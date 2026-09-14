FROM php:8.2-apache

# Install dependencies
RUN apt-get update && apt-get install -y \
    git curl libpng-dev libonig-dev libxml2-dev zip unzip nodejs npm \
    && docker-php-ext-install pdo_mysql mbstring exif pcntl bcmath gd \
    && a2enmod rewrite

# Install Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Apache config
RUN echo '<VirtualHost *:80>\n\
    DocumentRoot /var/www/html/public\n\
    <Directory /var/www/html/public>\n\
        Options Indexes FollowSymLinks\n\
        AllowOverride All\n\
        Require all granted\n\
    </Directory>\n\
    ErrorLog ${APACHE_LOG_DIR}/error.log\n\
    CustomLog ${APACHE_LOG_DIR}/access.log combined\n\
</VirtualHost>' > /etc/apache2/sites-available/000-default.conf

# Copy server code
COPY server/ /var/www/html

# Copy server .env
COPY server/.env /var/www/html/.env

# Copy client code
COPY client/ /var/www/html/client

WORKDIR /var/www/html

# Install Laravel dependencies
RUN composer install --no-dev --optimize-autoloader --no-cache

# Build React with Docker environment variable
ARG VITE_BACKEND_ENDPOINT=http://localhost:8000
ENV VITE_BACKEND_ENDPOINT=$VITE_BACKEND_ENDPOINT

RUN cd client && \
    npm install && \
    VITE_BACKEND_ENDPOINT=$VITE_BACKEND_ENDPOINT npm run build && \
    cp -r dist/* ../public/

# Fix .htaccess for SPA + Laravel API
RUN echo '<IfModule mod_rewrite.c>\n\
    RewriteEngine On\n\
    RewriteCond %{HTTP:Authorization} .\n\
    RewriteRule .* - [E=HTTP_AUTHORIZATION:%{HTTP:Authorization}]\n\
    RewriteCond %{REQUEST_URI} ^/api\n\
    RewriteRule ^ index.php [L]\n\
    RewriteCond %{REQUEST_FILENAME} -f\n\
    RewriteRule ^ - [L]\n\
    RewriteRule ^ index.html [L]\n\
</IfModule>' > /var/www/html/public/.htaccess

# Set permissions
RUN chown -R www-data:www-data /var/www/html \
    && chmod -R 775 storage bootstrap/cache

EXPOSE 80
CMD ["apache2-foreground"]