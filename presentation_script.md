# MegaMart E-Commerce: File-by-File Code Explanation Script

Use this script during your technical presentation to explain exactly how the project is structured and what the most important files do.

---

## Part 1: The Backend (Django & DRF)

"Let's dive into the backend architecture. I used Django and the Django REST Framework to build a robust, secure API. First, I'd like to highlight the **Modular Project Structure**:"

### 0. The Modular Structure (`backend/apps/`)
"To keep the code clean and scalable, I didn't put everything in one place. Instead, I split the backend into several specialized apps:
*   **`users/`**: Handles the custom authentication and user profiles.
*   **`products/`**: Manages the catalog, categories, reviews, and wishlists.
*   **`cart/` & `orders/`**: Responsible for the shopping cart logic and the final checkout transaction processing.
*   **`contact/`**: Stores customer inquiries from the contact form.
This modular approach means that if we want to add a new feature, like 'Analytics', we can just create a new app without touching the existing core logic."

### 1. `backend/config/settings.py` & `urls.py`
"These are the central nervous system of the backend. In `settings.py`, I configured our database connection, enabled Cross-Origin Resource Sharing (CORS) so our React frontend can communicate with it, and set up JSON Web Token (JWT) authentication. `urls.py` acts as the traffic controller, routing all `/api/` requests to their specific application endpoints."

### 2. `backend/apps/users/models.py`
"Instead of using Django's default user system, I built a Custom User model by inheriting from `AbstractBaseUser`. This allowed me to remove the requirement for a 'username' and use an 'email' address as the primary login identifier, which is the standard for modern e-commerce apps."

### 3. `backend/apps/products/models.py`
"This file contains the database blueprints. I created classes for `Category`, `Product`, `Review`, and `Wishlist`. A great feature here is the use of Django `@property` decorators. For example, I wrote a property that automatically calculates the discount percentage by comparing the `price` and `old_price` fields dynamically, so we don't have to save redundant data in the database."

### 4. `backend/apps/products/serializers.py`
"Because the frontend needs JSON data, not Python objects, we use Serializers. In this file, I define exactly what data is sent to the frontend. For example, `ProductListSerializer` automatically grabs the associated Category name and calculates the average rating from all reviews before sending the final JSON payload to React."

### 5. `backend/apps/products/views.py`
"This is where the API logic lives. By using Django REST Framework's `GenericAPIView` classes, I was able to build complete CRUD (Create, Read, Update, Delete) endpoints with minimal code. I also integrated `DjangoFilterBackend` here to allow the frontend to easily filter products by category, price range, and stock availability."

---

## Part 2: The Frontend (React & Vite)

"Now, moving over to the frontend. I built this as a Single Page Application using React.js and Vite for blazing-fast performance. Here is the file-by-file breakdown:"

### 1. `frontend/src/App.jsx`
"This is the entry point of the React app. I set up `react-router-dom` here to handle page navigation without reloading the browser. You'll also notice the entire app is wrapped in an `<AuthProvider>`, which ensures the user's login state is accessible from any page."

### 2. `frontend/src/services/api.js`
"This is one of the most critical files. It centralizes all API calls using the `axios` library. More importantly, I implemented an **Axios Interceptor** here. Every time a request is made, this interceptor grabs the JWT token from Local Storage and attaches it to the headers. If the server says the token is expired, the interceptor automatically catches the error, calls the backend for a fresh token, and retries the request seamlessly. The user never notices."

### 3. `frontend/src/context/AuthContext.jsx`
"This file uses React's Context API to manage the global state of the user. It contains the core `login()`, `register()`, and `logout()` functions. When the app first loads, a `useEffect` hook triggers here to fetch the user's profile from the backend, allowing the frontend to know immediately if the user is an admin or a regular shopper."

### 4. `frontend/src/components/ProductCard/ProductCard.jsx`
"This UI component is responsible for rendering individual products. It utilizes `framer-motion` for smooth hover animations. Inside this file, I tied the 'Add to Cart' and 'Heart' buttons directly to the `api.js` service. When a user clicks 'Add to Cart', it triggers an API call and then dispatches a custom JavaScript event (`cartUpdated`) so the navigation bar knows to update its cart counter instantly."

### 5. `frontend/src/components/Navbar/Navbar.jsx`
"The navigation bar is highly dynamic. It listens to the `AuthContext` to conditionally render the 'Login' button or the 'User Dashboard' dropdown. For administrators, it conditionally renders a special link that routes directly to our Django backend Admin panel on port 8000."

### 6. `frontend/src/pages/Auth/Auth.jsx`
"Finally, the authentication page handles both Login and Registration. I added client-side validation here to ensure passwords match before even sending a request to the server, and I used `react-hot-toast` to provide beautiful pop-up notifications based on the success or failure messages returned by our Django API."
