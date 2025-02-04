# G-commerce

A simple web application for an e-commerce system, built only with HTML, JavaScript, and Bootstrap. No frameworks were used. This project consumes the Spring Boot REST API available at [G-commerce backend](https://github.com/gussttaav/springboot-projects/tree/gestion-tienda).

## 🎯 Purpose

This project was developed for educational and learning purposes, serving as an example implementation of a frontend for a Spring Boot REST API. It is part of a series of implementations that will include versions using modern frameworks like Angular.

## ✨ Features

### User Management
- New user registration
- Login with basic authentication
- User profile management
- Password change
- Admin panel for user management (ADMIN role)

### Product Management
- Product catalog visualization
- Product search and filtering
- Admin panel for:
  - Creating new products
  - Updating existing products
  - Deleting products
  - Managing product status (active/inactive)

### Shopping Cart
- Add/remove products
- Update quantities
- Cart persistence during session
- Automatic total calculations

### Purchase System
- Checkout process
- Purchase history
- Purchase details

### User Interface
- Responsive design
- Light/dark themes
- Status notifications and messages
- Real-time form validation

## 🛠️ Technologies

- HTML5
- CSS3
- JavaScript (ES6+)
- Bootstrap 5.3
- Bootstrap Icons
- Fetch API
- LocalStorage API

## 📋 Prerequisites

- Modern web browser
- [Spring Boot Backend](https://github.com/gussttaav/springboot-projects/tree/gestion-tienda) running
- Node.js and npm (optional, for development)

## 🚀 Installation

1. Clone the repository:
```bash
git clone https://github.com/your-username/e-commerce-frontend.git
cd e-commerce-frontend
```

2. Configure the API URL:
```javascript
// js/config.js
const API_URL = 'http://localhost:8080/api';
```

3. Serve the static files:
```bash
# Using Python
python -m http.server 3000

# Or using Node.js
npx http-server -p 3000
```

4. Access the application at `http://localhost:3000`

## 📁 Project Structure

```
e-commerce-frontend/
├── index.html
├── dashboard.html
├── css/
│   ├── styles.css
│   └── dashboard.css
├── js/
│   ├── auth.js
│   ├── dashboard.js
│   └── services/
│       ├── auth.service.js
│       ├── product.service.js
│       ├── purchase.service.js
│       └── user.service.js
└── README.md
```

## 🔒 Security

- JWT token authentication
- CSRF protection
- Client-side data validation
- Secure token handling
- User roles (ADMIN/USER)

## 🔄 Backend Integration

This application integrates with a REST API developed in Spring Boot. For more details about the backend, check:
- [Backend Repository](https://github.com/gussttaav/springboot-projects/tree/gestion-tienda)
- [API Documentation](http://localhost:8080/swagger-ui.html)

## 🎯 Future Versions

Additional implementations are planned using:
- Angular
- React
- Vue.js

Each implementation will maintain the same base functionality while leveraging the specific features of each framework.

## 👥 Contributing

Contributions are welcome. Please:
1. Fork the project
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

This project is under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.

## 🔗 Useful Links

- [Live Demo](https://your-demo-url.com)
- [Spring Boot Backend](https://github.com/gussttaav/springboot-projects/tree/gestion-tienda)
- [API Documentation](http://localhost:8080/swagger-ui.html)
