/**
 * EmergencyButton.jsx
 * Red "Activate Emergency Mode" button at the bottom of the sidebar.
 */

import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";

const ShieldAlertIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z" />
        <line x1="12" y1="8" x2="12" y2="12" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
        <circle cx="12" cy="16" r="1" fill="#fff" />
    </svg>
);

export default function EmergencyButton() {
    const [active, setActive] = useState(false);
    const [confirming, setConfirming] = useState(false);

    const handleClick = () => {
        if (!confirming) {
            setConfirming(true);
            setTimeout(() => setConfirming(false), 3000);
        } else {
            setActive(true);
            setConfirming(false);
            // In a real app, this would trigger an SOS / 911 call
            setTimeout(() => setActive(false), 5000);
        }
    };

    return (
        <div style={{ padding: "1rem", marginTop: "auto" }}>
            <motion.button
                onClick={handleClick}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                style={{
                    width: "100%",
                    padding: "0.85rem",
                    borderRadius: "10px",
                    border: "none",
                    background: active
                        ? "linear-gradient(135deg, #dc2626, #b91c1c)"
                        : confirming
                            ? "linear-gradient(135deg, #ea580c, #c2410c)"
                            : "linear-gradient(135deg, #dc2626, #ef4444)",
                    color: "#fff",
                    fontSize: "0.82rem",
                    fontWeight: 700,
                    letterSpacing: "0.06em",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "0.5rem",
                    boxShadow: active
                        ? "0 0 30px rgba(220,38,38,0.6)"
                        : "0 4px 18px rgba(220,38,38,0.35)",
                    transition: "background 0.3s, box-shadow 0.3s",
                    textTransform: "uppercase",
                }}
            >
                {/* Animated warning icon */}
                <motion.span
                    animate={active ? { rotate: [0, -10, 10, -10, 10, 0] } : {}}
                    transition={{ repeat: active ? Infinity : 0, duration: 0.5 }}
                >
                    <ShieldAlertIcon />
                </motion.span>

                <AnimatePresence mode="wait">
                    {active ? (
                        <motion.span key="sos" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                            SOS ACTIVATED — CALLING HELP...
                        </motion.span>
                    ) : confirming ? (
                        <motion.span key="confirm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                            TAP AGAIN TO CONFIRM
                        </motion.span>
                    ) : (
                        <motion.span key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                            ACTIVATE EMERGENCY MODE
                        </motion.span>
                    )}
                </AnimatePresence>
            </motion.button>

            {active && (
                <motion.p
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{ fontSize: "0.7rem", color: "#ef4444", textAlign: "center", marginTop: "0.5rem" }}
                >
                    Emergency contacts are being notified...
                </motion.p>
            )}
        </div>
    );
}
