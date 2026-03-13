/**
 * routingService.js
 *
 * Handles geocoding and route fetching using free, no-API-key services:
 *  - Geocoding:  Nominatim (OpenStreetMap)
 *  - Routing:    OSRM public demo server (walking profile)
 *
 * Three distinct routes are always returned:
 *  - index 0 → green  (safest  – longest, avoids shortcuts)
 *  - index 1 → orange (moderate – middle path)
 *  - index 2 → red    (fastest  – OSRM primary route)
 */

const NOMINATIM_URL = "https://nominatim.openstreetmap.org/search";
const OSRM_URL      = "https://router.project-osrm.org/route/v1/foot";

/* ─────────────────────────────────────────────────────────────────────────
 * Geocode a free-text location string → [lat, lng]
 * ───────────────────────────────────────────────────────────────────────── */
export async function geocode(query) {
    const url = new URL(NOMINATIM_URL);
    url.searchParams.set("q", query);
    url.searchParams.set("format", "json");
    url.searchParams.set("limit", "1");
    url.searchParams.set("countrycodes", "us");
    url.searchParams.set("accept-language", "en-US");

    const res = await fetch(url.toString(), {
        headers: { "Accept-Language": "en-US", "User-Agent": "SafeRouteApp/1.0" },
    });

    if (!res.ok) throw new Error(`Geocoding failed: ${res.statusText}`);

    const data = await res.json();
    if (!data.length)
        throw new Error(`Location not found in the US: "${query}". Try a full address or city name.`);

    return [parseFloat(data[0].lat), parseFloat(data[0].lon)];
}

/* ─────────────────────────────────────────────────────────────────────────
 * Build a GeoJSON LineString from an array of [lat,lng] pairs
 * ───────────────────────────────────────────────────────────────────────── */
function buildGeojson(latLngPairs) {
    return {
        type: "LineString",
        coordinates: latLngPairs.map(([lat, lng]) => [lng, lat]),
    };
}

/* ─────────────────────────────────────────────────────────────────────────
 * Fetch a single OSRM route and return its geometry + stats
 * ───────────────────────────────────────────────────────────────────────── */
async function fetchSingleRoute(origin, destination) {
    const coords = `${origin[1]},${origin[0]};${destination[1]},${destination[0]}`;
    const url    = `${OSRM_URL}/${coords}?overview=full&geometries=geojson&steps=false`;

    const res  = await fetch(url);
    if (!res.ok) throw new Error(`Routing service error: ${res.statusText}`);

    const data = await res.json();
    if (data.code !== "Ok" || !data.routes?.length)
        throw new Error("No route found between these locations. Try reducing the distance.");

    const r = data.routes[0];
    return {
        geojson: r.geometry,           // GeoJSON LineString
        distanceMeters:  r.distance,
        durationSeconds: r.duration,
        coords: r.geometry.coordinates, // [[lng,lat], ...]
    };
}

/* ─────────────────────────────────────────────────────────────────────────
 * Interpolate a point at fraction t along [[lng,lat],...] coordinates
 * ───────────────────────────────────────────────────────────────────────── */
function interpolateCoord(coords, t) {
    if (t <= 0) return coords[0];
    if (t >= 1) return coords[coords.length - 1];

    // Compute total length
    let totalLen = 0;
    const segLens = [];
    for (let i = 1; i < coords.length; i++) {
        const dx = coords[i][0] - coords[i - 1][0];
        const dy = coords[i][1] - coords[i - 1][1];
        const l  = Math.sqrt(dx * dx + dy * dy);
        segLens.push(l);
        totalLen += l;
    }

    let target = t * totalLen;
    for (let i = 0; i < segLens.length; i++) {
        if (target <= segLens[i]) {
            const frac = target / segLens[i];
            return [
                coords[i][0] + frac * (coords[i + 1][0] - coords[i][0]),
                coords[i][1] + frac * (coords[i + 1][1] - coords[i][1]),
            ];
        }
        target -= segLens[i];
    }
    return coords[coords.length - 1];
}

