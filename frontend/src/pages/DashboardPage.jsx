/**
 * DashboardPage.jsx
 * Main Safe Route dashboard — assembles Navbar, Sidebar, and MapView.
 * Route search state lives here and is passed down to MapView (real Leaflet)
 * and AIRiskBreakdown.
 */

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { clearAuthToken } from "../utils/authStorage";
import { planRoute } from "../services/routingService";

// ── Sub-components ─────────────────────────────────────────────────────
import Navbar from "../components/dashboard/Navbar";
import RouteInputs from "../components/dashboard/RouteInputs";
import RouteIntelligence from "../components/dashboard/RouteIntelligence";
import AIRiskBreakdown from "../components/dashboard/AIRiskBreakdown";
import MapView from "../components/dashboard/MapView";
import EmergencyButton from "../components/dashboard/EmergencyButton";

export default function DashboardPage() {
  const navigate = useNavigate();

  // ── Route selection (decorative sidebar cards) ──────────────────────
  const [activeRoute, setActiveRoute] = useState(0);

  // ── Location text state (shared Navbar ↔ RouteInputs) ───────────────
  const [fromLocation, setFromLocation] = useState("");
  const [toLocation, setToLocation] = useState("");

  // ── Real route search state ──────────────────────────────────────────
  const [routeResult, setRouteResult] = useState(null); // null = decorative map
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState(null);

  const handleLogout = () => {
    clearAuthToken();
    navigate("/login", { replace: true });
  };

  // ── Search handler: geocode + fetch OSRM route ───────────────────────
  const handleSearch = async (from, to) => {
    setIsSearching(true);
    setSearchError(null);
    setRouteResult(null);
    try {
      const result = await planRoute(from, to);
      setRouteResult(result);
    } catch (err) {
      setSearchError(err.message || "Could not find a route. Please try again.");
    } finally {
      setIsSearching(false);
    }
  };

  // ── Reset to decorative map ──────────────────────────────────────────
  const handleReset = () => {
    setRouteResult(null);
    setSearchError(null);
  };

  return (
    <div
      className="flex flex-col h-screen overflow-hidden"
      style={{ background: "#0d1117", fontFamily: "'Inter', 'Segoe UI', sans-serif" }}
    >
      {/* ── Top Navbar ── */}
      <Navbar
        fromLocation={fromLocation}
        setFromLocation={setFromLocation}
        toLocation={toLocation}
        setToLocation={setToLocation}
        onLogout={handleLogout}
      />

      {/* ── Body: Sidebar + Map ── */}
      <div className="flex flex-1 overflow-hidden">
        {/* ── Left Sidebar ── */}
        <motion.aside
          initial={{ x: -40, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          style={{
            width: "320px",
            minWidth: "320px",
            background: "#12161f",
            borderRight: "1px solid rgba(255,255,255,0.07)",
            display: "flex",
            flexDirection: "column",
            overflowY: "auto",
            overflowX: "hidden",
            gap: 0,
          }}
        >
          {/* Route search card */}
          <RouteInputs
            from={fromLocation}
            setFrom={setFromLocation}
            to={toLocation}
            setTo={setToLocation}
            onSearch={handleSearch}
            isLoading={isSearching}
            hasResult={!!routeResult}
            onReset={handleReset}
            error={searchError}
          />

          {/* Route intelligence cards */}
          <RouteIntelligence activeRoute={activeRoute} setActiveRoute={setActiveRoute} />

          {/* AI Risk Breakdown gauge */}
          <AIRiskBreakdown activeRoute={activeRoute} />

          {/* SOS Emergency button */}
          <EmergencyButton />
        </motion.aside>

        {/* ── Map Area ── */}
        <div className="flex-1 relative overflow-hidden">
          <MapView
            activeRoute={activeRoute}
            routeResult={routeResult}
            isSearching={isSearching}
          />
        </div>
      </div>
    </div>
  );
}
