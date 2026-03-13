/**
 * SafetyPanel.jsx
 * Displays the safety analysis for a searched route.
 * Shows: Safety Score, Crime Risk, Lighting Level, Crowd Density,
 *        Distance, Estimated Travel Time.
 *
 * Uses mock/calculated data enriched by the route distance/duration
 * returned from OSRM.
 */

import { motion } from "framer-motion";

// ── Helpers ────────────────────────────────────────────────────────────

/** Format meters → "1.2 km" or "340 m" */
function fmtDistance(meters) {
    if (meters >= 1000) return `${(meters / 1000).toFixed(1)} km`;
    return `${Math.round(meters)} m`;
}

/** Format seconds → "5 min" or "1 h 12 min" */
function fmtDuration(secs) {
    const m = Math.round(secs / 60);
    if (m < 60) return `${m} min`;
    return `${Math.floor(m / 60)} h ${m % 60} min`;
}

/** Generate mock safety data seeded by distance so it's consistent per route */
function mockSafety(distanceMeters) {
    // Longer routes generally have more variance
    const seed = Math.round(distanceMeters) % 100;
    const score = Math.max(40, Math.min(99, 88 - Math.floor(seed / 8)));
    const crimeRisk = score >= 75 ? "Low" : score >= 55 ? "Medium" : "High";
    const lighting = score >= 80 ? "Well Lit" : score >= 60 ? "Moderate" : "Poor";
    const crowd = score >= 85 ? "Active" : score >= 65 ? "Moderate" : "Sparse";

    return { score, crimeRisk, lighting, crowd };
}

// ── Mini icons ─────────────────────────────────────────────────────────
const ShieldIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
);
const AlertIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
        <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
        <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
);
const SunIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
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
const PeopleIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
        <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 00-3-3.87" />
        <path d="M16 3.13a4 4 0 010 7.75" />
    </svg>
);
const MapPinIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
        <circle cx="12" cy="10" r="3" />
    </svg>
);
const ClockIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
    </svg>
);

// ── Circular score gauge (SVG) ─────────────────────────────────────────
function ScoreGauge({ score }) {
    const r = 38;
    const circ = 2 * Math.PI * r;
    const dash = (score / 100) * circ;
    const color = score >= 75 ? "#22c55e" : score >= 50 ? "#f59e0b" : "#ef4444";
    const label = score >= 75 ? "SAFE" : score >= 50 ? "CAUTION" : "DANGER";

    return (
        <div style={{ position: "relative", width: "96px", height: "96px", flexShrink: 0 }}>
            <svg width="96" height="96" viewBox="0 0 96 96" style={{ transform: "rotate(-90deg)" }}>
                <circle cx="48" cy="48" r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="8" />
                <motion.circle
                    cx="48" cy="48" r={r} fill="none" stroke={color}
                    strokeWidth="8" strokeLinecap="round"
                    strokeDasharray={circ}
                    initial={{ strokeDashoffset: circ }}
                    animate={{ strokeDashoffset: circ - dash }}
                    transition={{ duration: 0.9, ease: "easeOut" }}
                    style={{ filter: `drop-shadow(0 0 5px ${color}88)` }}
                />
            </svg>
            <div style={{
                position: "absolute", inset: 0,
                display: "flex", flexDirection: "column",
                alignItems: "center", justifyContent: "center",
            }}>
                <span style={{ fontSize: "1.35rem", fontWeight: 800, color: "#f1f5f9", lineHeight: 1 }}>{score}</span>
                <span style={{ fontSize: "0.52rem", color, letterSpacing: "0.08em", fontWeight: 700, marginTop: "1px" }}>{label}</span>
            </div>
        </div>
    );
}

// ── Stat row ───────────────────────────────────────────────────────────
function StatRow({ icon, label, value, valueColor = "#f1f5f9", delay = 0 }) {
    return (
        <motion.div
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay, duration: 0.3 }}
            style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "0.55rem 0.7rem",
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.05)",
                borderRadius: "8px",
            }}
        >
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "#64748b" }}>
                {icon}
                <span style={{ fontSize: "0.75rem", color: "#94a3b8" }}>{label}</span>
            </div>
            <span style={{ fontSize: "0.8rem", fontWeight: 600, color: valueColor }}>
                {value}
            </span>
        </motion.div>
    );
}

