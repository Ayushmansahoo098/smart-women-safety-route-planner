# Smart Women Safety Route Planner

Production-ready full-stack authentication module with:
- React (Vite), Tailwind CSS, React Router DOM, Axios, Framer Motion
- Node.js (ESM), Express, MongoDB (Mongoose), JWT, bcrypt, dotenv

## Folder Structure

```text
smart-women-safety-route-planner/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── db.js
│   │   ├── controllers/
│   │   │   ├── authController.js
│   │   │   └── dashboardController.js
│   │   ├── middleware/
│   │   │   ├── authMiddleware.js
│   │   │   └── databaseMiddleware.js
│   │   ├── models/
│   │   │   └── User.js
│   │   ├── routes/
│   │   │   ├── authRoutes.js
│   │   │   └── protectedRoutes.js
│   │   ├── utils/
│   │   │   └── passwordValidation.js
│   │   ├── app.js
│   │   └── server.js
│   ├── .env.example
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   └── ProtectedRoute.jsx
│   │   ├── layouts/
│   │   │   └── AuthLayout.jsx
│   │   ├── pages/
│   │   │   ├── DashboardPage.jsx
│   │   │   ├── LoginPage.jsx
│   │   │   ├── NotFoundPage.jsx
│   │   │   └── RegisterPage.jsx
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── utils/
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
```

## Environment Variables

### Backend `.env`
Copy `backend/.env.example` to `backend/.env` and fill in your values:

```env
PORT=5001
MONGO_URI=mongodb://127.0.0.1:27017/women_safety_auth
JWT_SECRET=replace_with_a_strong_secret_at_least_32_chars
CLIENT_URL=http://localhost:5173
```

> **Note:** Port `5000` is reserved by macOS AirPlay Receiver on macOS Monterey+. Use `5001` instead, or disable AirPlay Receiver in **System Settings → General → AirDrop & Handoff**.

### Frontend `.env`
Copy `frontend/.env.example` to `frontend/.env`:

```env
VITE_API_URL=http://localhost:5001/api
```

## Installation

```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

## Run (Development)

Terminal 1 — Backend:
```bash
cd backend
npm run dev
```

Terminal 2 — Frontend:
```bash
cd frontend
npm run dev
```

Frontend: `http://localhost:5173`  
Backend API: `http://localhost:5001`  
Health check: `http://localhost:5001/api/health`

## Build Frontend

```bash
npm run build --prefix frontend
```

## Troubleshooting

| Symptom | Fix |
|---|---|
| `Cannot reach server...` | Backend is not running. Start it with `npm run dev` in `/backend`. |
| `Database is unavailable...` | MongoDB is not running. Start it or check your `MONGO_URI`. |
| `EADDRINUSE: port 5000` | macOS AirPlay Receiver holds port 5000. Use port `5001` (already set in `.env.example`). |
| CORS error in console | Make sure frontend and backend are both running. CORS allows all `localhost` origins automatically. |

## Authentication Features

- **Register**: Full Name, Email, Password, Confirm Password
  - Real-time password rule feedback
  - Confirm Password mismatch validation
  - Strong password enforcement (length, uppercase, lowercase, number, special char)
  - Duplicate email rejection
  - Password hashing with bcrypt (12 rounds)
- **Login**: Email + Password
  - JWT issued on success (1-hour expiration)
  - JWT stored in `localStorage`
  - "Remember me", "Forgot password?" UI
  - Google and Apple OAuth buttons (UI only)
- **Dashboard**: JWT-protected route on both frontend and backend
- **Animated UI**: Glassmorphism design with Framer Motion animations
