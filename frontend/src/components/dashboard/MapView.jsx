/**
 * MapView.jsx
 * Real interactive map using Leaflet (loaded via CDN) with an OpenStreetMap
 * base layer and OSRM for walking/cycling route directions.
 *
 * When no route is searched → shows the decorative SVG map (original mockup).
 * When a route is searched  → shows a real Leaflet map centered on the route.
 *
 * No npm packages required — Leaflet is injected via <link>/<script> tags
 * to avoid the npm 11 / Node 25 chokidar version-string bug.
 */

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";

// ── Route color per index (for the decorative SVG fallback) ───────────
const ROUTE_COLORS = {
    0: "#22c55e",
    1: "#f59e0b",
    2: "#ef4444",
};

// ── SVG Path data (decorative mock map) ───────────────────────────────
const ROUTE_PATHS = {
    0: "M 490 430 C 530 380, 600 310, 700 270 C 760 250, 820 245, 870 250",
    1: "M 490 430 C 520 400, 580 350, 660 310 C 730 275, 810 260, 870 250",
    2: "M 490 430 C 480 360, 520 290, 620 260 C 700 235, 800 240, 870 250",
};

function generateDotPositions(numDots, points) {
    return Array.from({ length: numDots }, (_, i) => {
        const t = i / (numDots - 1);
        const [p0, p1, p2, p3] = points;
        const mt = 1 - t;
        return {
            x: mt ** 3 * p0.x + 3 * mt ** 2 * t * p1.x + 3 * mt * t ** 2 * p2.x + t ** 3 * p3.x,
            y: mt ** 3 * p0.y + 3 * mt ** 2 * t * p1.y + 3 * mt * t ** 2 * p2.y + t ** 3 * p3.y,
        };
    });
}

const GREEN_DOTS = generateDotPositions(22, [
    { x: 490, y: 430 }, { x: 560, y: 340 }, { x: 700, y: 270 }, { x: 870, y: 250 },
]);

const GRID_LINES = {
    h: [200, 260, 310, 360, 420, 480, 530, 580, 630],
    v: [380, 440, 510, 580, 650, 720, 790, 860, 920],
};

const PlusIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
        <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
    </svg>
);
const MinusIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
        <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
);
const CheckCircleIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.2">
        <path d="M22 11.08V12a10 10 0 11-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
    </svg>
);
const WarningIcon = () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2.2">
        <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
        <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
);

// ══════════════════════════════════════════════════════════════════════════
// Route styles
// ══════════════════════════════════════════════════════════════════════════
const LEAFLET_ROUTE_STYLES = [
    { color: "#22c55e", glowColor: "#22c55e", label: "Safest Route",   safety: "High Safety" },
    { color: "#f59e0b", glowColor: "#f59e0b", label: "Moderate Route", safety: "Moderate" },
    { color: "#ef4444", glowColor: "#ef4444", label: "Fastest Route",  safety: "Higher Risk" },
];

// Active/inactive weights & opacities
const ROUTE_STYLE_ACTIVE   = { weight: 6,   opacity: 1 };
const ROUTE_STYLE_INACTIVE = { weight: 3,   opacity: 0.45 };
const GLOW_STYLE_ACTIVE    = { weight: 16,  opacity: 0.18 };
const GLOW_STYLE_INACTIVE  = { weight: 8,   opacity: 0.06 };

