import { Link } from "react-router-dom";

export default function NotFoundPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4 text-slate-100">
      <div className="w-full max-w-md rounded-2xl border border-white/15 bg-white/10 p-6 text-center backdrop-blur-lg">
        <h1 className="text-3xl font-semibold text-white">404</h1>
        <p className="mt-2 text-sm text-slate-300">
          The page you requested does not exist.
        </p>
        <Link
          to="/login"
          className="mt-5 inline-block rounded-xl bg-amber-300 px-4 py-2 text-sm font-semibold text-slate-900 transition hover:brightness-105"
        >
          Go to Login
        </Link>
      </div>
    </div>
  );
}
