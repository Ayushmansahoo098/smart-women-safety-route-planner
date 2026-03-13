import { AnimatePresence, motion } from "framer-motion";

/* ─── Shield Icon ─── */
function IconShield() {
    return (
        <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
            <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z" />
        </svg>
    );
}

/* ─── Safe Zone pill ─── */
function SafeZonePill() {
    return (
        <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.5 }}
            className="absolute bottom-10 left-8 flex items-center gap-3 rounded-2xl border border-white/10 bg-white/10 px-4 py-3 shadow-xl backdrop-blur-md"
        >
            <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-blue-500 text-white shadow-lg">
                <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                </svg>
            </span>
            <div>
                <p className="text-sm font-semibold text-white">Safe Zone Detected</p>
                <p className="text-xs text-slate-300/80">&ldquo;High visibility &amp; active community reports&rdquo;</p>
            </div>
        </motion.div>
    );
}

const heroContent = {
    login: {
        headline: ["Walk with", "confidence,", "anywhere."],
        highlightWord: "confidence,",
        sub: "Join our community of over 2 million women navigating cities safely with real-time, verified route planning.",
    },
    signup: {
        headline: ["Your journey,", "secured."],
        highlightWord: "secured.",
        sub: "Join a global community of women dedicated to making every street safer for everyone.",
    },
};

const featureItems = [
    { icon: "✓", label: "Verified safety reports" },
    { icon: "📋", label: "Real-time route planning" },
    { icon: "👥", label: "24/7 Community support" },
];

export default function HeroSection({ mode }) {
    const content = heroContent[mode] || heroContent.login;

    return (
        <div className="login-left">
            {/* Animated gradient overlay */}
            <motion.div
                className="auth-hero-gradient"
                animate={{
                    background: [
                        "linear-gradient(135deg, rgba(30,58,138,0.88) 0%, rgba(15,23,42,0.92) 50%, rgba(59,130,246,0.55) 100%)",
                        "linear-gradient(135deg, rgba(15,23,42,0.92) 0%, rgba(59,130,246,0.55) 50%, rgba(30,58,138,0.88) 100%)",
                        "linear-gradient(135deg, rgba(59,130,246,0.55) 0%, rgba(30,58,138,0.88) 50%, rgba(15,23,42,0.92) 100%)",
                        "linear-gradient(135deg, rgba(30,58,138,0.88) 0%, rgba(15,23,42,0.92) 50%, rgba(59,130,246,0.55) 100%)",
                    ],
                }}
                transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                style={{
                    position: "absolute",
                    inset: 0,
                    zIndex: 0,
                }}
            />

            {/* Dark bottom gradient */}
            <div className="login-left-overlay2" />

            {/* Purple glow blob */}
            <div
                style={{
                    position: "absolute",
                    top: "18%",
                    left: "10%",
                    width: 220,
                    height: 220,
                    borderRadius: "50%",
                    background: "radial-gradient(circle, rgba(139,92,246,0.38) 0%, transparent 70%)",
                    filter: "blur(48px)",
                    pointerEvents: "none",
                    zIndex: 0,
                }}
            />

            {/* Logo */}
            <div className="login-logo">
                <span className="login-logo-icon">
                    <IconShield />
                </span>
                <span className="login-logo-text">SafeRoute Pro</span>
            </div>

            {/* Hero copy — animated per mode */}
            <div className="login-hero">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={mode}
                        initial={{ opacity: 0, y: 14 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.4, ease: "easeInOut" }}
                    >
                        <h1 className="login-hero-title">
                            {content.headline.map((word, i) =>
                                word === content.highlightWord ? (
                                    <span key={i}>
                                        <span className="login-hero-highlight">{word}</span>
                                        {i < content.headline.length - 1 && <br />}
                                    </span>
                                ) : (
                                    <span key={i}>
                                        {word}
                                        {i < content.headline.length - 1 && <br />}
                                    </span>
                                )
                            )}
                        </h1>
                        <p className="login-hero-sub" style={{ marginTop: "1rem" }}>
                            {content.sub}
                        </p>
                    </motion.div>
                </AnimatePresence>

                {/* Feature list — stays consistent */}
                <motion.ul
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.5 }}
                    style={{
                        listStyle: "none",
                        padding: 0,
                        margin: "1.6rem 0 0",
                        display: "flex",
                        flexDirection: "column",
                        gap: "0.85rem",
                    }}
                >
                    {featureItems.map((item) => (
                        <li
                            key={item.label}
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "0.75rem",
                                color: "#cbd5e1",
                                fontSize: "0.9rem",
                            }}
                        >
                            <span
                                style={{
                                    width: 28,
                                    height: 28,
                                    borderRadius: 8,
                                    background: "rgba(59,130,246,0.2)",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    fontSize: "0.75rem",
                                    flexShrink: 0,
                                }}
                            >
                                {item.icon}
                            </span>
                            {item.label}
                        </li>
                    ))}
                </motion.ul>
            </div>

            {/* Safe zone pill */}
            <SafeZonePill />

            {/* Footer */}
            <p className="login-left-footer">
                © {new Date().getFullYear()} SafeRoute Pro. All rights reserved. Your privacy is our priority.
            </p>
        </div>
    );
}
