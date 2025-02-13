# G-commerce Frontend

Frontend application for the G-commerce e-commerce system, built with HTML, JavaScript, and Bootstrap.

## 🚀 Quick Start

### Prerequisites
- Docker and Docker Compose installed
- Git (optional)

### Installation

1. Create a `.env` file with the required environment variables:
```env
MYSQL_ROOT_PASSWORD=your_root_password
MYSQL_DATABASE=your_database_name
MYSQL_USER=your_database_user
MYSQL_PASSWORD=your_database_password
MYSQL_CHARSET=utf8mb4
MYSQL_COLLATION=utf8mb4_unicode_ci
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=your_admin_password
ADMIN_NAME=Administrator
CORS_ORIGINS=http://localhost:3000
```

2. Create a `docker-compose.yml`:
```yaml
services:
  frontend:
    image: gussttaav/g-commerce-frontend:latest
    ports:
      - "3000:80"
    depends_on:
      - app
    networks:
      - g-commerce-network

  app:
    image: gussttaav/g-commerce-backend:latest
    ports:
      - "8080:8080"
    env_file:
      - .env
    environment:
      SPRING_DATASOURCE_URL: jdbc:mysql://mysql:3306/${MYSQL_DATABASE}
    depends_on:
      mysql:
        condition: service_healthy
    networks:
      - g-commerce-network

  mysql:
    image: gussttaav/g-commerce-mysql:latest
    environment:
      MYSQL_ROOT_PASSWORD: ${MYSQL_ROOT_PASSWORD}
      MYSQL_DATABASE: ${MYSQL_DATABASE}
      MYSQL_USER: ${MYSQL_USER}
      MYSQL_PASSWORD: ${MYSQL_PASSWORD}
      MYSQL_CHARSET: ${MYSQL_CHARSET}
      MYSQL_COLLATION: ${MYSQL_COLLATION}
    ports:
      - "3306:3306"
    volumes:
      - mysql-data:/var/lib/mysql
    healthcheck:
      test: ["CMD", "mysqladmin", "ping", "-h", "localhost"]
      interval: 10s
      timeout: 5s
      retries: 5
    networks:
      - g-commerce-network

volumes:
  mysql-data:

networks:
  g-commerce-network:
    driver: bridge
```

3. Start the application:
```bash
docker compose up -d
```

The application will be available at `http://localhost:3000`

## 🔗 Related Images

- Backend API: `gussttaav/g-commerce-backend`
- Database: `gussttaav/g-commerce-mysql`

## 📦 Features

- Responsive design with Bootstrap 5.3
- User management and authentication
- Product catalog and shopping cart
- Admin dashboard
- Light/dark themes
- Real-time form validation

## 🛠️ Tech Stack

- HTML5
- CSS3
- JavaScript (ES6+)
- Bootstrap 5.3
- Bootstrap Icons
- Nginx (for serving static files)

## 🔒 Security

- JWT token authentication
- CSRF protection
- Client-side validation
- Secure token handling

## 📝 License

This project is licensed under the MIT License.