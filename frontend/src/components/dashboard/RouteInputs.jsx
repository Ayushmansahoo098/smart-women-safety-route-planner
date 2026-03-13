/**
 * RouteInputs.jsx
 * Route search card with Starting Point + Destination + "Secure Route" button.
 * Placed at the top of the left sidebar when no route is searched yet,
 * or as a floating bar when a route is already displayed.
 */

import { AnimatePresence, motion } from "framer-motion";
import { useEffect } from "react";

// ── Icons ──────────────────────────────────────────────────────────────
const PinIcon = ({ color = "currentColor" }) => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
        <circle cx="12" cy="10" r="3" />
    </svg>
);

const FlagIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
        <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
        <line x1="4" y1="22" x2="4" y2="15" />
    </svg>
);

const SearchIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
        <circle cx="11" cy="11" r="8" />
        <path d="M21 21l-4.35-4.35" />
    </svg>
);

const ShieldIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
);

const SpinnerIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
        style={{ animation: "spin 0.8s linear infinite" }}>
        <circle cx="12" cy="12" r="10" strokeOpacity="0.3" />
        <path d="M12 2a10 10 0 0 1 10 10" stroke="#fff" />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </svg>
);

const RefreshIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
        <polyline points="1 4 1 10 7 10" />
        <path d="M3.51 15a9 9 0 102.13-9.36L1 10" />
    </svg>
);

/**
 * Props:
 *  from, setFrom, to, setTo — controlled input values
 *  onSearch(from, to)       — called when user clicks Secure Route
 *  isLoading                — shows spinner on button
 *  hasResult                — whether a route is already displayed
 *  onReset                  — clears the current route result
 *  error                    — error string to display
 */
