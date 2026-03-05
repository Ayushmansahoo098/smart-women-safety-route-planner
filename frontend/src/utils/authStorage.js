const LOCAL_TOKEN_KEY = "token";
const SESSION_TOKEN_KEY = "sessionToken";
const REMEMBER_ME_KEY = "rememberMe";

export function setAuthToken(token, rememberMe) {
  if (rememberMe) {
    localStorage.setItem(LOCAL_TOKEN_KEY, token);
    sessionStorage.removeItem(SESSION_TOKEN_KEY);
    localStorage.setItem(REMEMBER_ME_KEY, "true");
  } else {
    sessionStorage.setItem(SESSION_TOKEN_KEY, token);
    localStorage.removeItem(LOCAL_TOKEN_KEY);
    localStorage.setItem(REMEMBER_ME_KEY, "false");
  }
}

export function getAuthToken() {
  return localStorage.getItem(LOCAL_TOKEN_KEY) || sessionStorage.getItem(SESSION_TOKEN_KEY);
}

export function clearAuthToken() {
  localStorage.removeItem(LOCAL_TOKEN_KEY);
  sessionStorage.removeItem(SESSION_TOKEN_KEY);
  localStorage.removeItem(REMEMBER_ME_KEY);
}
