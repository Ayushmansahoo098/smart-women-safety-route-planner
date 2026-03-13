/**
 * WaveText — renders each character of `text` with a staggered
 * bounce animation so the label ripples like a wave on hover.
 *
 * Usage:
 *   <WaveText text="Secure Login" />
 *   <WaveText text="Google" speed={0.08} amplitude={5} />
 *
 * Props:
 *   text       – string to animate
 *   speed      – delay between each letter (seconds), default 0.06
 *   amplitude  – px of vertical travel, default 4
 *   className  – extra class forwarded to the wrapper <span>
 */
export default function WaveText({ text, speed = 0.06, amplitude = 4, className = "" }) {
    return (
        <span className={`wave-text-wrap ${className}`} aria-label={text}>
            {[...text].map((char, i) => (
                <span
                    key={i}
                    className="wave-char"
                    aria-hidden="true"
                    style={{
                        "--wave-delay": `${i * speed}s`,
                        "--wave-amp": `${amplitude}px`,
                    }}
                >
                    {/* non-breaking space so spaces animate too */}
                    {char === " " ? "\u00A0" : char}
                </span>
            ))}
        </span>
    );
}
