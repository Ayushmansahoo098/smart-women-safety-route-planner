import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { getApiErrorMessage } from "../utils/errorMessage";
import {
    getPasswordValidationState,
    isStrongPassword,
} from "../utils/passwordRules";
import WaveText from "./WaveText";

const SHORT_RULES = [
    { key: "minLength", label: "8+ characters" },
    { key: "uppercase", label: "Uppercase letter" },
    { key: "lowercase", label: "Lowercase letter" },
    { key: "number", label: "One number" },
    { key: "special", label: "Special char" },
];

/* ── Shared micro-styles (inline for register, matching design) ── */
const labelStyle = {
    display: "block",
    marginBottom: "0.4rem",
    color: "#94a3b8",
    fontSize: "0.8rem",
    fontWeight: 500,
};
const inputWrapStyle = {
    display: "flex",
    alignItems: "center",
    background: "#1a1f2e",
    border: "1px solid #1e293b",
    borderRadius: 10,
    padding: "0 0.75rem",
    transition: "border-color 0.2s, box-shadow 0.2s",
};
const iconStyle = {
    display: "flex",
    alignItems: "center",
    marginRight: "0.5rem",
    flexShrink: 0,
};
const inputStyle = {
    flex: 1,
    background: "transparent",
    border: "none",
    outline: "none",
    color: "#e2e8f0",
    fontSize: "0.88rem",
    padding: "0.7rem 0",
    width: "100%",
};
const socialBtnStyle = {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "0.5rem",
    padding: "0.7rem",
    background: "transparent",
    border: "1px solid #1e293b",
    borderRadius: 10,
    color: "#cbd5e1",
    fontSize: "0.88rem",
    fontWeight: 500,
    cursor: "pointer",
    transition: "background 0.2s, transform 0.15s",
};