// ══════════════════════════════════════════════════════════════════════════
// Warning overlay shown when user switches away from the selected route
// ══════════════════════════════════════════════════════════════════════════
function RouteChangeWarning({ fromIdx, toIdx, onConfirm, onCancel }) {
    const from = LEAFLET_ROUTE_STYLES[fromIdx];
    const to   = LEAFLET_ROUTE_STYLES[toIdx];
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.88 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.88 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            style={{
                position: "absolute", inset: 0, zIndex: 2000,
                display: "flex", alignItems: "center", justifyContent: "center",
                background: "rgba(0,0,0,0.55)", backdropFilter: "blur(6px)",
            }}
        >
            {/* Pulsing ring */}
            <motion.div
                animate={{ scale: [1, 1.08, 1], opacity: [0.6, 0.15, 0.6] }}
                transition={{ repeat: Infinity, duration: 1.4, ease: "easeInOut" }}
                style={{
                    position: "absolute",
                    width: "200px", height: "200px",
                    borderRadius: "50%",
                    border: `3px solid ${to.color}`,
                    pointerEvents: "none",
                    boxShadow: `0 0 40px ${to.color}66`,
                }}
            />
            {/* Dialog card */}
            <motion.div
                initial={{ y: 30 }}
                animate={{ y: 0 }}
                exit={{ y: 30 }}
                transition={{ duration: 0.25 }}
                style={{
                    background: "rgba(18,22,31,0.97)",
                    border: `1px solid ${to.color}55`,
                    borderRadius: "18px",
                    padding: "1.6rem 2rem",
                    maxWidth: "340px",
                    width: "calc(100% - 3rem)",
                    boxShadow: `0 0 60px ${to.color}33, 0 8px 40px rgba(0,0,0,0.6)`,
                    textAlign: "center",
                    position: "relative",
                    zIndex: 1,
                }}
            >
                {/* Animated warning icon */}
                <motion.div
                    animate={{ rotate: [0, -6, 6, -4, 4, 0] }}
                    transition={{ repeat: Infinity, duration: 2.2, ease: "easeInOut" }}
                    style={{
                        display: "inline-flex",
                        background: "rgba(245,158,11,0.12)",
                        border: "1px solid rgba(245,158,11,0.3)",
                        borderRadius: "50%",
                        padding: "0.75rem",
                        marginBottom: "0.9rem",
                    }}
                >
                    <WarningIcon />
                </motion.div>

                <h3 style={{ margin: "0 0 0.45rem", fontSize: "1rem", fontWeight: 800, color: "#f1f5f9" }}>
                    Route Change Detected
                </h3>
                <p style={{ margin: "0 0 1.1rem", fontSize: "0.8rem", color: "#94a3b8", lineHeight: 1.6 }}>
                    You are about to switch from the{" "}
                    <span style={{ color: from.color, fontWeight: 700 }}>{from.label}</span>{" "}
                    to the{" "}
                    <span style={{ color: to.color, fontWeight: 700 }}>{to.label}</span>.
                    {toIdx === 2 && (
                        <span style={{ display: "block", marginTop: "0.4rem", color: "#ef4444", fontSize: "0.75rem" }}>
                            ⚠ This route passes through higher-risk areas.
                        </span>
                    )}
                </p>

                <div style={{ display: "flex", gap: "0.75rem" }}>
                    <button
                        onClick={onCancel}
                        style={{
                            flex: 1,
                            padding: "0.55rem 0",
                            background: "rgba(255,255,255,0.05)",
                            border: "1px solid rgba(255,255,255,0.12)",
                            borderRadius: "10px",
                            color: "#94a3b8",
                            cursor: "pointer",
                            fontSize: "0.83rem",
                            fontWeight: 600,
                            transition: "all 0.15s",
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.1)"}
                        onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.05)"}
                    >
                        Keep Current
                    </button>
                    <button
                        onClick={onConfirm}
                        style={{
                            flex: 1,
                            padding: "0.55rem 0",
                            background: `${to.color}22`,
                            border: `1px solid ${to.color}66`,
                            borderRadius: "10px",
                            color: to.color,
                            cursor: "pointer",
                            fontSize: "0.83rem",
                            fontWeight: 700,
                            transition: "all 0.15s",
                            boxShadow: `0 0 12px ${to.color}33`,
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = `${to.color}40`}
                        onMouseLeave={e => e.currentTarget.style.background = `${to.color}22`}
                    >
                        Switch Route
                    </button>
                </div>
            </motion.div>
        </motion.div>
    );
}

