# 🛡️ SafeRoute

> A production-ready full-stack authentication system with secure JWT-based middleware, real-time password validation, and a modern glassmorphic UI.

[![Node.js](https://img.shields.io/badge/Node.js-20+-green?logo=node.js)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18+-blue?logo=react)](https://react.dev/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Latest-green?logo=mongodb)](https://www.mongodb.com/)
[![MIT License](https://img.shields.io/badge/License-MIT-yellow)](LICENSE)

## 🚀 Tech Stack

**Frontend:**
- React 18+ with Vite
- Tailwind CSS for styling
- React Router DOM for navigation
- Framer Motion for animations
- Axios for API requests

**Backend:**
- Node.js with ES Modules
- Express.js framework
- MongoDB + Mongoose ODM
- JWT authentication
- bcrypt for password hashing

## 📁 Project Structure

```text
smart-women-safety-route-planner/
├── backend/                    # Node.js + Express API server
│   ├── src/
│   │   ├── config/            # Database & Passport configuration
│   │   │   └── db.js
│   │   ├── controllers/        # Request handlers
│   │   │   ├── authController.js
│   │   │   └── dashboardController.js
│   │   ├── middleware/         # Authentication & database middleware
│   │   │   ├── authMiddleware.js
│   │   │   └── databaseMiddleware.js
│   │   ├── models/             # Mongoose schemas
│   │   │   └── User.js
│   │   ├── routes/             # API route definitions
│   │   │   ├── authRoutes.js
│   │   │   └── protectedRoutes.js
│   │   ├── utils/              # Helper utilities
│   │   │   └── passwordValidation.js
│   │   ├── app.js              # Express app setup
│   │   └── server.js           # Server entry point
│   ├── .env.example
│   └── package.json
├── frontend/                   # React + Vite frontend app
│   ├── src/
│   │   ├── components/         # Reusable UI components
│   │   │   └── ProtectedRoute.jsx
│   │   ├── layouts/            # Page layouts
│   │   │   └── AuthLayout.jsx
│   │   ├── pages/              # Page components
│   │   │   ├── DashboardPage.jsx
│   │   │   ├── LoginPage.jsx
│   │   │   ├── NotFoundPage.jsx
│   │   │   └── RegisterPage.jsx
│   │   ├── services/           # API service layer
│   │   │   └── api.js
│   │   ├── utils/              # Helper utilities
│   │   │   ├── passwordRules.js
│   │   │   └── token.js
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   ├── .env.example
│   ├── index.html
│   ├── postcss.config.js
│   ├── tailwind.config.js
│   ├── vite.config.js
│   └── package.json
└── package.json

## ⚙️ Configuration

### Backend Configuration
Copy `backend/.env.example` to `backend/.env` and configure:

```env
PORT=5001
MONGO_URI=mongodb://127.0.0.1:27017/women_safety_auth
JWT_SECRET=replace_with_a_strong_secret_at_least_32_chars
CLIENT_URL=http://localhost:5173
```

> **⚠️ macOS Note:** Port `5000` is reserved by AirPlay Receiver on macOS Monterey+. Use `5001` instead, or disable AirPlay in **System Settings → General → AirDrop & Handoff**.

### Frontend Configuration
Copy `frontend/.env.example` to `frontend/.env`:

```env
VITE_API_URL=http://localhost:5001/api
```

## 📦 Installation

### Prerequisites
- Node.js 18+ and npm
- MongoDB running locally or a connection URI

### Steps

```bash
# 1. Clone the repository
git clone <repository-url>
cd smart-women-safety-route-planner

# 2. Install backend dependencies
cd backend
npm install

# 3. Install frontend dependencies
cd ../frontend
npm install

# 4. Create .env files
# Copy .env.example files to .env in both frontend/
# and backend/ directories
```

## 🏃 Running the Application

### Development Mode

Open **two terminal windows**:

**Terminal 1 — Backend API:**
```bash
cd backend
npm run dev
# Backend runs on http://localhost:5001
# Health check: http://localhost:5001/api/health
```

**Terminal 2 — Frontend App:**
```bash
cd frontend
npm run dev
# Frontend available at http://localhost:5173
```

The application will open automatically. The frontend connects to the backend API at `http://localhost:5001`.

### Production Build

```bash
npm run build --prefix frontend
```

## 🔧 Troubleshooting

| Issue | Solution |
|-------|----------|
| ❌ `Cannot reach server...` | Start the backend: `cd backend && npm run dev` |
| ❌ `Database is unavailable...` | Start MongoDB or check `MONGO_URI` in `.env` |
| ❌ `EADDRINUSE: port 5000` | macOS AirPlay blocking port 5000. Use port `5001` (default in `.env.example`), or disable AirPlay in System Settings. |
| ❌ CORS error in console | Ensure both frontend and backend are running. CORS automatically allows `localhost` origins. |
| ❌ JWT token not working | Clear browser cache/localStorage and login again. Ensure `JWT_SECRET` matches between backend restarts. |

## 📚 API Endpoints

### Authentication Endpoints
- `POST /api/auth/register` — Create a new user account
- `POST /api/auth/login` — Login and receive JWT token
- `POST /api/auth/logout` — Logout and clear session

### Protected Endpoints
- `GET /api/health` — Health check endpoint
- `GET /api/dashboard` — Access protected dashboard (requires JWT)

## 🌟 Key Features at a Glance

- ✅ Full-stack authentication with JWT
- ✅ Secure password hashing (bcrypt)
- ✅ Modern, responsive UI with Tailwind CSS
- ✅ Real-time form validation
- ✅ Production-ready code structure
- ✅ MongoDB persistence
- ✅ CORS-enabled
- ✅ Environment-based configuration

## 📝 License

This project is licensed under the MIT License. See [LICENSE](LICENSE) for details.

## 💡 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

**Built with ❤️ for women safety**

## ✨ Authentication Features

### Registration
- Full Name, Email, Password, Confirm Password fields
- **Real-time password validation** with visual feedback
- Password requirements:
  - Minimum 8 characters
  - Uppercase and lowercase letters
  - At least one number
  - At least one special character
- Confirm Password mismatch detection
- Duplicate email prevention
- Password hashing with bcrypt (12 rounds)

### Login
- Email + Password authentication
- JWT token generation (1-hour expiration)
- Token stored securely in `localStorage`
- "Remember me" UI support
- "Forgot password?" UI (foundation ready)
- OAuth buttons for Google and Apple (UI-ready)

### Security & Protected Routes
- JWT-based authentication on backend
- Protected routes require valid token
- Automatic route protection on frontend
- CORS configured for `localhost` development

### User Experience
- Glassmorphism design with modern aesthetics
- Smooth animations powered by Framer Motion
- Real-time form validation feedback
- Responsive design for all screen sizes
