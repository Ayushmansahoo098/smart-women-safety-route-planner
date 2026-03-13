import { AnimatePresence, motion } from "framer-motion";
import { useMemo, useState } from "react";

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

export default function AuthLayout({
  title,
  subtitle,
  children,
  initialLampOn = false
}) {
  const [isLampOn, setIsLampOn] = useState(initialLampOn);
  const [cordOffset, setCordOffset] = useState(0);

  const lampShadeClass = useMemo(
    () =>
      isLampOn
        ? "bg-gradient-to-b from-amber-50 to-amber-100 shadow-[0_0_28px_rgba(252,211,77,0.45)]"
        : "bg-stone-100/90",
    [isLampOn]
  );

  const handleCordDrag = (_, info) => {
    setCordOffset(clamp(info.offset.y, 0, 70));
  };

  const handleCordRelease = (_, info) => {
    if (info.offset.y > 42) {
      setIsLampOn((prev) => !prev);
    }
    setCordOffset(0);
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950 text-slate-100">
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        animate={{ opacity: isLampOn ? 1 : 0 }}
        transition={{ duration: 0.45, ease: "easeInOut" }}
        style={{
          background:
            "radial-gradient(circle at 50% 36%, rgba(251, 191, 36, 0.28), rgba(15, 23, 42, 0) 46%)"
        }}
      />

      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-6xl flex-col items-center justify-center gap-10 px-4 py-8 lg:flex-row lg:gap-24">
        <div className="relative h-[360px] w-[260px]">
          <motion.div
            aria-hidden
            className="absolute left-1/2 top-[95px] h-24 w-40 -translate-x-1/2 rounded-full bg-amber-300/40 blur-3xl"
            animate={{ opacity: isLampOn ? 1 : 0 }}
            transition={{ duration: 0.35 }}
          />

          <motion.div
            className={`absolute left-1/2 top-[55px] h-[72px] w-[170px] -translate-x-1/2 rounded-[48%_48%_42%_42%/62%_62%_38%_38%] transition-colors duration-300 ${lampShadeClass}`}
            animate={{ scale: isLampOn ? 1.02 : 1 }}
            transition={{ duration: 0.3 }}
          />
          <div className="absolute left-1/2 top-[126px] h-[138px] w-4 -translate-x-1/2 rounded-full bg-stone-300/90" />
          <div className="absolute left-1/2 top-[262px] h-4 w-28 -translate-x-1/2 rounded-full bg-stone-400/80" />

          <div
            className="absolute left-1/2 top-[125px] w-[2px] -translate-x-1/2 rounded-full bg-slate-500/90 transition-all duration-200"
            style={{ height: `${72 + cordOffset}px` }}
          />

          <motion.button
            type="button"
            drag="y"
            dragConstraints={{ top: 0, bottom: 70 }}
            dragMomentum={false}
            onDrag={handleCordDrag}
            onDragEnd={handleCordRelease}
            onClick={() => setIsLampOn((prev) => !prev)}
            animate={{ y: cordOffset }}
            transition={{ type: "spring", stiffness: 350, damping: 26 }}
            className="absolute left-1/2 top-[188px] h-6 w-6 -translate-x-1/2 cursor-grab rounded-full border border-amber-200/30 bg-amber-600 active:cursor-grabbing"
            aria-label="Pull lamp cord"
          />
        </div>

        <AnimatePresence mode="wait">
          {isLampOn ? (
            <motion.div
              key="auth-form-card"
              initial={{ opacity: 0, y: 26, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16, scale: 0.98 }}
              transition={{ duration: 0.32, ease: "easeOut" }}
              className="w-full max-w-md rounded-3xl border border-white/15 bg-white/10 p-7 shadow-glass backdrop-blur-xl"
            >
              <h1 className="text-2xl font-semibold text-white">{title}</h1>
              <p className="mt-1 text-sm text-slate-300">{subtitle}</p>
              <div className="mt-6">{children}</div>
            </motion.div>
          ) : (
            <motion.p
              key="lamp-instruction"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              className="rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-sm text-slate-200 backdrop-blur-sm"
            >
              Pull the lamp string to turn on the light.
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