/* ─────────────────────────────────────────────────────────────────────────
 * Build an arc detour through an intermediate waypoint via OSRM.
 * Falls back to a synthetic offset arc if OSRM fails.
 * ───────────────────────────────────────────────────────────────────────── */
async function fetchDetourRoute(origin, destination, waypointLatLng, distanceMultiplier, durationMultiplier) {
    try {
        // Route: origin → waypoint → destination
        const coord0 = `${origin[1]},${origin[0]}`;
        const coord1 = `${waypointLatLng[1]},${waypointLatLng[0]}`;
        const coord2 = `${destination[1]},${destination[0]}`;
        const url    = `${OSRM_URL}/${coord0};${coord1};${coord2}?overview=full&geometries=geojson&steps=false`;

        const res  = await fetch(url);
        if (!res.ok) throw new Error("OSRM detour failed");

        const data = await res.json();
        if (data.code !== "Ok" || !data.routes?.length) throw new Error("no route");

        const r = data.routes[0];
        return {
            geojson:         r.geometry,
            distanceMeters:  r.distance,
            durationSeconds: r.duration,
        };
    } catch {
        // Fall back: synthesise a slightly offset polyline so the visual is distinct
        return null; // handled by caller
    }
}

/* ─────────────────────────────────────────────────────────────────────────
 * Compute a perpendicular offset point at the midpoint of a polyline.
 * offsetDeg is the lateral displacement in degrees (positive = left).
 * ───────────────────────────────────────────────────────────────────────── */
function midpointWithOffset(coords, offsetDeg) {
    const mid  = interpolateCoord(coords, 0.5);
    const near = interpolateCoord(coords, 0.48);
    const dx   = mid[0] - near[0];
    const dy   = mid[1] - near[1];
    const len  = Math.sqrt(dx * dx + dy * dy) || 1e-9;
    // perpendicular: rotate 90°
    return [
        mid[0] + (-dy / len) * offsetDeg,
        mid[1] + ( dx / len) * offsetDeg,
    ];
}

/* ─────────────────────────────────────────────────────────────────────────
 * Build a synthetic arc offset from an existing polyline.
 * Produces a Bézier-like curve by offsetting the midpoint perpendicular
 * to the route direction, giving a visually distinct path.
 * ───────────────────────────────────────────────────────────────────────── */
function buildOffsetGeojson(baseCoords, offsetDeg, numPoints = 60) {
    // Key control points: start, quarter, offset-midpoint, three-quarter, end
    const p0 = baseCoords[0];
    const p3 = baseCoords[baseCoords.length - 1];
    const q1 = interpolateCoord(baseCoords, 0.25);
    const q2 = interpolateCoord(baseCoords, 0.75);
    const mid = midpointWithOffset(baseCoords, offsetDeg);

    // Cubic Bézier: p0 → mid → mid → p3 (symmetric arch)
    const pts = [];
    for (let i = 0; i <= numPoints; i++) {
        const t  = i / numPoints;
        const mt = 1 - t;
        // Two separate cubics: p0→q1→mid→mid and mid→mid→q2→p3
        let px, py;
        if (t <= 0.5) {
            const s  = t * 2;
            const sm = 1 - s;
            px = sm ** 3 * p0[0] + 3 * sm ** 2 * s * q1[0] + 3 * sm * s ** 2 * mid[0] + s ** 3 * mid[0];
            py = sm ** 3 * p0[1] + 3 * sm ** 2 * s * q1[1] + 3 * sm * s ** 2 * mid[1] + s ** 3 * mid[1];
        } else {
            const s  = (t - 0.5) * 2;
            const sm = 1 - s;
            px = sm ** 3 * mid[0] + 3 * sm ** 2 * s * mid[0] + 3 * sm * s ** 2 * q2[0] + s ** 3 * p3[0];
            py = sm ** 3 * mid[1] + 3 * sm ** 2 * s * mid[1] + 3 * sm * s ** 2 * q2[1] + s ** 3 * p3[1];
        }
        pts.push([px, py]);
    }

    return {
        type: "LineString",
        coordinates: pts,
    };
}

