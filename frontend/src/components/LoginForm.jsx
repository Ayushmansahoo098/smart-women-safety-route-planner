import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../services/api";
import { clearAuthToken, setAuthToken } from "../utils/authStorage";
import { getApiErrorMessage } from "../utils/errorMessage";
import WaveText from "./WaveText";

/* ─── tiny SVG icons ─── */
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
function IconShield() {
    return (
        <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
            <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z" />
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
function AppleLogo() {
    return (
        <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4 text-white">
            <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
        </svg>
    );
}

export default function LoginForm({ onSwitchToSignup, successMessage }) {
    const navigate = useNavigate();
    const location = useLocation();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [rememberMe, setRememberMe] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const locationMessage = location.state?.message || successMessage || "";

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
        <div className="login-card">
            <div className="login-card-header">
                <h2 className="login-card-title auth-shiny-text">Welcome Back</h2>
                <p className="login-card-sub">Securely log in to your account</p>
            </div>

            <form className="login-form" onSubmit={handleSubmit} noValidate>
                {/* Email */}
                <div className="login-field">
                    <label className="login-label" htmlFor="login-email">
                        Email Address
                    </label>
                    <div className="login-input-wrap">
                        <span className="login-input-icon"><IconMail /></span>
                        <input
                            id="login-email"
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
                        <label className="login-label" htmlFor="login-password">
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
                            id="login-password"
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
                {locationMessage && (
                    <p className="login-alert login-alert-success">{locationMessage}</p>
                )}
                {error && (
                    <p className="login-alert login-alert-error">{error}</p>
                )}

                {/* Submit */}
                <button
                    id="login-submit-btn"
                    type="submit"
                    disabled={isSubmitting}
                    className="login-submit auth-btn-glow"
                >
                    <IconShield />
                    {isSubmitting ? <WaveText text="Signing in…" speed={0.05} /> : <WaveText text="Secure Login" speed={0.055} />}
                </button>

                {/* Divider */}
                <div className="login-divider">
                    <span className="login-divider-line" />
                    <span className="login-divider-text">Or continue with</span>
                    <span className="login-divider-line" />
                </div>

                {/* OAuth */}
                <div className="login-oauth">
                    <button
                        type="button"
                        id="google-login-btn"
                        className="login-oauth-btn auth-social-scale"
                        title="Coming soon"
                    >
                        <GoogleLogo />
                        <WaveText text="Google" speed={0.07} />
                    </button>
                    <button
                        type="button"
                        id="apple-login-btn"
                        className="login-oauth-btn auth-social-scale"
                        title="Coming soon"
                    >
                        <AppleLogo />
                        <WaveText text="Apple" speed={0.07} />
                    </button>
                </div>

                {/* Switch to signup */}
                <p className="login-signup-text">
                    Don&apos;t have an account?{" "}
                    <button
                        type="button"
                        className="login-signup-link"
                        onClick={onSwitchToSignup}
                    >
                        Sign up for free
                    </button>
                </p>
            </form>

            {/* SSL badge */}
            <div className="login-ssl" style={{ position: "relative", bottom: "auto", marginTop: "1rem" }}>
                <IconSSL />
                <span>256-BIT SSL SECURE CONNECTION</span>
            </div>
        </div>
    );
}
