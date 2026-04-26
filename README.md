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
├── frontend/             # React.js application
│   ├── src/              # Source code
│   └── public/           # Static assets
├── backend/              # Django REST Framework application
│   ├── apps/             # Modular Django apps (users, products, cart, etc.)
│   ├── config/           # Project configuration
│   └── media/            # Uploaded product images
└── venv/                 # Python virtual environment
```

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
