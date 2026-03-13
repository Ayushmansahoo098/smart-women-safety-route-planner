/**
 * Navbar.jsx
 * Top navigation bar for the Safe Route dashboard.
 * Contains: logo, From/To location inputs, Live Safety Pulse indicator,
 * add button, and user avatar.
 */

import { useState } from "react";

// ── Icons (inline SVG to avoid extra deps) ─────────────────────────────
const ShieldIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z" />
    </svg>
);

const PinIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
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

const PlusIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
        <line x1="12" y1="5" x2="12" y2="19" />
        <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
);

export default function Navbar({ fromLocation, setFromLocation, toLocation, setToLocation, onLogout }) {
    const [pulse, setPulse] = useState(true);

    return (
        <nav
            style={{
                height: "56px",
                background: "#12161f",
                borderBottom: "1px solid rgba(255,255,255,0.07)",
                display: "flex",
                alignItems: "center",
                paddingLeft: "1rem",
                paddingRight: "1rem",
                gap: "0.75rem",
                flexShrink: 0,
                zIndex: 40,
            }}
        >
            {/* ── Logo ── */}
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginRight: "0.5rem" }}>
                <div
                    style={{
                        width: "30px",
                        height: "30px",
                        borderRadius: "8px",
                        background: "linear-gradient(135deg, #3b82f6, #6366f1)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#fff",
                        flexShrink: 0,
                    }}
                >
                    <ShieldIcon />
                </div>
                <span style={{ fontWeight: 700, fontSize: "0.95rem", color: "#f1f5f9", whiteSpace: "nowrap" }}>
                    Safe Route
                </span>
            </div>

            {/* ── From Input ── */}
            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    flex: "1 1 180px",
                    maxWidth: "240px",
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "8px",
                    padding: "0 0.75rem",
                    height: "36px",
                }}
            >
                <span style={{ color: "#64748b", flexShrink: 0 }}>
                    <PinIcon />
                </span>
                <input
                    value={fromLocation}
                    onChange={(e) => setFromLocation(e.target.value)}
                    placeholder="From: e.g. Union Station, Chicago"
                    style={{
                        background: "transparent",
                        border: "none",
                        outline: "none",
                        color: "#cbd5e1",
                        fontSize: "0.8rem",
                        width: "100%",
                    }}
                />
            </div>

            {/* ── To Input ── */}
            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    flex: "1 1 180px",
                    maxWidth: "240px",
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "8px",
                    padding: "0 0.75rem",
                    height: "36px",
                }}
            >
                <span style={{ color: "#64748b", flexShrink: 0 }}>
                    <FlagIcon />
                </span>
                <input
                    value={toLocation}
                    onChange={(e) => setToLocation(e.target.value)}
                    placeholder="To: e.g. Navy Pier, Chicago"
                    style={{
                        background: "transparent",
                        border: "none",
                        outline: "none",
                        color: "#cbd5e1",
                        fontSize: "0.8rem",
                        width: "100%",
                    }}
                />
            </div>

            {/* Spacer */}
            <div style={{ flex: 1 }} />

            {/* ── Live Safety Pulse ── */}
            <button
                onClick={() => setPulse(!pulse)}
                style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    padding: "0 0.85rem",
                    height: "36px",
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "8px",
                    color: "#e2e8f0",
                    fontSize: "0.78rem",
                    fontWeight: 600,
                    cursor: "pointer",
                    letterSpacing: "0.02em",
                    whiteSpace: "nowrap",
                }}
            >
                {/* Animated green dot */}
                <span style={{ position: "relative", display: "flex", alignItems: "center" }}>
                    <span
                        style={{
                            width: "8px",
                            height: "8px",
                            borderRadius: "50%",
                            background: pulse ? "#22c55e" : "#64748b",
                            display: "block",
                            boxShadow: pulse ? "0 0 0 0 rgba(34,197,94,0.5)" : "none",
                            animation: pulse ? "srPulseRing 1.6s ease-out infinite" : "none",
                        }}
                    />
                </span>
                LIVE SAFETY PULSE
            </button>

            {/* ── Add Button ── */}
            <button
                style={{
                    width: "36px",
                    height: "36px",
                    borderRadius: "8px",
                    background: "rgba(255,255,255,0.06)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#94a3b8",
                    cursor: "pointer",
                    flexShrink: 0,
                }}
            >
                <PlusIcon />
            </button>

            {/* ── User Avatar / Logout ── */}
            <button
                onClick={onLogout}
                title="Logout"
                style={{
                    width: "34px",
                    height: "34px",
                    borderRadius: "50%",
                    background: "linear-gradient(135deg, #6366f1, #3b82f6)",
                    border: "2px solid rgba(255,255,255,0.15)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#fff",
                    fontSize: "0.78rem",
                    fontWeight: 700,
                    cursor: "pointer",
                    flexShrink: 0,
                }}
            >
                SR
            </button>

            {/* Pulse animation keyframe via style tag */}
            <style>{`
        @keyframes srPulseRing {
          0% { box-shadow: 0 0 0 0 rgba(34,197,94,0.5); }
          70% { box-shadow: 0 0 0 8px rgba(34,197,94,0); }
          100% { box-shadow: 0 0 0 0 rgba(34,197,94,0); }
        }
      `}</style>
        </nav>
    );
}
