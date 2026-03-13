/**
 * RouteIntelligence.jsx
 * Left sidebar panel — shows 3 ranked routes with safety scores.
 * Matches the "Route Intelligence" section in the mockup.
 */

import { motion } from "framer-motion";

// ── Route data (US-themed) ─────────────────────────────────────────────
const ROUTES = [
    {
        id: 0,
        name: "Via Main St & 5th Ave",
        tags: ["Well-lit corridor", "Police patrol zone"],
        safetyScore: 98,
        scoreColor: "#22c55e",
        time: "14 min",
        distance: "0.8 mi",
        recommended: true,
        danger: false,
    },
    {
        id: 1,
        name: "Via Broadway Blvd",
        tags: ["Moderate lighting", "Transit-monitored"],
        safetyScore: 79,
        scoreColor: "#f59e0b",
        time: "11 min",
        distance: "0.6 mi",
        recommended: false,
        danger: false,
    },
    {
        id: 2,
        name: "Via Industrial Ave",
        tags: ["Low lighting", "Crime hotspot nearby"],
        safetyScore: 42,
        scoreColor: "#ef4444",
        time: "8 min",
        distance: "0.5 mi",
        recommended: false,
        danger: true,
    },
];

// ── Tiny SVG icons ─────────────────────────────────────────────────────
const ClockIcon = () => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
    </svg>
);

const WalkIcon = () => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
        <circle cx="12" cy="4" r="2" />
        <path d="M9 20l-.5-5L12 13l2.5 2L14 20" />
        <path d="M6.5 10.5L9 8l3 2 3-2 2.5 2.5" />
    </svg>
);

export default function RouteIntelligence({ activeRoute, setActiveRoute }) {
    return (
        <div style={{ padding: "1rem", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
            {/* Section header */}
            <h2 style={{ fontSize: "0.9rem", fontWeight: 700, color: "#f1f5f9", margin: "0 0 0.85rem 0" }}>
                Route Intelligence
            </h2>

            {/* Route cards */}
            <div style={{ display: "flex", flexDirection: "column", gap: "0.55rem" }}>
                {ROUTES.map((route, i) => (
                    <motion.button
                        key={route.id}
                        onClick={() => setActiveRoute(route.id)}
                        initial={{ opacity: 0, x: -12 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.08, duration: 0.3 }}
                        style={{
                            width: "100%",
                            textAlign: "left",
                            background: activeRoute === route.id ? "rgba(59,130,246,0.08)" : "rgba(255,255,255,0.03)",
                            border: activeRoute === route.id
                                ? "1px solid rgba(34,197,94,0.5)"
                                : "1px solid rgba(255,255,255,0.07)",
                            borderRadius: "12px",
                            padding: "0.7rem 0.85rem",
                            cursor: "pointer",
                            position: "relative",
                            transition: "all 0.2s ease",
                        }}
                    >
                        {/* Recommended badge */}
                        {route.recommended && (
                            <span
                                style={{
                                    display: "inline-block",
                                    fontSize: "0.6rem",
                                    fontWeight: 700,
                                    letterSpacing: "0.08em",
                                    color: "#22c55e",
                                    background: "rgba(34,197,94,0.12)",
                                    border: "1px solid rgba(34,197,94,0.35)",
                                    borderRadius: "4px",
                                    padding: "1px 6px",
                                    marginBottom: "0.4rem",
                                    textTransform: "uppercase",
                                }}
                            >
                                RECOMMENDED
                            </span>
                        )}

                        {/* Row: name + score */}
                        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
                            <div>
                                <p style={{ margin: 0, fontSize: "0.85rem", fontWeight: 600, color: "#f1f5f9" }}>
                                    {route.name}
                                </p>
                                <p
                                    style={{
                                        margin: "2px 0 0",
                                        fontSize: "0.72rem",
                                        color: route.danger ? "#ef4444" : "#64748b",
                                    }}
                                >
                                    {route.tags.map((t, ti) => (
                                        <span key={ti}>
                                            {ti > 0 && (
                                                <span style={{ color: "#334155", margin: "0 3px" }}>•</span>
                                            )}
                                            {t}
                                        </span>
                                    ))}
                                </p>
                            </div>
                            <div style={{ textAlign: "right", marginLeft: "0.5rem" }}>
                                <span style={{ fontSize: "1.3rem", fontWeight: 800, color: route.scoreColor, lineHeight: 1 }}>
                                    {route.safetyScore}
                                </span>
                                <p style={{ margin: 0, fontSize: "0.6rem", color: "#64748b", whiteSpace: "nowrap" }}>
                                    Safety Score
                                </p>
                            </div>
                        </div>

                        {/* Row: time + distance */}
                        <div
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "0.9rem",
                                marginTop: "0.5rem",
                                color: "#94a3b8",
                                fontSize: "0.73rem",
                            }}
                        >
                            <span style={{ display: "flex", alignItems: "center", gap: "3px" }}>
                                <ClockIcon /> {route.time}
                            </span>
                            <span style={{ display: "flex", alignItems: "center", gap: "3px" }}>
                                <WalkIcon /> {route.distance}
                            </span>
                        </div>
                    </motion.button>
                ))}
            </div>
        </div>
    );
}