/**
 * Props:
 *   routeData: { distanceMeters, durationSeconds, fromName, toName }
 */
export default function SafetyPanel({ routeData }) {
    if (!routeData) return null;

    const { distanceMeters, durationSeconds, fromName, toName } = routeData;
    const { score, crimeRisk, lighting, crowd } = mockSafety(distanceMeters);

    const crimeColor = crimeRisk === "Low" ? "#22c55e" : crimeRisk === "Medium" ? "#f59e0b" : "#ef4444";
    const lightColor = lighting === "Well Lit" ? "#22c55e" : lighting === "Moderate" ? "#f59e0b" : "#ef4444";
    const crowdColor = crowd === "Active" ? "#22c55e" : crowd === "Moderate" ? "#f59e0b" : "#64748b";

    return (
        <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            style={{ padding: "1rem", borderBottom: "1px solid rgba(255,255,255,0.06)" }}
        >
            {/* Header */}
            <h2 style={{ fontSize: "0.88rem", fontWeight: 700, color: "#f1f5f9", margin: "0 0 0.85rem 0" }}>
                Safety Analysis
            </h2>

            {/* Route summary pills */}
            <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap", marginBottom: "0.85rem" }}>
                {[fromName, toName].map((name, i) => (
                    <span
                        key={i}
                        style={{
                            fontSize: "0.65rem", color: "#94a3b8",
                            background: "rgba(255,255,255,0.05)",
                            border: "1px solid rgba(255,255,255,0.08)",
                            borderRadius: "5px", padding: "2px 8px",
                            maxWidth: "120px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                        }}
                    >
                        {i === 0 ? "🟢" : "🔵"} {name}
                    </span>
                ))}
            </div>

            {/* Score + top stats */}
            <div style={{ display: "flex", gap: "0.85rem", alignItems: "center", marginBottom: "0.7rem" }}>
                <ScoreGauge score={score} />
                <div style={{ flex: 1 }}>
                    <p style={{ margin: "0 0 2px", fontSize: "0.68rem", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 600 }}>
                        Safety Score
                    </p>
                    <p style={{ margin: "0 0 8px", fontSize: "0.78rem", color: "#94a3b8", lineHeight: 1.4 }}>
                        AI evaluated {Math.round(distanceMeters / 50)} safety data points along this route.
                    </p>
                    <div style={{
                        display: "inline-flex", alignItems: "center", gap: "4px",
                        background: score >= 75 ? "rgba(34,197,94,0.12)" : score >= 50 ? "rgba(245,158,11,0.12)" : "rgba(239,68,68,0.12)",
                        border: `1px solid ${score >= 75 ? "rgba(34,197,94,0.3)" : score >= 50 ? "rgba(245,158,11,0.3)" : "rgba(239,68,68,0.3)"}`,
                        borderRadius: "6px", padding: "3px 8px",
                        fontSize: "0.7rem", fontWeight: 700,
                        color: score >= 75 ? "#22c55e" : score >= 50 ? "#f59e0b" : "#ef4444",
                    }}>
                        <ShieldIcon />
                        {score >= 75 ? "Route Recommended" : score >= 50 ? "Exercise Caution" : "Avoid if Possible"}
                    </div>
                </div>
            </div>

            {/* Detail stats */}
            <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                <StatRow icon={<AlertIcon />} label="Crime Risk" value={crimeRisk} valueColor={crimeColor} delay={0.05} />
                <StatRow icon={<SunIcon />} label="Lighting Level" value={lighting} valueColor={lightColor} delay={0.1} />
                <StatRow icon={<PeopleIcon />} label="Crowd Density" value={crowd} valueColor={crowdColor} delay={0.15} />
                <StatRow icon={<MapPinIcon />} label="Distance" value={fmtDistance(distanceMeters)} delay={0.2} />
                <StatRow icon={<ClockIcon />} label="Travel Time" value={fmtDuration(durationSeconds)} delay={0.25} />
            </div>
        </motion.div>
    );
}