// ══════════════════════════════════════════════════════════════════════════
// Real Leaflet Map Component
// ══════════════════════════════════════════════════════════════════════════
function LeafletMap({ routes, activeRoute, originCoords, destinationCoords, fromName, toName }) {
    const containerRef    = useRef(null);
    const mapRef          = useRef(null);
    const glowLayersRef   = useRef([]);  // [L.GeoJSON] – glow for each route
    const lineLayersRef   = useRef([]);  // [L.GeoJSON] – main line for each route
    const markersRef      = useRef([]);
    const activeRouteRef  = useRef(activeRoute);

    const [leafletReady,   setLeafletReady]   = useState(!!window.L);
    const [pendingRoute,   setPendingRoute]   = useState(null);   // index to switch to
    const [showWarning,    setShowWarning]    = useState(false);

    // ── Step 1: Inject Leaflet CSS + JS from CDN if not already loaded ──
    useEffect(() => {
        if (window.L) { setLeafletReady(true); return; }

        if (!document.getElementById("leaflet-css")) {
            const link = document.createElement("link");
            link.id  = "leaflet-css";
            link.rel = "stylesheet";
            link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
            document.head.appendChild(link);
        }

        if (!document.getElementById("leaflet-js")) {
            const script    = document.createElement("script");
            script.id       = "leaflet-js";
            script.src      = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
            script.onload   = () => setLeafletReady(true);
            document.head.appendChild(script);
        }
    }, []);

    // ── Step 2: Initialize map once ────────────────────────────────────
    useEffect(() => {
        if (!leafletReady || !containerRef.current || mapRef.current) return;
        const L = window.L;

        delete L.Icon.Default.prototype._getIconUrl;
        L.Icon.Default.mergeOptions({
            iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
            iconUrl:       "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
            shadowUrl:     "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
        });

        const map = L.map(containerRef.current, {
            zoomControl: false,
            attributionControl: true,
        }).setView([originCoords[0], originCoords[1]], 14);

        L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
            attribution: '© <a href="https://www.openstreetmap.org">OSM</a> © <a href="https://carto.com">CARTO</a>',
            subdomains: "abcd",
            maxZoom: 20,
        }).addTo(map);

        mapRef.current = map;
        return () => {
            map.remove();
            mapRef.current    = null;
            glowLayersRef.current  = [];
            lineLayersRef.current  = [];
            markersRef.current = [];
        };
    }, [leafletReady]); // eslint-disable-line react-hooks/exhaustive-deps

    // ── Step 3: Draw ALL 3 routes once when routes array changes ────────
    // This does NOT depend on activeRoute — restyling is done separately.
    useEffect(() => {
        if (!mapRef.current || !routes?.length || !leafletReady) return;
        const L   = window.L;
        const map = mapRef.current;
        const currentActive = activeRouteRef.current;

        // Remove old layers
        [...glowLayersRef.current, ...lineLayersRef.current].forEach((l) => map.removeLayer(l));
        glowLayersRef.current = [];
        lineLayersRef.current = [];
        markersRef.current.forEach((m) => map.removeLayer(m));
        markersRef.current = [];

        let allBounds = null;

        // Draw in z-order: red (bottom) → orange → green (top)
        const drawOrder = [2, 1, 0];
        drawOrder.forEach((idx) => {
            const route = routes[idx];
            if (!route?.geojson) return;

            const isActive = idx === currentActive;
            const style    = LEAFLET_ROUTE_STYLES[idx];
            const glowSt   = isActive ? GLOW_STYLE_ACTIVE   : GLOW_STYLE_INACTIVE;
            const lineSt   = isActive ? ROUTE_STYLE_ACTIVE  : ROUTE_STYLE_INACTIVE;

            // Glow / shadow layer
            const glowLayer = L.geoJSON(route.geojson, {
                style: {
                    color:     style.color,
                    weight:    glowSt.weight,
                    opacity:   glowSt.opacity,
                    lineCap:   "round",
                    lineJoin:  "round",
                },
            }).addTo(map);

            // Main route line
            const lineLayer = L.geoJSON(route.geojson, {
                style: {
                    color:    style.color,
                    weight:   lineSt.weight,
                    opacity:  lineSt.opacity,
                    lineCap:  "round",
                    lineJoin: "round",
                },
            }).addTo(map);

            // Tooltip
            lineLayer.bindTooltip(
                `<b style="color:${style.color}">${style.label}</b><br/>
                 ${route.distanceMeters >= 1609
                    ? `${(route.distanceMeters / 1609.34).toFixed(1)} mi`
                    : `${Math.round(route.distanceMeters * 3.281)} ft`
                 } · ${Math.round(route.durationSeconds / 60)} min`,
                { sticky: true, className: "sr-tooltip" }
            );

            glowLayersRef.current[idx] = glowLayer;
            lineLayersRef.current[idx] = lineLayer;

            if (!allBounds) allBounds = lineLayer.getBounds();
            else allBounds.extend(lineLayer.getBounds());
        });

        // Markers
        const originIcon = L.divIcon({
            className: "",
            html: `<div style="width:16px;height:16px;border-radius:50%;background:#22c55e;border:3px solid #fff;box-shadow:0 0 12px #22c55e99;"></div>`,
            iconSize: [16, 16], iconAnchor: [8, 8],
        });
        const destIcon = L.divIcon({
            className: "",
            html: `<div style="width:16px;height:16px;border-radius:50%;background:#3b82f6;border:3px solid #fff;box-shadow:0 0 12px #3b82f699;"></div>`,
            iconSize: [16, 16], iconAnchor: [8, 8],
        });

        const mOrigin = L.marker(originCoords,      { icon: originIcon }).addTo(map).bindPopup(`<b>Start:</b> ${fromName}`,       { className: "sr-popup" });
        const mDest   = L.marker(destinationCoords, { icon: destIcon   }).addTo(map).bindPopup(`<b>Destination:</b> ${toName}`, { className: "sr-popup" });
        markersRef.current = [mOrigin, mDest];

        if (allBounds) map.fitBounds(allBounds, { padding: [50, 50] });

    }, [routes, originCoords, destinationCoords, fromName, toName, leafletReady]); // eslint-disable-line react-hooks/exhaustive-deps

    // ── Step 4: Restyle layers when activeRoute changes (NO full redraw) ─
    useEffect(() => {
        activeRouteRef.current = activeRoute;
        if (!mapRef.current || !routes?.length) return;

        routes.forEach((_, idx) => {
            const glowLayer = glowLayersRef.current[idx];
            const lineLayer = lineLayersRef.current[idx];
            if (!glowLayer || !lineLayer) return;

            const isActive = idx === activeRoute;
            const glowSt   = isActive ? GLOW_STYLE_ACTIVE   : GLOW_STYLE_INACTIVE;
            const lineSt   = isActive ? ROUTE_STYLE_ACTIVE  : ROUTE_STYLE_INACTIVE;

            glowLayer.setStyle({ weight: glowSt.weight, opacity: glowSt.opacity });
            lineLayer.setStyle({ weight: lineSt.weight, opacity: lineSt.opacity });

            // Bring active layers to front
            if (isActive) {
                glowLayer.bringToFront();
                lineLayer.bringToFront();
            }
        });
    }, [activeRoute, routes]);

    // ── Zoom buttons ────────────────────────────────────────────────────
    const zoomIn  = () => mapRef.current?.zoomIn();
    const zoomOut = () => mapRef.current?.zoomOut();

    const primaryRoute = routes?.[0];

    // ── Warning: intercept route card clicks from the parent ─────────────
    // (We expose a ref-based API via window event for simplicity)
    useEffect(() => {
        const handleRouteClick = (e) => {
            const idx = e.detail?.routeIdx;
            if (idx === undefined || idx === activeRouteRef.current) return;
            setPendingRoute(idx);
            setShowWarning(true);
        };
        window.addEventListener("sr:routeCardClick", handleRouteClick);
        return () => window.removeEventListener("sr:routeCardClick", handleRouteClick);
    }, []);

    const confirmRouteChange = () => {
        if (pendingRoute !== null) {
            window.dispatchEvent(new CustomEvent("sr:routeConfirmed", { detail: { routeIdx: pendingRoute } }));
        }
        setShowWarning(false);
        setPendingRoute(null);
    };

    const cancelRouteChange = () => {
        setShowWarning(false);
        setPendingRoute(null);
    };

    return (
        <div style={{ width: "100%", height: "100%", position: "relative" }}>
            {/* Leaflet map container */}
            <div ref={containerRef} style={{ width: "100%", height: "100%" }} />

            {/* Loading overlay */}
            {!leafletReady && (
                <div style={{
                    position: "absolute", inset: 0, background: "#0d1117",
                    display: "flex", alignItems: "center", justifyContent: "center", zIndex: 999,
                }}>
                    <div style={{ textAlign: "center", color: "#64748b", fontSize: "0.85rem" }}>
                        <div style={{
                            width: "32px", height: "32px", borderRadius: "50%",
                            border: "3px solid rgba(59,130,246,0.3)", borderTopColor: "#3b82f6",
                            animation: "spin 0.8s linear infinite", margin: "0 auto 0.75rem",
                        }} />
                        Loading map…
                    </div>
                </div>
            )}

            {/* Warning overlay */}
            <AnimatePresence>
                {showWarning && pendingRoute !== null && (
                    <RouteChangeWarning
                        key="warning"
                        fromIdx={activeRoute}
                        toIdx={pendingRoute}
                        onConfirm={confirmRouteChange}
                        onCancel={cancelRouteChange}
                    />
                )}
            </AnimatePresence>

            {/* Custom zoom buttons */}
            <div style={{ position: "absolute", top: "1rem", right: "1rem", zIndex: 1000, display: "flex", flexDirection: "column", gap: "2px" }}>
                {[{ icon: <PlusIcon />, action: zoomIn }, { icon: <MinusIcon />, action: zoomOut }].map(({ icon, action }, i) => (
                    <button key={i} onClick={action} style={{
                        width: "32px", height: "32px",
                        background: "rgba(18,22,31,0.9)", border: "1px solid rgba(255,255,255,0.12)",
                        borderRadius: i === 0 ? "8px 8px 0 0" : "0 0 8px 8px",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        color: "#94a3b8", cursor: "pointer", backdropFilter: "blur(8px)",
                    }}>{icon}</button>
                ))}
            </div>

            {/* Route summary card — top left */}
            {primaryRoute && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4, duration: 0.4 }}
                    style={{
                        position: "absolute", top: "1rem", left: "1rem", zIndex: 1000,
                        background: "rgba(18,22,31,0.92)",
                        border: `1px solid ${LEAFLET_ROUTE_STYLES[activeRoute ?? 0].color}44`,
                        borderRadius: "12px", padding: "0.7rem 1rem",
                        backdropFilter: "blur(14px)", minWidth: "210px",
                        boxShadow: "0 4px 24px rgba(0,0,0,0.4)",
                    }}
                >
                    {/* From → To */}
                    <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "0.4rem" }}>
                        <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#22c55e", flexShrink: 0, boxShadow: "0 0 6px #22c55e" }} />
                        <span style={{ fontSize: "0.72rem", color: "#94a3b8", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{fromName}</span>
                    </div>
                    <div style={{ width: "1px", height: "10px", background: "linear-gradient(to bottom,#22c55e,#3b82f6)", marginLeft: "3.5px", marginBottom: "0.4rem" }} />
                    <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "0.65rem" }}>
                        <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#3b82f6", flexShrink: 0, boxShadow: "0 0 6px #3b82f6" }} />
                        <span style={{ fontSize: "0.72rem", color: "#94a3b8", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{toName}</span>
                    </div>

                    {/* 3-Route legend */}
                    <div style={{ borderTop: "1px solid rgba(255,255,255,0.07)", paddingTop: "0.55rem", display: "flex", flexDirection: "column", gap: "4px" }}>
                        <p style={{ margin: "0 0 5px", fontSize: "0.6rem", color: "#475569", textTransform: "uppercase", letterSpacing: "0.07em", fontWeight: 700 }}>Route Safety</p>
                        {LEAFLET_ROUTE_STYLES.map((s, idx) => {
                            const r = routes[idx];
                            const isAct = idx === (activeRoute ?? 0);
                            return (
                                <div key={idx} style={{
                                    display: "flex", alignItems: "center", gap: "7px",
                                    background: isAct ? `${s.color}12` : "transparent",
                                    borderRadius: "6px", padding: "2px 4px",
                                    border: isAct ? `1px solid ${s.color}30` : "1px solid transparent",
                                }}>
                                    <span style={{
                                        width: "22px", height: "4px", borderRadius: "2px",
                                        background: s.color, flexShrink: 0,
                                        boxShadow: isAct ? `0 0 6px ${s.color}` : "none",
                                    }} />
                                    <span style={{ fontSize: "0.7rem", color: isAct ? s.color : "#64748b", fontWeight: isAct ? 700 : 400, flex: 1 }}>{s.label}</span>
                                    {r && (
                                        <span style={{ fontSize: "0.63rem", color: "#475569", whiteSpace: "nowrap" }}>
                                            {Math.round(r.durationSeconds / 60)} min
                                        </span>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </motion.div>
            )}

            {/* Popup + tooltip styles */}
            <style>{`
        .sr-popup .leaflet-popup-content-wrapper {
          background: #12161f;
          color: #e2e8f0;
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 8px;
          font-family: 'Inter', sans-serif;
          font-size: 12px;
        }
        .sr-popup .leaflet-popup-tip { background: #12161f; }
        .sr-popup .leaflet-popup-content { margin: 6px 10px; }
        .sr-tooltip.leaflet-tooltip {
          background: rgba(18,22,31,0.95);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 8px;
          color: #e2e8f0;
          font-family: 'Inter', sans-serif;
          font-size: 12px;
          padding: 6px 10px;
          box-shadow: 0 4px 14px rgba(0,0,0,0.5);
        }
        .sr-tooltip.leaflet-tooltip::before { display: none; }
        .leaflet-control-attribution { font-size: 9px !important; opacity: 0.4; }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
        </div>
    );
}

// ══════════════════════════════════════════════════════════════════════════
// Decorative SVG Map (shown before route is searched)
// ══════════════════════════════════════════════════════════════════════════
function DecorativeMap({ activeRoute }) {
    const [showAnalysis, setShowAnalysis] = useState(true);
    const [animateDots, setAnimateDots] = useState(false);

    useEffect(() => {
        setAnimateDots(false);
        const t = setTimeout(() => setAnimateDots(true), 100);
        return () => clearTimeout(t);
    }, [activeRoute]);

    return (
        <div style={{
            width: "100%", height: "100%", position: "relative",
            background: "linear-gradient(160deg, #0f1923 0%, #0d1117 60%, #111827 100%)",
            overflow: "hidden", cursor: "grab",
        }}>
            <svg width="100%" height="100%" viewBox="0 0 1100 720"
                preserveAspectRatio="xMidYMid slice" style={{ position: "absolute", inset: 0 }}>
                <ellipse cx="200" cy="550" rx="130" ry="90" fill="rgba(20,50,30,0.25)" />
                <ellipse cx="900" cy="600" rx="80" ry="60" fill="rgba(20,50,30,0.2)" />
                <ellipse cx="750" cy="500" rx="60" ry="45" fill="rgba(20,50,30,0.18)" />
                {GRID_LINES.h.map((y) => <line key={`h${y}`} x1="340" y1={y} x2="1050" y2={y} stroke="rgba(255,255,255,0.04)" strokeWidth="1" />)}
                {GRID_LINES.v.map((x) => <line key={`v${x}`} x1={x} y1="140" x2={x} y2="680" stroke="rgba(255,255,255,0.04)" strokeWidth="1" />)}
                <line x1="340" y1="360" x2="1050" y2="360" stroke="rgba(255,255,255,0.08)" strokeWidth="2" />
                <line x1="650" y1="140" x2="650" y2="680" stroke="rgba(255,255,255,0.08)" strokeWidth="2" />
                <rect x="385" y="220" width="100" height="65" rx="4" fill="rgba(255,255,255,0.025)" />
                <rect x="510" y="220" width="120" height="65" rx="4" fill="rgba(255,255,255,0.025)" />
                <rect x="650" y="380" width="90" height="55"  rx="4" fill="rgba(255,255,255,0.03)" />
                <rect x="760" y="310" width="100" height="60" rx="4" fill="rgba(255,255,255,0.03)" />
                <rect x="420" y="495" width="80" height="50"  rx="4" fill="rgba(255,255,255,0.02)" />
                <rect x="540" y="505" width="90" height="45"  rx="4" fill="rgba(255,255,255,0.025)" />
                <rect x="700" y="490" width="75" height="50"  rx="4" fill="rgba(255,255,255,0.02)" />
                <rect x="820" y="480" width="85" height="55"  rx="4" fill="rgba(255,255,255,0.025)" />
                <rect x="370" y="560" width="200" height="100" rx="8" fill="rgba(20,60,35,0.3)" />
                {/* Routes */}
                <path d={ROUTE_PATHS[2]} fill="none" stroke={activeRoute === 2 ? "#ef4444" : "rgba(239,68,68,0.2)"}   strokeWidth={activeRoute === 2 ? 2.5 : 1.5} strokeLinecap="round" />
                <path d={ROUTE_PATHS[1]} fill="none" stroke={activeRoute === 1 ? "#f59e0b" : "rgba(245,158,11,0.25)"} strokeWidth={activeRoute === 1 ? 2.5 : 1.5} strokeLinecap="round" />
                {animateDots && GREEN_DOTS.map((dot, i) => (
                    <motion.circle key={i} cx={dot.x} cy={dot.y} r={activeRoute === 0 ? 4 : 2.5}
                        fill={activeRoute === 0 ? "#22c55e" : "rgba(34,197,94,0.35)"}
                        initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.04, duration: 0.25 }}
                        style={{ filter: activeRoute === 0 ? "drop-shadow(0 0 4px #22c55e)" : "none" }} />
                ))}
                {[{ cx: 630, cy: 330 }, { cx: 810, cy: 390 }].map(({ cx, cy }, i) => (
                    <g key={i}>
                        <circle cx={cx} cy={cy} r="8" fill="rgba(59,130,246,0.2)" />
                        <circle cx={cx} cy={cy} r="5" fill="#3b82f6" />
                    </g>
                ))}
                {[{ cx: 580, cy: 430 }, { cx: 720, cy: 410 }].map(({ cx, cy }, i) => (
                    <g key={i}>
                        <circle cx={cx} cy={cy} r="9" fill="none" stroke="#22c55e" strokeWidth="1.5" style={{ opacity: 0.4 }} />
                        <circle cx={cx} cy={cy} r="5" fill="#22c55e" />
                    </g>
                ))}
                <g>
                    <circle cx="870" cy="250" r="6" fill="#3b82f6" />
                    <circle cx="870" cy="250" r="10" fill="none" stroke="rgba(59,130,246,0.4)" strokeWidth="1.5">
                        <animate attributeName="r" values="10;16;10" dur="2s" repeatCount="indefinite" />
                        <animate attributeName="opacity" values="0.4;0;0.4" dur="2s" repeatCount="indefinite" />
                    </circle>
                </g>
                <g>
                    <circle cx="490" cy="430" r="8" fill="rgba(99,102,241,0.3)" />
                    <circle cx="490" cy="430" r="5" fill="#6366f1" />
                    <line x1="490" y1="438" x2="490" y2="445" stroke="#6366f1" strokeWidth="1.5" />
                </g>
            </svg>

            {/* You tooltip */}
            <div style={{
                position: "absolute", left: "calc(50% - 200px)", top: "calc(50% + 40px)",
                background: "#fff", color: "#0f172a", borderRadius: "8px", padding: "4px 10px",
                fontSize: "0.78rem", fontWeight: 600, boxShadow: "0 4px 14px rgba(0,0,0,0.4)",
                display: "flex", alignItems: "center", gap: "4px", pointerEvents: "none",
            }}>
                <svg width="10" height="10" viewBox="0 0 24 24" fill="#6366f1"><circle cx="12" cy="12" r="10" /></svg>
                You
            </div>

            {/* Destination badge */}
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }}
                style={{
                    position: "absolute", right: "0", top: "calc(50% - 130px)",
                    background: "#3b82f6", color: "#fff", borderRadius: "8px 0 0 8px",
                    padding: "6px 12px", fontSize: "0.76rem", fontWeight: 600,
                    display: "flex", alignItems: "center", gap: "5px",
                    boxShadow: "0 4px 14px rgba(59,130,246,0.4)",
                }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
                    <line x1="4" y1="22" x2="4" y2="15" stroke="currentColor" strokeWidth="2" />
                </svg>
                Destination
            </motion.div>

            {/* Prompt message */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                style={{
                    position: "absolute", top: "50%", left: "50%",
                    transform: "translate(-50%, -65%)", pointerEvents: "none", textAlign: "center",
                }}
            >
                <div style={{
                    background: "rgba(18,22,31,0.88)", border: "1px solid rgba(255,255,255,0.08)",
                    borderRadius: "12px", padding: "0.85rem 1.25rem", backdropFilter: "blur(12px)",
                    color: "#64748b", fontSize: "0.8rem", boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
                }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2"
                        style={{ display: "block", margin: "0 auto 0.4rem" }}>
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
                        <circle cx="12" cy="10" r="3" />
                    </svg>
                    Enter a starting point and destination<br />
                    <span style={{ color: "#3b82f6", fontWeight: 600 }}>to plan your safe route</span>
                </div>
            </motion.div>

            {/* Zoom controls */}
            <div style={{ position: "absolute", top: "1rem", right: "1rem", display: "flex", flexDirection: "column", gap: "2px" }}>
                {[{ icon: <PlusIcon /> }, { icon: <MinusIcon /> }].map(({ icon }, i) => (
                    <button key={i} style={{
                        width: "32px", height: "32px",
                        background: "rgba(18,22,31,0.85)", border: "1px solid rgba(255,255,255,0.1)",
                        borderRadius: i === 0 ? "8px 8px 0 0" : "0 0 8px 8px",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        color: "#94a3b8", cursor: "pointer", backdropFilter: "blur(8px)",
                    }}>{icon}</button>
                ))}
            </div>

            {/* Crime Density legend */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
                style={{
                    position: "absolute", bottom: "1rem", right: "1rem",
                    background: "rgba(18,22,31,0.85)", border: "1px solid rgba(255,255,255,0.08)",
                    borderRadius: "10px", padding: "0.7rem 0.9rem", backdropFilter: "blur(12px)", minWidth: "140px",
                }}>
                <p style={{ margin: "0 0 0.5rem", fontSize: "0.62rem", color: "#64748b", letterSpacing: "0.08em", textTransform: "uppercase", fontWeight: 700 }}>Crime Density</p>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.35rem" }}>
                    <span style={{ width: "16px", height: "3px", borderRadius: "2px", background: "#22c55e", display: "block" }} />
                    <span style={{ fontSize: "0.72rem", color: "#94a3b8" }}>High</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.35rem" }}>
                    <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#3b82f6", display: "block" }} />
                    <span style={{ fontSize: "0.72rem", color: "#94a3b8" }}>Police Station</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
                    <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#22c55e", display: "block", outline: "2px solid rgba(34,197,94,0.4)", outlineOffset: "1px" }} />
                    <span style={{ fontSize: "0.72rem", color: "#94a3b8" }}>Safe Haven</span>
                </div>
                <div>
                    <div style={{ height: "5px", borderRadius: "3px", background: "linear-gradient(to right, #1e3a2f, #22c55e, #f59e0b, #ef4444)", marginBottom: "2px" }} />
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <span style={{ fontSize: "0.6rem", color: "#475569" }}>Low</span>
                        <span style={{ fontSize: "0.6rem", color: "#475569" }}>High</span>
                    </div>
                </div>
            </motion.div>

            {/* Analysis card */}
            <AnimatePresence>
                {showAnalysis && (
                    <motion.div
                        initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 30 }} transition={{ delay: 0.3, duration: 0.4 }}
                        style={{
                            position: "absolute", bottom: "1rem", left: "50%", transform: "translateX(-50%)",
                            background: "rgba(18,22,31,0.92)", border: "1px solid rgba(255,255,255,0.08)",
                            borderRadius: "14px", padding: "0.85rem 1.1rem", backdropFilter: "blur(16px)",
                            maxWidth: "340px", width: "calc(100% - 2rem)",
                            display: "flex", gap: "0.75rem", alignItems: "flex-start",
                        }}
                    >
                        <div style={{
                            width: "36px", height: "36px", borderRadius: "10px",
                            background: "rgba(34,197,94,0.12)", border: "1px solid rgba(34,197,94,0.25)",
                            display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                        }}>
                            <CheckCircleIcon />
                        </div>
                        <div style={{ flex: 1 }}>
                            <p style={{ margin: "0 0 2px", fontSize: "0.85rem", fontWeight: 700, color: "#f1f5f9" }}>Path analysis complete</p>
                            <p style={{ margin: "0 0 0.5rem", fontSize: "0.74rem", color: "#64748b", lineHeight: 1.5 }}>
                                AI scored this route using FBI UCR crime data &amp; local PD incident reports. Conditions are optimal.
                            </p>
                            <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap" }}>
                                {["#911Coverage", "#WellLit", "#LowIncident"].map((tag) => (
                                    <span key={tag} style={{
                                        fontSize: "0.65rem", color: "#94a3b8",
                                        background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)",
                                        borderRadius: "5px", padding: "2px 7px",
                                    }}>{tag}</span>
                                ))}
                            </div>
                        </div>
                        <button onClick={() => setShowAnalysis(false)} style={{
                            background: "none", border: "none", color: "#475569", cursor: "pointer",
                            fontSize: "0.8rem", padding: "2px", lineHeight: 1, flexShrink: 0,
                        }}>✕</button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Route label overlay */}
            <motion.div key={activeRoute} initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}
                style={{
                    position: "absolute", top: "1rem", left: "1rem",
                    background: "rgba(18,22,31,0.8)", border: `1px solid ${ROUTE_COLORS[activeRoute]}44`,
                    borderRadius: "8px", padding: "5px 10px", fontSize: "0.72rem",
                    color: ROUTE_COLORS[activeRoute], fontWeight: 600, backdropFilter: "blur(8px)",
                }}>
                {["Main St & 5th Ave", "Broadway Blvd", "Industrial Ave"][activeRoute]} •{" "}
                <span style={{ color: "#64748b", fontWeight: 400 }}>
                    {["14 min · 0.8 mi", "11 min · 0.6 mi", "8 min · 0.5 mi"][activeRoute]}
                </span>
            </motion.div>
        </div>
    );
}

// ══════════════════════════════════════════════════════════════════════════
// Searching overlay
// ══════════════════════════════════════════════════════════════════════════
function SearchingOverlay() {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
                position: "absolute", inset: 0, zIndex: 50,
                background: "rgba(13,17,23,0.75)", backdropFilter: "blur(6px)",
                display: "flex", flexDirection: "column",
                alignItems: "center", justifyContent: "center", gap: "1rem",
            }}
        >
            <div style={{ position: "relative", width: "60px", height: "60px" }}>
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                    style={{
                        width: "60px", height: "60px", borderRadius: "50%",
                        border: "3px solid rgba(59,130,246,0.15)", borderTopColor: "#3b82f6",
                        position: "absolute",
                    }}
                />
                <motion.div
                    animate={{ rotate: -360 }}
                    transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                    style={{
                        width: "44px", height: "44px", borderRadius: "50%",
                        border: "2px solid rgba(99,102,241,0.2)", borderBottomColor: "#6366f1",
                        position: "absolute", top: "8px", left: "8px",
                    }}
                />
                <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="#3b82f6">
                        <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z" />
                    </svg>
                </div>
            </div>
            <div style={{ textAlign: "center" }}>
                <p style={{ margin: "0 0 4px", color: "#f1f5f9", fontSize: "0.9rem", fontWeight: 700 }}>
                    Analyzing route safety…
                </p>
                <p style={{ margin: 0, color: "#475569", fontSize: "0.76rem" }}>
                    Geocoding locations &amp; fetching safe paths
                </p>
            </div>
        </motion.div>
    );
}

// ══════════════════════════════════════════════════════════════════════════
// Main exported MapView
// ══════════════════════════════════════════════════════════════════════════
export default function MapView({ activeRoute, routeResult, isSearching }) {
    return (
        <div style={{ width: "100%", height: "100%", position: "relative" }}>
            <AnimatePresence>
                {isSearching && <SearchingOverlay key="searching" />}
            </AnimatePresence>

            {routeResult ? (
                <motion.div
                    key="real-map"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                    style={{ width: "100%", height: "100%" }}
                >
                    <LeafletMap
                        routes={routeResult.routes}
                        activeRoute={activeRoute}
                        originCoords={routeResult.originCoords}
                        destinationCoords={routeResult.destinationCoords}
                        fromName={routeResult.fromName}
                        toName={routeResult.toName}
                    />
                </motion.div>
            ) : (
                <motion.div
                    key="decorative-map"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.4 }}
                    style={{ width: "100%", height: "100%" }}
                >
                    <DecorativeMap activeRoute={activeRoute} />
                </motion.div>
            )}
        </div>
    );
}