export default function SignupForm({ onSwitchToLogin }) {
    const navigate = useNavigate();

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const passwordState = useMemo(
        () => getPasswordValidationState(password),
        [password]
    );
    const doesPasswordMatch = confirmPassword === password;
    const showConfirmError = confirmPassword.length > 0 && !doesPasswordMatch;
    const isPasswordReady = isStrongPassword(password);

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
                password,
            });
            // Switch back to login with a success message
            onSwitchToLogin("Account created successfully. Sign in to continue.");
        } catch (err) {
            setError(
                getApiErrorMessage(err, "Unable to create account. Please try again.")
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div style={{ maxWidth: 500, width: "100%" }}>
            <h1
                className="auth-shiny-text"
                style={{
                    fontSize: "1.8rem",
                    fontWeight: 700,
                    margin: "0 0 0.3rem",
                }}
            >
                Create Account
            </h1>
            <p style={{ color: "#64748b", fontSize: "0.9rem", margin: "0 0 2rem" }}>
                Set up your account to access your dashboard.
            </p>

            <form onSubmit={handleSubmit}>
                {/* Name + Email row */}
                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        gap: "1rem",
                        marginBottom: "1rem",
                    }}
                >
                    <div>
                        <label style={labelStyle} htmlFor="signup-name">
                            Full Name
                        </label>
                        <div style={inputWrapStyle}>
                            <span style={iconStyle}>
                                <svg
                                    width="14"
                                    height="14"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="#64748b"
                                    strokeWidth="2"
                                >
                                    <circle cx="12" cy="8" r="4" />
                                    <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
                                </svg>
                            </span>
                            <input
                                id="signup-name"
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
                        <label style={labelStyle} htmlFor="signup-email">
                            Email Address
                        </label>
                        <div style={inputWrapStyle}>
                            <span style={iconStyle}>
                                <svg
                                    width="14"
                                    height="14"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="#64748b"
                                    strokeWidth="2"
                                >
                                    <rect x="2" y="4" width="20" height="16" rx="2" />
                                    <path d="m2 7 10 7 10-7" />
                                </svg>
                            </span>
                            <input
                                id="signup-email"
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
                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        gap: "1rem",
                        marginBottom: "1rem",
                    }}
                >
                    <div>
                        <label style={labelStyle} htmlFor="signup-password">
                            Password
                        </label>
                        <div style={inputWrapStyle}>
                            <span style={iconStyle}>
                                <svg
                                    width="14"
                                    height="14"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="#64748b"
                                    strokeWidth="2"
                                >
                                    <rect x="3" y="11" width="18" height="11" rx="2" />
                                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                                </svg>
                            </span>
                            <input
                                id="signup-password"
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
                        <label style={labelStyle} htmlFor="signup-confirm">
                            Confirm Password
                        </label>
                        <div
                            style={{
                                ...inputWrapStyle,
                                borderColor: showConfirmError ? "#f43f5e" : "#1e293b",
                            }}
                        >
                            <span style={iconStyle}>
                                <svg
                                    width="14"
                                    height="14"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="#64748b"
                                    strokeWidth="2"
                                >
                                    <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
                                    <path d="M12 8v4l3 3" />
                                </svg>
                            </span>
                            <input
                                id="signup-confirm"
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
                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        gap: "0.3rem 1rem",
                        marginBottom: "1.5rem",
                    }}
                >
                    {SHORT_RULES.map((rule) => {
                        const ok = passwordState[rule.key];
                        return (
                            <div
                                key={rule.key}
                                style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}
                            >
                                <svg
                                    width="12"
                                    height="12"
                                    viewBox="0 0 24 24"
                                    fill={ok ? "#22c55e" : "#334155"}
                                >
                                    <path
                                        d="M20 6L9 17l-5-5"
                                        stroke={ok ? "#22c55e" : "#475569"}
                                        strokeWidth="2.5"
                                        fill="none"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    />
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
                    <div
                        style={{
                            background: "rgba(244,63,94,0.1)",
                            border: "1px solid rgba(244,63,94,0.3)",
                            borderRadius: 10,
                            padding: "0.6rem 0.9rem",
                            color: "#fda4af",
                            fontSize: "0.82rem",
                            marginBottom: "1rem",
                        }}
                    >
                        {error}
                    </div>
                )}

                {/* Submit */}
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="auth-btn-glow"
                    style={{
                        width: "100%",
                        padding: "0.85rem",
                        background: isSubmitting
                            ? "#2563eb99"
                            : "linear-gradient(90deg, #2563eb, #3b82f6)",
                        border: "none",
                        borderRadius: 12,
                        color: "#fff",
                        fontWeight: 600,
                        fontSize: "0.95rem",
                        cursor: isSubmitting ? "not-allowed" : "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "0.5rem",
                        transition: "opacity 0.2s, filter 0.2s, transform 0.15s",
                        marginBottom: "1.2rem",
                        boxShadow: "0 4px 20px rgba(59,130,246,0.35)",
                    }}
                >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
                        <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" />
                    </svg>
                    {isSubmitting ? <WaveText text="Creating Account..." speed={0.04} /> : <WaveText text="Create Account" speed={0.05} />}
                </button>

                {/* Divider */}
                <div
                    style={{
                        textAlign: "center",
                        color: "#334155",
                        fontSize: "0.82rem",
                        marginBottom: "1rem",
                        position: "relative",
                    }}
                >
                    <span
                        style={{
                            background: "#0f1117",
                            padding: "0 0.75rem",
                            position: "relative",
                            zIndex: 1,
                        }}
                    >
                        Or register with
                    </span>
                    <div
                        style={{
                            position: "absolute",
                            top: "50%",
                            left: 0,
                            right: 0,
                            height: 1,
                            background: "#1e293b",
                            zIndex: 0,
                        }}
                    />
                </div>

                {/* Social buttons */}
                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        gap: "0.75rem",
                        marginBottom: "1.5rem",
                    }}
                >
                    <button type="button" className="auth-social-scale" style={socialBtnStyle}>
                        <svg width="16" height="16" viewBox="0 0 24 24">
                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                        </svg>
                        <WaveText text="Google" speed={0.07} />
                    </button>
                    <button type="button" className="auth-social-scale" style={socialBtnStyle}>
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="white">
                            <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
                        </svg>
                        <WaveText text="Apple" speed={0.07} />
                    </button>
                </div>

                {/* Sign in link */}
                <p style={{ textAlign: "center", color: "#64748b", fontSize: "0.85rem" }}>
                    Already have an account?{" "}
                    <button
                        type="button"
                        onClick={() => onSwitchToLogin()}
                        style={{
                            color: "#3b82f6",
                            fontWeight: 600,
                            textDecoration: "none",
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                            fontSize: "0.85rem",
                        }}
                    >
                        Sign In
                    </button>
                </p>
            </form>

            {/* SSL badge */}
            <div
                style={{
                    textAlign: "center",
                    color: "#334155",
                    fontSize: "0.7rem",
                    letterSpacing: "0.08em",
                    paddingTop: "1rem",
                }}
            >
                🔒 256-BIT SSL SECURE CONNECTION
            </div>
        </div>
    );
}
