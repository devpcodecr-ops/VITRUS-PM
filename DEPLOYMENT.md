# Guía de Despliegue Vitrus PM (V2.0 Multi-Tenant)

Esta guía está diseñada para desplegar la aplicación en un servidor Ubuntu 24.04 con Nginx, PM2 y MySQL.

## 1. Requisitos Previos

- **Node.js**: v18.17.0 o superior
- **MySQL**: v8.0 o superior
- **PM2**: `npm install -g pm2`
- **Nginx**: Servidor web instalado

## 2. Configuración de Base de Datos

1. Ingresar a MySQL:
   ```bash
   mysql -u root -p
   ```
2. Crear la base de datos e importar el esquema:
   ```sql
   -- Copiar y pegar el contenido de backend/schema.sql
   ```
   Esto creará las tablas críticas (`studios`, `users`, `projects`) con las claves foráneas necesarias.

## 3. Configuración del Backend

1. Navegar al directorio backend:
   ```bash
   cd backend
   ```
2. Instalar dependencias:
   ```bash
   npm install
   ```
3. Configurar variables de entorno:
   ```bash
   cp .env.example .env
   nano .env
   ```
   Asegurarse de configurar:
   - `JWT_SECRET`: Una cadena larga y segura.
   - `DB_USER`, `DB_PASS`: Credenciales de MySQL.

4. Iniciar con PM2:
   ```bash
   pm2 start ecosystem.config.cjs
   pm2 save
   ```

## 4. Configuración del Frontend

1. Navegar al directorio frontend (raíz del proyecto en este repo):
   ```bash
   npm install
   ```
2. Compilar para producción:
   ```bash
   npm run build
   ```
3. Los archivos generados estarán en `dist/`.

## 5. Configuración de Nginx

Configurar un bloque de servidor para servir el frontend y hacer proxy al backend:

```nginx
server {
    listen 80;
    server_name tu-dominio.com;

    root /var/www/vitruspm/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## 6. Verificación de Multi-Tenant

Para verificar que la arquitectura funciona correctamente:

1. **Login como Global Admin**: `admin@vitrus.com` / `password`
   - Debería ver datos globales.
2. **Login como Studio Admin**: `studio@agency.com` / `password`
   - Debería ver SOLO datos del estudio 10.
   - Intentar acceder a `/api/projects/1` (si el proyecto 1 pertenece a otro estudio) debería retornar 403 o 404.
