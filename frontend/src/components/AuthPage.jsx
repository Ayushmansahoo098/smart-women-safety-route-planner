import { useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { getAuthToken } from "../utils/authStorage";
import { isTokenValid } from "../utils/token";
import AuthCard from "./AuthCard";
import HeroSection from "./HeroSection";

export default function AuthPage({ initialMode = "login" }) {
    const location = useLocation();
    const token = getAuthToken();
    const isAlreadyAuthed = Boolean(token && isTokenValid(token));

    // All hooks must run unconditionally — before any early return
    const [mode, setMode] = useState(
        location.pathname === "/register" ? "signup" : initialMode
    );
    const [successMessage, setSuccessMessage] = useState("");

    // Early return AFTER all hooks
    if (isAlreadyAuthed) {
        return <Navigate to="/dashboard" replace />;
    }

    const handleSwitchToSignup = () => {
        setSuccessMessage("");
        setMode("signup");
    };

    const handleSwitchToLogin = (message = "") => {
        setSuccessMessage(message);
        setMode("login");
    };

    return (
        <div className="login-root">
            <HeroSection mode={mode} />
            <AuthCard
                mode={mode}
                onSwitchToSignup={handleSwitchToSignup}
                onSwitchToLogin={handleSwitchToLogin}
                successMessage={successMessage}
            />
        </div>
    );
}

