import { useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import api from "../services/api";
import { clearAuthToken, getAuthToken, setAuthToken } from "../utils/authStorage";
import { getApiErrorMessage } from "../utils/errorMessage";
import { isTokenValid } from "../utils/token";

/* ─── tiny SVG icons ───────────────────────────────────────────────── */
function IconShield() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
      <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z" />
    </svg>
  );
}
function IconMail() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4 text-slate-400">
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <polyline points="2,6 12,13 22,6" />
    </svg>
  );
}
function IconLock() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4 text-slate-400">
      <rect x="5" y="11" width="14" height="10" rx="2" />
      <path d="M8 11V7a4 4 0 0 1 8 0v4" />
    </svg>
  );
}
function IconEye({ open }) {
  return open ? (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ) : (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );
}
function IconSSL() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-3 w-3">
      <rect x="5" y="11" width="14" height="10" rx="2" />
      <path d="M8 11V7a4 4 0 0 1 8 0v4" />
    </svg>
  );
}

/* ─── Google colour logo ────────────────────────────────────────────── */
function GoogleLogo() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" xmlns="http://www.w3.org/2000/svg">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  );
}


/* ─── Safe Zone pill ────────────────────────────────────────────────── */
function SafeZonePill({ visible }) {
  return (
    <div
      className={`absolute bottom-10 left-8 flex items-center gap-3 rounded-2xl border border-white/10 bg-white/10 px-4 py-3 shadow-xl backdrop-blur-md transition-all duration-1000 ${visible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
        }`}
    >
      <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-blue-500 text-white shadow-lg">
        <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
        </svg>
      </span>
      <div>
        <p className="text-sm font-semibold text-white">Safe Zone Detected</p>
        <p className="text-xs text-slate-300/80">"High visibility &amp; active community reports"</p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const token = getAuthToken();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pillVisible, setPillVisible] = useState(true);

  if (token && isTokenValid(token)) {
    return <Navigate to="/dashboard" replace />;
  }

  const successMessage = location.state?.message || "";

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (!email.trim() || !password.trim()) {
      setError("Please enter email and password.");
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await api.post("/auth/login", {
        email: email.trim(),
        password,
      });
      setAuthToken(response.data.token, rememberMe);
      navigate("/dashboard", { replace: true });
    } catch (requestError) {
      clearAuthToken();
      const message = getApiErrorMessage(
        requestError,
        "Unable to login. Please check your credentials."
      );
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="login-root">
      {/* ── Left panel ──────────────────────────────────────── */}
      <div className="login-left">
        {/* Overlay gradients */}
        <div className="login-left-overlay" />
        <div className="login-left-overlay2" />

        {/* Logo */}
        <div className="login-logo">
          <span className="login-logo-icon">
            <IconShield />
          </span>
          <span className="login-logo-text">SafeRoute Pro</span>
        </div>

        {/* Hero copy */}
        <div className="login-hero">
          <h1 className="login-hero-title">
            Walk with{" "}
            <span className="login-hero-highlight">confidence</span>,<br />
            anywhere.
          </h1>
          <p className="login-hero-sub">
            Join our community of over 2 million women navigating cities safely
            with real-time, verified route planning.
          </p>
        </div>

        {/* Safe zone pill */}
        <SafeZonePill visible={pillVisible} />

        {/* Footer */}
        <p className="login-left-footer">
          © {new Date().getFullYear()} SafeRoute Pro. All rights reserved. Your privacy is our priority.
        </p>
      </div>

      {/* ── Right panel ─────────────────────────────────────── */}
      <div className="login-right">
        <div className="login-card">
          <div className="login-card-header">
            <h2 className="login-card-title">Welcome Back</h2>
            <p className="login-card-sub">Securely log in to your account</p>
          </div>

          <form className="login-form" onSubmit={handleSubmit} noValidate>
            {/* Email */}
            <div className="login-field">
              <label className="login-label" htmlFor="email">
                Email Address
              </label>
              <div className="login-input-wrap">
                <span className="login-input-icon"><IconMail /></span>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="login-input"
                  placeholder="name@example.com"
                  autoComplete="email"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div className="login-field">
              <div className="login-label-row">
                <label className="login-label" htmlFor="password">
                  Password
                </label>
                <button
                  type="button"
                  className="login-forgot"
                  onClick={() => navigate("/forgot-password")}
                >
                  Forgot Password?
                </button>
              </div>
              <div className="login-input-wrap">
                <span className="login-input-icon"><IconLock /></span>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="login-input login-input-pw"
                  placeholder="••••••••"
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  className="login-eye"
                  onClick={() => setShowPassword((p) => !p)}
                  aria-label="Toggle password visibility"
                >
                  <IconEye open={showPassword} />
                </button>
              </div>
            </div>

            {/* Alerts */}
            {successMessage && (
              <p className="login-alert login-alert-success">{successMessage}</p>
            )}
            {error && (
              <p className="login-alert login-alert-error">{error}</p>
            )}

            {/* Submit */}
            <button
              id="login-submit-btn"
              type="submit"
              disabled={isSubmitting}
              className="login-submit"
            >
              <IconShield />
              {isSubmitting ? "Signing in…" : "Secure Login"}
            </button>

            {/* Divider */}
            <div className="login-divider">
              <span className="login-divider-line" />
              <span className="login-divider-text">Or continue with</span>
              <span className="login-divider-line" />
            </div>

            {/* OAuth */}
            <div className="login-oauth" style={{ display: "flex" }}>
              <button
                type="button"
                id="google-login-btn"
                className="login-oauth-btn"
                style={{ flex: 1 }}
                onClick={() => { window.location.href = `${import.meta.env.VITE_BACKEND_URL || "http://localhost:5001"}/api/auth/google`; }}
                aria-label="Continue with Google"
              >
                <GoogleLogo />
                Continue with Google
              </button>
            </div>

            {/* Sign-up link */}
            <p className="login-signup-text">
              Don't have an account?{" "}
              <Link to="/register" className="login-signup-link">
                Sign up for free
              </Link>
            </p>
          </form>
        </div>

        {/* SSL badge */}
        <div className="login-ssl">
          <IconSSL />
          <span>256-BIT SSL SECURE CONNECTION</span>
        </div>
      </div>
    </div>
  );
}
