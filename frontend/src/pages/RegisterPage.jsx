import { useMemo, useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import api from "../services/api";
import { getAuthToken } from "../utils/authStorage";
import { getApiErrorMessage } from "../utils/errorMessage";
import {
  getPasswordValidationState,
  isStrongPassword
} from "../utils/passwordRules";
import { isTokenValid } from "../utils/token";

const SHORT_RULES = [
  { key: "minLength", label: "8+ characters" },
  { key: "uppercase", label: "Uppercase letter" },
  { key: "lowercase", label: "Lowercase letter" },
  { key: "number", label: "One number" },
  { key: "special", label: "Special char" },
];

export default function RegisterPage() {
  const navigate = useNavigate();
  const token = getAuthToken();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const passwordState = useMemo(() => getPasswordValidationState(password), [password]);
  const doesPasswordMatch = confirmPassword === password;
  const showConfirmError = confirmPassword.length > 0 && !doesPasswordMatch;
  const isPasswordReady = isStrongPassword(password);

  if (token && isTokenValid(token)) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!isPasswordReady) {
      setError("Password does not meet all required rules.");
      return;
    }
    if (!doesPasswordMatch) {
      setError("Confirm Password must match Password.");
      return;
    }

    try {
      setIsSubmitting(true);
      await api.post("/auth/register", {
        name: name.trim(),
        email: email.trim(),
        password
      });
      navigate("/login", {
        replace: true,
        state: { message: "Account created successfully. Sign in to continue." }
      });
    } catch (err) {
      setError(getApiErrorMessage(err, "Unable to create account. Please try again."));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", fontFamily: "'Inter', sans-serif" }}>

      {/* ── Left panel ── */}
      <div style={{
        width: "40%",
        minWidth: 340,
        position: "relative",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "2rem",
        overflow: "hidden",
        background: "linear-gradient(160deg, #1a1040 0%, #0d0d1a 60%, #0d1a2e 100%)"
      }}>
        {/* City background image */}
        <div style={{
          position: "absolute", inset: 0,
          backgroundImage: "url('/city-night-bg.png')",
          backgroundSize: "cover", backgroundPosition: "center bottom",
          opacity: 0.35
        }} />

        {/* Purple glow blob */}
        <div style={{
          position: "absolute", top: "18%", left: "10%",
          width: 220, height: 220,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(139,92,246,0.45) 0%, transparent 70%)",
          filter: "blur(40px)", pointerEvents: "none"
        }} />

        {/* Logo */}
        <div style={{ position: "relative", zIndex: 1, display: "flex", alignItems: "center", gap: "0.6rem" }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: "linear-gradient(135deg, #3b82f6, #6366f1)",
            display: "flex", alignItems: "center", justifyContent: "center"
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
              <path d="M12 2L4 6v6c0 5.25 3.5 10.15 8 11.35C16.5 22.15 20 17.25 20 12V6l-8-4z" />
            </svg>
          </div>
          <span style={{ color: "#fff", fontWeight: 700, fontSize: "1.05rem", letterSpacing: "-0.01em" }}>
            SafeRoute Pro
          </span>
        </div>

        {/* Headline */}
        <div style={{ position: "relative", zIndex: 1 }}>
          <h2 style={{ fontSize: "2.4rem", fontWeight: 800, color: "#fff", lineHeight: 1.15, margin: "0 0 0.6rem" }}>
            Your journey,<br />
            <span style={{ color: "#3b82f6" }}>secured.</span>
          </h2>
          <p style={{ color: "#94a3b8", fontSize: "0.95rem", lineHeight: 1.6, maxWidth: 300 }}>
            Join a global community of women dedicated to making every street safer for everyone.
          </p>

          <ul style={{ listStyle: "none", padding: 0, margin: "1.8rem 0 0", display: "flex", flexDirection: "column", gap: "0.9rem" }}>
            {[
              { icon: "✓", label: "Verified safety reports" },
              { icon: "📋", label: "Real-time route planning" },
              { icon: "👥", label: "24/7 Community support" },
            ].map((item) => (
              <li key={item.label} style={{ display: "flex", alignItems: "center", gap: "0.75rem", color: "#cbd5e1", fontSize: "0.9rem" }}>
                <span style={{
                  width: 28, height: 28, borderRadius: 8,
                  background: "rgba(59,130,246,0.2)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "0.75rem", flexShrink: 0
                }}>{item.icon}</span>
                {item.label}
              </li>
            ))}
          </ul>
        </div>

        {/* Footer */}
        <div style={{ position: "relative", zIndex: 1, color: "#475569", fontSize: "0.75rem" }}>
          © {new Date().getFullYear()} SafeRoute Pro. Protected by industry-grade encryption.
        </div>
      </div>

      {/* ── Right panel ── */}
      <div style={{
        flex: 1,
        background: "#0f1117",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "2.5rem 3.5rem",
        overflowY: "auto"
      }}>
        <div style={{ maxWidth: 500, width: "100%", margin: "auto" }}>

          <h1 style={{ fontSize: "1.8rem", fontWeight: 700, color: "#fff", margin: "0 0 0.3rem" }}>
            Create Account
          </h1>
          <p style={{ color: "#64748b", fontSize: "0.9rem", margin: "0 0 2rem" }}>
            Set up your account to access your dashboard.
          </p>

          <form onSubmit={handleSubmit}>

            {/* Name + Email row */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
              <div>
                <label style={labelStyle} htmlFor="reg-name">Full Name</label>
                <div style={inputWrapStyle}>
                  <span style={iconStyle}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2"><circle cx="12" cy="8" r="4" /><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" /></svg>
                  </span>
                  <input
                    id="reg-name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Jane Doe"
                    autoComplete="name"
                    required
                    style={inputStyle}
                  />
                </div>
              </div>

              <div>
                <label style={labelStyle} htmlFor="reg-email">Email Address</label>
                <div style={inputWrapStyle}>
                  <span style={iconStyle}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2"><rect x="2" y="4" width="20" height="16" rx="2" /><path d="m2 7 10 7 10-7" /></svg>
                  </span>
                  <input
                    id="reg-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="jane@example.com"
                    autoComplete="email"
                    required
                    style={inputStyle}
                  />
                </div>
              </div>
            </div>

            {/* Password + Confirm row */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
              <div>
                <label style={labelStyle} htmlFor="reg-password">Password</label>
                <div style={inputWrapStyle}>
                  <span style={iconStyle}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
                  </span>
                  <input
                    id="reg-password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    autoComplete="new-password"
                    required
                    style={inputStyle}
                  />
                </div>
              </div>

              <div>
                <label style={labelStyle} htmlFor="reg-confirm">Confirm Password</label>
                <div style={{ ...inputWrapStyle, borderColor: showConfirmError ? "#f43f5e" : "#1e293b" }}>
                  <span style={iconStyle}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
                  </span>
                  <input
                    id="reg-confirm"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    autoComplete="new-password"
                    required
                    style={inputStyle}
                  />
                </div>
              </div>
            </div>

            {/* Password rules grid */}
            <div style={{
              display: "grid", gridTemplateColumns: "1fr 1fr",
              gap: "0.3rem 1rem", marginBottom: "1.5rem"
            }}>
              {SHORT_RULES.map((rule) => {
                const ok = passwordState[rule.key];
                return (
                  <div key={rule.key} style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill={ok ? "#22c55e" : "#334155"}>
                      <path d="M20 6L9 17l-5-5" stroke={ok ? "#22c55e" : "#475569"} strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <span style={{ fontSize: "0.75rem", color: ok ? "#22c55e" : "#64748b" }}>
                      {rule.label}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Error */}
            {error && (
              <div style={{
                background: "rgba(244,63,94,0.1)", border: "1px solid rgba(244,63,94,0.3)",
                borderRadius: 10, padding: "0.6rem 0.9rem",
                color: "#fda4af", fontSize: "0.82rem", marginBottom: "1rem"
              }}>
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                width: "100%", padding: "0.85rem",
                background: isSubmitting ? "#2563eb99" : "linear-gradient(90deg, #2563eb, #3b82f6)",
                border: "none", borderRadius: 12,
                color: "#fff", fontWeight: 600, fontSize: "0.95rem",
                cursor: isSubmitting ? "not-allowed" : "pointer",
                display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem",
                transition: "opacity 0.2s", marginBottom: "1.2rem",
                boxShadow: "0 4px 20px rgba(59,130,246,0.35)"
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
                <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" />
              </svg>
              {isSubmitting ? "Creating Account..." : "Create Account"}
            </button>

            {/* Divider */}
            <div style={{ textAlign: "center", color: "#334155", fontSize: "0.82rem", marginBottom: "1rem", position: "relative" }}>
              <span style={{ background: "#0f1117", padding: "0 0.75rem", position: "relative", zIndex: 1 }}>
                Or continue with
              </span>
              <div style={{ position: "absolute", top: "50%", left: 0, right: 0, height: 1, background: "#1e293b", zIndex: 0 }} />
            </div>

            {/* Google Sign-up Button */}
            <button
              type="button"
              style={{ ...socialBtnStyle, width: "100%", marginBottom: "1.5rem", padding: "0.75rem", borderRadius: 12, justifyContent: "center", gap: "0.6rem" }}
              onClick={() => { window.location.href = `${import.meta.env.VITE_BACKEND_URL || "http://localhost:5001"}/api/auth/google`; }}
              aria-label="Continue with Google"
            >
              <svg width="18" height="18" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              Continue with Google
            </button>

            {/* Sign in link */}
            <p style={{ textAlign: "center", color: "#64748b", fontSize: "0.85rem" }}>
              Already have an account?{" "}
              <Link to="/login" style={{ color: "#3b82f6", fontWeight: 600, textDecoration: "none" }}>
                Sign In
              </Link>
            </p>
          </form>
        </div>

        {/* Bottom SSL badge */}
        <div style={{ textAlign: "center", color: "#334155", fontSize: "0.7rem", letterSpacing: "0.08em", paddingTop: "1rem" }}>
          🔒 256-BIT SSL SECURE CONNECTION
        </div>
      </div>
    </div>
  );
}

/* ── Shared micro-styles ── */
const labelStyle = {
  display: "block", marginBottom: "0.4rem",
  color: "#94a3b8", fontSize: "0.8rem", fontWeight: 500
};

const inputWrapStyle = {
  display: "flex", alignItems: "center",
  background: "#1a1f2e", border: "1px solid #1e293b",
  borderRadius: 10, padding: "0 0.75rem",
  transition: "border-color 0.2s"
};

const iconStyle = {
  display: "flex", alignItems: "center",
  marginRight: "0.5rem", flexShrink: 0
};

const inputStyle = {
  flex: 1, background: "transparent", border: "none", outline: "none",
  color: "#e2e8f0", fontSize: "0.88rem",
  padding: "0.7rem 0", width: "100%"
};

const socialBtnStyle = {
  display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem",
  padding: "0.7rem", background: "transparent",
  border: "1px solid #1e293b", borderRadius: 10,
  color: "#cbd5e1", fontSize: "0.88rem", fontWeight: 500,
  cursor: "pointer", transition: "background 0.2s"
};
