# MegaMart: Premium Full-Stack E-Commerce Platform

MegaMart is a sophisticated, full-featured e-commerce platform built with a high-performance **React** frontend and a robust **Django REST Framework** backend. It features a modern, responsive design with smooth animations, secure authentication, and a customized administrative dashboard.

## 🚀 Key Features

- **Decoupled Architecture:** Clean separation between the React frontend and Django backend.
- **Dynamic Storefront:** Real-time product browsing, category filtering, and search.
- **Interactive Shopping:** Seamless "Add to Cart" and "Wishlist" functionality with instant UI updates.
- **Secure Authentication:** JWT-based login and registration with automatic token refreshing.
- **User Dashboard:** Manage orders, shipping addresses, and profile details.
- **Premium Admin Panel:** Customized **Django Jazzmin** dashboard for efficient store management.
- **Rich UI/UX:** Built with Framer Motion for premium animations and micro-interactions.

## 🛠️ Technology Stack

### Frontend
- **Framework:** React.js (Vite)
- **Styling:** Vanilla CSS (Custom Design System)
- **State Management:** React Context API
- **Animations:** Framer Motion
- **Icons:** Lucide React
- **API Client:** Axios (with Interceptors for JWT handling)

### Backend
- **Framework:** Django 5.x
- **API:** Django REST Framework (DRF)
- **Authentication:** SimpleJWT
- **Database:** SQLite (Development) / PostgreSQL (Production ready)
- **Admin Theme:** Jazzmin
- **Documentation:** DRF Spectacular (Swagger/OpenAPI)

## 📂 Project Structure

```text
MegaMart/
├── frontend/             # React.js application (Vite, Axios, Framer Motion)
└── backend/              # Django REST Framework application
    ├── config/           # Root configuration (Settings, URLs, WSGI/ASGI)
    ├── apps/             # Modular business logic
    │   ├── users/        # Custom User model & JWT Authentication
    │   ├── products/     # Catalog, Categories, Reviews, and Wishlist
    │   ├── cart/         # Shopping cart & persistence logic
    │   ├── orders/       # Checkout flow and order management
    │   └── contact/      # Customer inquiry storage
    ├── media/            # Uploaded images (Products/Categories)
    ├── manage.py         # Project management CLI
    └── requirements.txt  # Python dependencies
```

### Backend Folder Deep Dive

- **`config/`**: Contains `settings.py` for global configuration and `urls.py` which acts as the entry point for all API routes.
- **`apps/users/`**: Handles the custom authentication system. It replaces the default username login with email-based login and manages JWT token generation.
- **`apps/products/`**: The core catalog logic. It handles the database models for products, their categories, and the user review system.
- **`apps/cart/` & `apps/orders/`**: These apps manage the transition from browsing to buying. The cart handles item persistence, while the orders app handles the final checkout transaction.
- **`media/`**: A dynamically populated folder where Django stores the actual image files uploaded through the Admin Dashboard.


## ⚙️ Getting Started

### 1. Clone the repository
```bash
git clone https://github.com/Baraaammori/Django-E-commerce.git
cd Django-E-commerce
```

### 2. Backend Setup
```bash
cd backend
# Install dependencies
pip install -r requirements.txt
# Run migrations
python manage.py migrate
# Start the server
python manage.py runserver
```

### 3. Frontend Setup
```bash
cd frontend
# Install dependencies
npm install
# Start the development server
npm run dev
```

## 📝 Presentation & Code Explanation
For a detailed walk-through of the codebase and presentation scripts, refer to the generated `presentation_script.md` in the project root.

---
Built with ❤️ by [Baraa Ammori](https://github.com/Baraaammori)
