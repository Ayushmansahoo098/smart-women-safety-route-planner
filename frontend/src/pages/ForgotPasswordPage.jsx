import { Link, useLocation } from "react-router-dom";
import AuthLayout from "../layouts/AuthLayout";

export default function ForgotPasswordPage() {
  const location = useLocation();

  return (
    <AuthLayout
      title="Forgot Password"
      subtitle="Password reset is coming soon. Use your existing password to sign in for now."
      initialLampOn={location.state?.lampOn ?? true}
    >
      <div className="space-y-4">
        <p className="rounded-lg border border-amber-200/20 bg-amber-400/10 px-3 py-2 text-sm text-amber-100">
          Reset-password flow is not integrated yet.
        </p>
        <Link
          to="/login"
          state={{ lampOn: true }}
          className="inline-block rounded-xl bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-200 px-4 py-2.5 text-sm font-semibold text-slate-900"
        >
          Back to Sign In
        </Link>
      </div>
    </AuthLayout>
  );
}
