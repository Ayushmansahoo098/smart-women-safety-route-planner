import { AnimatePresence, motion } from "framer-motion";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import AuthPage from "./components/AuthPage";
import ProtectedRoute from "./components/ProtectedRoute";
import DashboardPage from "./pages/DashboardPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import NotFoundPage from "./pages/NotFoundPage";
import OAuthCallbackPage from "./pages/OAuthCallbackPage";

function PageTransition({ children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -14 }}
      transition={{ duration: 0.28, ease: "easeInOut" }}
      className="min-h-screen"
    >
      {children}
    </motion.div>
  );
}

export default function App() {
  const location = useLocation();

  // For auth routes (/login, /register) we only key by the "auth" group
  // so AnimatePresence does NOT trigger a full page transition between them.
  const routeKey =
    location.pathname === "/login" || location.pathname === "/register"
      ? "auth"
      : location.pathname;

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={routeKey}>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route
          path="/login"
          element={
            <PageTransition>
              <AuthPage initialMode="login" />
            </PageTransition>
          }
        />
        <Route
          path="/register"
          element={
            <PageTransition>
              <AuthPage initialMode="signup" />
            </PageTransition>
          }
        />
        <Route
          path="/forgot-password"
          element={
            <PageTransition>
              <ForgotPasswordPage />
            </PageTransition>
          }
        />
        {/* OAuth callback — no animation, immediately redirects */}
        <Route path="/oauth-callback" element={<OAuthCallbackPage />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <PageTransition>
                <DashboardPage />
              </PageTransition>
            </ProtectedRoute>
          }
        />
        <Route
          path="*"
          element={
            <PageTransition>
              <NotFoundPage />
            </PageTransition>
          }
        />
      </Routes>
    </AnimatePresence>
  );
}
