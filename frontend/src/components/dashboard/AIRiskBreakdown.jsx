/**
 * AIRiskBreakdown.jsx
 * Left sidebar panel — circular safety score gauge + risk factor bars.
 * Matches the "AI Risk Breakdown" section in the mockup.
 */

import { AnimatePresence, motion } from "framer-motion";

// ── Risk data per route (US dataset) ──────────────────────────────────
const ROUTE_RISKS = [
    // Route 0 — Main St & 5th Ave (score: 98)
    [
        { label: "FBI Crime Index", fill: 0.12, color: "#3b82f6" },
        { label: "Street Lighting", fill: 0.94, color: "#22c55e" },
        { label: "Foot Traffic", fill: 0.88, color: "#22c55e" },
        { label: "Time of Day", fill: 0.52, color: "#f59e0b" },
    ],
    // Route 1 — Broadway Blvd (score: 79)
    [
        { label: "FBI Crime Index", fill: 0.35, color: "#f59e0b" },
        { label: "Street Lighting", fill: 0.62, color: "#22c55e" },
        { label: "Foot Traffic", fill: 0.44, color: "#f59e0b" },
        { label: "Time of Day", fill: 0.58, color: "#f59e0b" },
    ],
    // Route 2 — Industrial Ave (score: 42)
    [
        { label: "FBI Crime Index", fill: 0.88, color: "#ef4444" },
        { label: "Street Lighting", fill: 0.18, color: "#ef4444" },
        { label: "Foot Traffic", fill: 0.12, color: "#ef4444" },
        { label: "Time of Day", fill: 0.72, color: "#f59e0b" },
    ],
];

const ROUTE_SCORES = [98, 79, 42];
const SCORE_COLORS = ["#22c55e", "#f59e0b", "#ef4444"];

// ── Tiny info icon ─────────────────────────────────────────────────────
const InfoIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="12" />
        <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
);

// ── Crime / Lighting / Crowd / Time icons ──────────────────────────────
const CrimeIcon = () => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
        <line x1="12" y1="9" x2="12" y2="13" />
        <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
);
const LightIcon = () => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="5" />
        <line x1="12" y1="1" x2="12" y2="3" />
        <line x1="12" y1="21" x2="12" y2="23" />
        <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
        <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
        <line x1="1" y1="12" x2="3" y2="12" />
        <line x1="21" y1="12" x2="23" y2="12" />
        <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
        <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
    </svg>
);
const CrowdIcon = () => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 00-3-3.87" />
        <path d="M16 3.13a4 4 0 010 7.75" />
    </svg>
);
const TimeIcon = () => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
    </svg>
);
const ICONS = [CrimeIcon, LightIcon, CrowdIcon, TimeIcon];

// ── Circular gauge via SVG ─────────────────────────────────────────────
function CircularGauge({ score, color }) {
    const radius = 50;
    const circ = 2 * Math.PI * radius;
    const dash = (score / 100) * circ;

    return (
        <div style={{ position: "relative", width: "120px", height: "120px", margin: "0 auto" }}>
            <svg width="120" height="120" viewBox="0 0 120 120" style={{ transform: "rotate(-90deg)" }}>
                {/* Track */}
                <circle
                    cx="60" cy="60" r={radius}
                    fill="none"
                    stroke="rgba(255,255,255,0.07)"
                    strokeWidth="10"
                />
                {/* Progress */}
                <motion.circle
                    cx="60" cy="60" r={radius}
                    fill="none"
                    stroke={color}
                    strokeWidth="10"
                    strokeLinecap="round"
                    strokeDasharray={circ}
                    initial={{ strokeDashoffset: circ }}
                    animate={{ strokeDashoffset: circ - dash }}
                    transition={{ duration: 0.9, ease: "easeOut" }}
                    style={{ filter: `drop-shadow(0 0 6px ${color}88)` }}
                />
            </svg>
            {/* Center label */}
            <div
                style={{
                    position: "absolute",
                    inset: 0,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                }}
            >
                <span style={{ fontSize: "1.5rem", fontWeight: 800, color: "#f1f5f9", lineHeight: 1 }}>
                    {score}%
                </span>
                <span style={{ fontSize: "0.55rem", color: "#64748b", letterSpacing: "0.08em", marginTop: "2px" }}>
                    SECURE
                </span>
            </div>
        </div>
    );
}

export default function AIRiskBreakdown({ activeRoute }) {
    const risks = ROUTE_RISKS[activeRoute];
    const score = ROUTE_SCORES[activeRoute];
    const color = SCORE_COLORS[activeRoute];

    return (
        <div style={{ padding: "1rem", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
            {/* Header */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.85rem" }}>
                <h2 style={{ fontSize: "0.9rem", fontWeight: 700, color: "#f1f5f9", margin: 0 }}>
                    AI Risk Breakdown
                </h2>
                <span style={{ color: "#475569", cursor: "pointer" }}>
                    <InfoIcon />
                </span>
            </div>

            {/* Circular gauge */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={activeRoute}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.35 }}
                    style={{ marginBottom: "1rem" }}
                >
                    <CircularGauge score={score} color={color} />
                </motion.div>
            </AnimatePresence>

            {/* Risk bars */}
            <div style={{ display: "flex", flexDirection: "column", gap: "0.65rem" }}>
                {risks.map((risk, i) => {
                    const Icon = ICONS[i];
                    return (
                        <div key={risk.label} style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                            <span style={{ color: "#475569", flexShrink: 0 }}>
                                <Icon />
                            </span>
                            <span style={{ fontSize: "0.73rem", color: "#94a3b8", width: "100px", flexShrink: 0 }}>
                                {risk.label}
                            </span>
                            {/* Bar */}
                            <div
                                style={{
                                    flex: 1,
                                    height: "5px",
                                    background: "rgba(255,255,255,0.07)",
                                    borderRadius: "99px",
                                    overflow: "hidden",
                                }}
                            >
                                <motion.div
                                    key={activeRoute + "-" + i}
                                    initial={{ width: 0 }}
                                    animate={{ width: `${risk.fill * 100}%` }}
                                    transition={{ duration: 0.6, delay: i * 0.08, ease: "easeOut" }}
                                    style={{
                                        height: "100%",
                                        background: risk.color,
                                        borderRadius: "99px",
                                        boxShadow: `0 0 4px ${risk.color}88`,
                                    }}
                                />
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