export default function RouteInputs({
    from, setFrom,
    to, setTo,
    onSearch,
    isLoading,
    hasResult,
    onReset,
    error,
}) {
    // Load last searched route from localStorage on mount
    useEffect(() => {
        try {
            const saved = JSON.parse(localStorage.getItem("sr_last_route") || "{}");
            if (saved.from && !from) setFrom(saved.from);
            if (saved.to && !to) setTo(saved.to);
        } catch (_) { /* ignore */ }
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!from.trim() || !to.trim()) return;
        onSearch(from.trim(), to.trim());
    };

    return (
        <div
            style={{
                padding: "1rem",
                borderBottom: "1px solid rgba(255,255,255,0.06)",
                background: "rgba(18,22,31,0.95)",
            }}
        >
            {/* Header */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.85rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <span
                        style={{
                            width: "26px", height: "26px", borderRadius: "7px",
                            background: "linear-gradient(135deg,#3b82f6,#6366f1)",
                            display: "flex", alignItems: "center", justifyContent: "center", color: "#fff",
                        }}
                    >
                        <ShieldIcon />
                    </span>
                    <h2 style={{ fontSize: "0.88rem", fontWeight: 700, color: "#f1f5f9", margin: 0 }}>
                        Plan Safe Route
                    </h2>
                </div>
                {hasResult && (
                    <button
                        onClick={onReset}
                        title="Search another route"
                        style={{
                            display: "flex", alignItems: "center", gap: "4px",
                            background: "rgba(255,255,255,0.05)",
                            border: "1px solid rgba(255,255,255,0.1)",
                            borderRadius: "7px",
                            padding: "4px 9px",
                            color: "#94a3b8",
                            fontSize: "0.72rem",
                            cursor: "pointer",
                        }}
                    >
                        <RefreshIcon /> New Search
                    </button>
                )}
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "0.55rem" }}>
                {/* Starting Point */}
                <div style={{ position: "relative" }}>
                    <label
                        style={{ display: "block", fontSize: "0.68rem", color: "#64748b", marginBottom: "4px", letterSpacing: "0.06em", textTransform: "uppercase", fontWeight: 600 }}
                    >
                        Starting Point
                    </label>
                    <div
                        style={{
                            display: "flex", alignItems: "center", gap: "0.5rem",
                            background: "rgba(255,255,255,0.04)",
                            border: "1px solid rgba(255,255,255,0.09)",
                            borderRadius: "9px", padding: "0 0.75rem", height: "40px",
                            transition: "border-color 0.2s",
                        }}
                        onFocus={() => { }}
                    >
                        <span style={{ color: "#22c55e", flexShrink: 0 }}>
                            <PinIcon color="#22c55e" />
                        </span>
                        <input
                            value={from}
                            onChange={(e) => setFrom(e.target.value)}
                            placeholder="e.g. Union Station, Chicago, IL"
                            required
                            style={{
                                background: "transparent", border: "none", outline: "none",
                                color: "#e2e8f0", fontSize: "0.8rem", width: "100%",
                            }}
                        />
                    </div>
                </div>

                {/* Dotted connector */}
                <div style={{ display: "flex", alignItems: "center", paddingLeft: "6px", gap: "6px" }}>
                    <div style={{ width: "2px", height: "16px", background: "linear-gradient(to bottom, #22c55e, #3b82f6)", borderRadius: "1px", marginLeft: "4px" }} />
                    <div style={{ flex: 1, height: "1px", background: "rgba(255,255,255,0.04)" }} />
                </div>

                {/* Destination */}
                <div>
                    <label
                        style={{ display: "block", fontSize: "0.68rem", color: "#64748b", marginBottom: "4px", letterSpacing: "0.06em", textTransform: "uppercase", fontWeight: 600 }}
                    >
                        Destination
                    </label>
                    <div
                        style={{
                            display: "flex", alignItems: "center", gap: "0.5rem",
                            background: "rgba(255,255,255,0.04)",
                            border: "1px solid rgba(255,255,255,0.09)",
                            borderRadius: "9px", padding: "0 0.75rem", height: "40px",
                        }}
                    >
                        <span style={{ color: "#3b82f6", flexShrink: 0 }}>
                            <FlagIcon />
                        </span>
                        <input
                            value={to}
                            onChange={(e) => setTo(e.target.value)}
                            placeholder="e.g. Millennium Park, Chicago, IL"
                            required
                            style={{
                                background: "transparent", border: "none", outline: "none",
                                color: "#e2e8f0", fontSize: "0.8rem", width: "100%",
                            }}
                        />
                    </div>
                </div>

                {/* Quick city suggestions */}
                {!hasResult && !from && !to && (
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "0.3rem", marginTop: "0.1rem" }}>
                        {[
                            { from: "Times Square, New York, NY", to: "Central Park, New York, NY", city: "NYC" },
                            { from: "Union Station, Chicago, IL", to: "Navy Pier, Chicago, IL", city: "Chicago" },
                            { from: "Hollywood Blvd, Los Angeles, CA", to: "Santa Monica Pier, CA", city: "LA" },
                        ].map((s) => (
                            <button
                                key={s.city}
                                type="button"
                                onClick={() => { setFrom(s.from); setTo(s.to); }}
                                style={{
                                    fontSize: "0.65rem", color: "#64748b",
                                    background: "rgba(255,255,255,0.04)",
                                    border: "1px solid rgba(255,255,255,0.07)",
                                    borderRadius: "5px", padding: "2px 8px",
                                    cursor: "pointer", letterSpacing: "0.04em",
                                }}
                            >
                                📍 {s.city}
                            </button>
                        ))}
                    </div>
                )}

                {/* Error message */}
                <AnimatePresence>
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, y: -4 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            style={{
                                fontSize: "0.74rem", color: "#fca5a5",
                                background: "rgba(239,68,68,0.1)",
                                border: "1px solid rgba(239,68,68,0.25)",
                                borderRadius: "7px", padding: "6px 10px",
                            }}
                        >
                            ⚠ {error}
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Secure Route button */}
                <motion.button
                    type="submit"
                    disabled={isLoading || !from.trim() || !to.trim()}
                    whileHover={{ scale: isLoading ? 1 : 1.02 }}
                    whileTap={{ scale: 0.97 }}
                    style={{
                        width: "100%",
                        height: "42px",
                        marginTop: "0.2rem",
                        background: isLoading
                            ? "rgba(59,130,246,0.5)"
                            : "linear-gradient(135deg, #2563eb 0%, #3b82f6 60%, #6366f1 100%)",
                        border: "none",
                        borderRadius: "9px",
                        color: "#fff",
                        fontSize: "0.84rem",
                        fontWeight: 700,
                        cursor: isLoading ? "not-allowed" : "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "0.5rem",
                        boxShadow: isLoading ? "none" : "0 4px 18px rgba(59,130,246,0.38)",
                        letterSpacing: "0.02em",
                        transition: "background 0.3s, box-shadow 0.3s",
                    }}
                >
                    {isLoading ? (
                        <>
                            <SpinnerIcon />
                            Analyzing Route…
                        </>
                    ) : (
                        <>
                            <SearchIcon />
                            Secure Route
                        </>
                    )}
                </motion.button>
            </form>
        </div>
    );
}
