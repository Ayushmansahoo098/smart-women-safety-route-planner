import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { setAuthToken } from "../utils/authStorage";

/**
 * /oauth-callback
 *
 * The backend redirects here after a successful Google OAuth flow
 * with the JWT as a URL query-param:
 *   /oauth-callback?token=<jwt>
 *
 * This page stores the token and navigates to the dashboard.
 * If no token is present, it redirects back to /login with an error.
 */
export default function OAuthCallbackPage() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    useEffect(() => {
        const token = searchParams.get("token");

        if (token) {
            // Store in sessionStorage by default (no "remember me" from social login)
            setAuthToken(token, false);
            navigate("/dashboard", { replace: true });
        } else {
            navigate("/login?error=oauth_failed", { replace: true });
        }
    }, [navigate, searchParams]);

    return (
        <div
            style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                height: "100vh",
                background: "var(--color-bg, #0f0f11)",
                color: "var(--color-text, #e2e8f0)",
                flexDirection: "column",
                gap: "1rem",
                fontFamily: "Inter, system-ui, sans-serif"
            }}
        >
            {/* Simple pulsing spinner */}
            <div
                style={{
                    width: 48,
                    height: 48,
                    border: "3px solid rgba(255,255,255,0.15)",
                    borderTopColor: "#8b5cf6",
                    borderRadius: "50%",
                    animation: "spin 0.8s linear infinite"
                }}
            />
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            <p style={{ opacity: 0.7, fontSize: "0.95rem" }}>Completing sign-in…</p>
        </div>
    );
}
