import { useMemo, useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import AuthLayout from "../layouts/AuthLayout";
import api from "../services/api";
import { getAuthToken } from "../utils/authStorage";
import { getApiErrorMessage } from "../utils/errorMessage";
import {
  getPasswordValidationState,
  isStrongPassword,
  PASSWORD_RULES
} from "../utils/passwordRules";
import { isTokenValid } from "../utils/token";

const inputClassName =
  "w-full rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-400 focus:border-amber-300 focus:ring-2 focus:ring-amber-400/30";

export default function RegisterPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const token = getAuthToken();

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

  if (token && isTokenValid(token)) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleSubmit = async (event) => {
    event.preventDefault();
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
        state: {
          message: "Account created successfully. Sign in to continue.",
          lampOn: true
        }
      });
    } catch (requestError) {
      const message = getApiErrorMessage(
        requestError,
        "Unable to create account. Please try again."
      );
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout
      title="Create Account"
      subtitle="Set up your account to access your dashboard."
      initialLampOn={location.state?.lampOn ?? true}
    >
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div>
          <label className="mb-1.5 block text-sm text-slate-300" htmlFor="name">
            Full Name
          </label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
            className={inputClassName}
            placeholder="Your full name"
            autoComplete="name"
            required
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm text-slate-300" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className={inputClassName}
            placeholder="you@example.com"
            autoComplete="email"
            required
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm text-slate-300" htmlFor="password">
            Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className={inputClassName}
            placeholder="Create a strong password"
            autoComplete="new-password"
            required
          />
          <div className="mt-2 space-y-1 rounded-lg border border-white/10 bg-black/20 p-3">
            {PASSWORD_RULES.map((rule) => {
              const isValid = passwordState[rule.key];
              return (
                <p
                  key={rule.key}
                  className={`text-xs ${
                    isValid ? "text-emerald-300" : "text-slate-300"
                  }`}
                >
                  {isValid ? "✓" : "•"} {rule.label}
                </p>
              );
            })}
          </div>
        </div>

        <div>
          <label
            className="mb-1.5 block text-sm text-slate-300"
            htmlFor="confirmPassword"
          >
            Confirm Password
          </label>
          <input
            id="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            className={inputClassName}
            placeholder="Re-enter your password"
            autoComplete="new-password"
            required
          />
          {showConfirmError ? (
            <p className="mt-2 text-xs text-rose-300">
              Confirm Password must match Password.
            </p>
          ) : null}
        </div>

        {error ? (
          <p className="rounded-lg border border-rose-200/20 bg-rose-500/10 px-3 py-2 text-sm text-rose-200">
            {error}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-xl bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-200 px-4 py-3 text-sm font-semibold text-slate-900 transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isSubmitting ? "Creating Account..." : "Create Account"}
        </button>

        <div className="pt-1 text-center text-sm text-slate-300">
          <span>Already have an account? </span>
          <Link
            to="/login"
            state={{ lampOn: true }}
            className="font-medium text-amber-300 hover:text-amber-200"
          >
            Sign In
          </Link>
        </div>
      </form>
    </AuthLayout>
  );
}
