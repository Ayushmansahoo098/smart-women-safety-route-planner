import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import api from "../services/api";
import { clearAuthToken } from "../utils/authStorage";
import { getApiErrorMessage } from "../utils/errorMessage";

export default function DashboardPage() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        const response = await api.get("/protected/dashboard");
        setData(response.data);
      } catch (requestError) {
        const statusCode = requestError.response?.status;
        const message = getApiErrorMessage(
          requestError,
          "Unable to load dashboard right now."
        );

        if (statusCode === 401) {
          clearAuthToken();
          navigate("/login", { replace: true });
          return;
        }

        setError(message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [navigate]);

  const handleLogout = () => {
    clearAuthToken();
    navigate("/login", { replace: true });
  };

  return (
    <div className="min-h-screen bg-slate-950 px-4 py-12 text-slate-100">
      <motion.main
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="mx-auto w-full max-w-4xl rounded-3xl border border-white/15 bg-white/10 p-7 shadow-glass backdrop-blur-xl"
      >
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h1 className="text-2xl font-semibold text-white">Dashboard</h1>
          <button
            type="button"
            onClick={handleLogout}
            className="rounded-xl border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/20"
          >
            Logout
          </button>
        </div>

        {isLoading ? (
          <p className="mt-6 text-sm text-slate-300">Loading dashboard...</p>
        ) : null}

        {error ? (
          <p className="mt-6 rounded-lg border border-rose-200/20 bg-rose-500/10 px-3 py-2 text-sm text-rose-200">
            {error}
          </p>
        ) : null}

        {data ? (
          <section className="mt-6 space-y-3 rounded-2xl border border-white/10 bg-black/20 p-5">
            <p className="text-sm text-slate-300">{data.message}</p>
            <div className="space-y-1 text-sm text-slate-200">
              <p>
                <span className="text-slate-400">Name:</span> {data.user?.name}
              </p>
              <p>
                <span className="text-slate-400">Email:</span> {data.user?.email}
              </p>
            </div>
          </section>
        ) : null}
      </motion.main>
    </div>
  );
}
