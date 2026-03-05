function decodeBase64Url(value) {
  const base64 = value.replace(/-/g, "+").replace(/_/g, "/");
  const padding = (4 - (base64.length % 4)) % 4;
  const padded = `${base64}${"=".repeat(padding)}`;
  return atob(padded);
}

export function parseToken(token) {
  if (!token || token.split(".").length !== 3) {
    return null;
  }

  try {
    const payload = token.split(".")[1];
    return JSON.parse(decodeBase64Url(payload));
  } catch {
    return null;
  }
}

export function isTokenValid(token) {
  const payload = parseToken(token);

  if (!payload || typeof payload.exp !== "number") {
    return false;
  }

  return payload.exp * 1000 > Date.now();
}
