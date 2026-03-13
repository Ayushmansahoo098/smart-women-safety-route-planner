/**
 * routingService.js
 * 
 * Handles geocoding and route fetching using free, no-API-key services:
 *  - Geocoding:  Nominatim (OpenStreetMap)
 *  - Routing:    OSRM public demo server (walking profile)
 *
 * NOTE: These are public demo servers — for production use, host your own
 * or switch to a paid service (Google Maps / Mapbox).
 */

const NOMINATIM_URL = "https://nominatim.openstreetmap.org/search";
const OSRM_URL = "https://router.project-osrm.org/route/v1/foot";

/**
 * Geocode a free-text location string to [lat, lng].
 * @param {string} query  e.g. "Times Square, New York"
 * @returns {Promise<[number,number]>}  [lat, lng]
 */
export async function geocode(query) {
    const url = new URL(NOMINATIM_URL);
    url.searchParams.set("q", query);
    url.searchParams.set("format", "json");
    url.searchParams.set("limit", "1");
    url.searchParams.set("countrycodes", "us"); // Restrict to USA
    url.searchParams.set("accept-language", "en-US");

    const res = await fetch(url.toString(), {
        headers: { "Accept-Language": "en-US", "User-Agent": "SafeRouteApp/1.0" },
    });

    if (!res.ok) throw new Error(`Geocoding failed: ${res.statusText}`);

    const data = await res.json();
    if (!data.length) throw new Error(`Location not found in the US: "${query}". Try a full address or city name.`);

    return [parseFloat(data[0].lat), parseFloat(data[0].lon)];
}

/**
 * Fetch walking routes between two [lat,lng] pairs via OSRM.
 * Requests up to 3 alternatives so we can show green/orange/red routes.
 * @param {[number,number]} origin       [lat, lng]
 * @param {[number,number]} destination  [lat, lng]
 * @returns {{ routes: Array<{geojson, distanceMeters, durationSeconds}> }}
 */
export async function fetchRoute(origin, destination) {
    // OSRM expects coordinates as "lng,lat;lng,lat"
    const coords = `${origin[1]},${origin[0]};${destination[1]},${destination[0]}`;
    // Request up to 3 alternatives
    const url = `${OSRM_URL}/${coords}?overview=full&geometries=geojson&steps=false&alternatives=3`;

    const res = await fetch(url);
    if (!res.ok) throw new Error(`Routing service error: ${res.statusText}`);

    const data = await res.json();
    if (data.code !== "Ok" || !data.routes?.length) {
        throw new Error("No route found between these locations. Try reducing the distance.");
    }

    // Map all returned routes (1–4) to a consistent shape.
    // OSRM returns routes sorted by duration (fastest first).
    // We want: index 0 = "safest" (longest/most-used roads, green),
    //          index 1 = "moderate" (orange), index 2 = "fastest/risky" (red).
    // So reverse the order → longest route first.
    const osrmRoutes = [...data.routes].reverse();

    const routes = osrmRoutes.map((r) => ({
        geojson: r.geometry,
        distanceMeters: r.distance,
        durationSeconds: r.duration,
    }));

    // Pad to exactly 3 entries (duplicate last if OSRM returned fewer alternatives)
    while (routes.length < 3) {
        routes.push({ ...routes[routes.length - 1] });
    }

    return { routes: routes.slice(0, 3) };
}

/**
 * High-level helper: geocode both endpoints + fetch route.
 * Saves the result to localStorage for "last searched route".
 *
 * @param {string} fromText
 * @param {string} toText
 * @returns {Promise<{
 *   geojson, originCoords, destinationCoords,
 *   fromName, toName,
 *   distanceMeters, durationSeconds
 * }>}
 */
export async function planRoute(fromText, toText) {
    // Run geocoding in parallel
    const [originCoords, destinationCoords] = await Promise.all([
        geocode(fromText),
        geocode(toText),
    ]);

    const { routes } = await fetchRoute(originCoords, destinationCoords);

    // Primary route (index 0 = safest = green) for backward compat fields
    const primary = routes[0];

    const result = {
        // All 3 routes: [green/safest, orange/moderate, red/fastest-risky]
        routes,
        // Backward-compat primary fields
        geojson: primary.geojson,
        originCoords,
        destinationCoords,
        fromName: fromText,
        toName: toText,
        distanceMeters: primary.distanceMeters,
        durationSeconds: primary.durationSeconds,
    };

    // Persist for "New Search" pre-fill
    try {
        localStorage.setItem("sr_last_route", JSON.stringify({ from: fromText, to: toText }));
    } catch (_) { /* storage full or unavailable */ }

    return result;
}