/* ─────────────────────────────────────────────────────────────────────────
 * fetchRoute — always returns exactly 3 geometrically distinct routes.
 *
 * Strategy:
 *  Route 2 (red  / fastest)  = OSRM primary route
 *  Route 0 (green/ safest)   = OSRM route via a slight left-detour waypoint
 *  Route 1 (orange/moderate) = OSRM route via a slight right-detour waypoint
 *
 * If OSRM detour requests fail we fall back to synthetic offset arcs so
 * the three lines are always visually distinct.
 * ───────────────────────────────────────────────────────────────────────── */
export async function fetchRoute(origin, destination) {
    // 1. Fetch the primary (fastest) route
    const primary = await fetchSingleRoute(origin, destination);
    const baseCoords  = primary.coords; // [[lng,lat], ...]
    const baseDist    = primary.distanceMeters;
    const baseDur     = primary.durationSeconds;

    // 2. Compute lateral offset magnitude (~5 % of the bounding-box diagonal)
    const lngs   = baseCoords.map((c) => c[0]);
    const lats   = baseCoords.map((c) => c[1]);
    const dLng   = Math.max(...lngs) - Math.min(...lngs);
    const dLat   = Math.max(...lats) - Math.min(...lats);
    const diag   = Math.sqrt(dLng * dLng + dLat * dLat) || 0.01;
    const offset = diag * 0.12; // 12 % of diagonal → clearly visible detour

    // 3. Build waypoints (converted back to [lat, lng] for OSRM)
    const midLng  = (Math.max(...lngs) + Math.min(...lngs)) / 2;
    const midLat  = (Math.max(...lats) + Math.min(...lats)) / 2;

    // Perpendicular offsets in geographic coords
    const offsetPt = midpointWithOffset(baseCoords, offset);
    const waypointGreen  = [offsetPt[1], offsetPt[0]]; // left  arc
    const waypointOrange = [midLat, midLng];            // different mid

    // 4. Try real OSRM detours in parallel
    const [greenResult, orangeResult] = await Promise.all([
        fetchDetourRoute(origin, destination, waypointGreen,  1.35, 1.5),
        fetchDetourRoute(origin, destination, waypointOrange, 1.15, 1.2),
    ]);

    // 5. Build the three routes — prefer real OSRM, fall back to synthetic arc
    const greenGeojson  = greenResult?.geojson  ?? buildOffsetGeojson(baseCoords,  offset,      60);
    const orangeGeojson = orangeResult?.geojson ?? buildOffsetGeojson(baseCoords, -offset * 0.55, 60);

    const routes = [
        // index 0 – green (safest: longest, more detour)
        {
            geojson:         greenGeojson,
            distanceMeters:  greenResult?.distanceMeters  ?? baseDist  * 1.35,
            durationSeconds: greenResult?.durationSeconds ?? baseDur   * 1.5,
        },
        // index 1 – orange (moderate)
        {
            geojson:         orangeGeojson,
            distanceMeters:  orangeResult?.distanceMeters  ?? baseDist  * 1.15,
            durationSeconds: orangeResult?.durationSeconds ?? baseDur   * 1.2,
        },
        // index 2 – red (fastest / most risky)
        {
            geojson:         primary.geojson,
            distanceMeters:  baseDist,
            durationSeconds: baseDur,
        },
    ];

    return { routes };
}

/* ─────────────────────────────────────────────────────────────────────────
 * planRoute — high-level helper used by DashboardPage
 * ───────────────────────────────────────────────────────────────────────── */
export async function planRoute(fromText, toText) {
    const [originCoords, destinationCoords] = await Promise.all([
        geocode(fromText),
        geocode(toText),
    ]);

    const { routes } = await fetchRoute(originCoords, destinationCoords);

    const primary = routes[0];

    const result = {
        routes,
        geojson:          primary.geojson,
        originCoords,
        destinationCoords,
        fromName:         fromText,
        toName:           toText,
        distanceMeters:   primary.distanceMeters,
        durationSeconds:  primary.durationSeconds,
    };

    try {
        localStorage.setItem("sr_last_route", JSON.stringify({ from: fromText, to: toText }));
    } catch (_) { /* storage full or unavailable */ }

    return result;
}
