FROM php:8.2-apache

# install dependencies
RUN apt-get update && apt-get install -y \
    libicu-dev \
    libzip-dev \
    unzip \
    git \
    pkg-config \
    g++ \
    libcurl4-openssl-dev

# install php extensions
RUN docker-php-ext-configure intl \
    && docker-php-ext-install intl curl zip


# install dependencies
RUN apt-get update && apt-get install -y \
    libicu-dev \
    libzip-dev \
    unzip \
    git \
    pkg-config \
    g++ \
    libcurl4-openssl-dev

# install php extensions
RUN docker-php-ext-configure intl \
    && docker-php-ext-install intl curl zip

# install composer
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

# enable apache rewrite
RUN a2enmod rewrite

# copy project
COPY . /var/www/html

# set apache root to public
RUN sed -i 's!/var/www/html!/var/www/html/public!g' /etc/apache2/sites-available/000-default.conf

WORKDIR /var/www/html

EXPOSE 80