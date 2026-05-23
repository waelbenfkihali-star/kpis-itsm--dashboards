// hna module API helper li ykhdem b backend ta3 Django
// ykhalina nsebtiw requests b headers mta3 auth w refresh token
const API_BASE = "http://localhost:8001/api";
let refreshPromise = null;

// hna function li tjib URL kamel men base w path
export function getApiUrl(path = "") {
  return `${API_BASE}${path}`;
}

// hna function li tjib access token men localStorage
export function getAuthToken() {
  return localStorage.getItem("access");
}

// hna function li tjam3 headers mta3 request w token ida mawjouda
export function getAuthHeaders(extraHeaders = {}) {
  const token = getAuthToken();

  return {
    ...extraHeaders,
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

// hna function li tnahi tokens w tarj3i user l login ki session tkharb
function clearAuthAndRedirect() {
  localStorage.removeItem("access");
  localStorage.removeItem("refresh");
  window.location.replace("/login");
}

// hna function li tjarrab trefreshi access token b refresh token
async function refreshAccessToken() {
  const refresh = localStorage.getItem("refresh");

  if (!refresh) {
    throw new Error("No refresh token available.");
  }

  const response = await fetch(getApiUrl("/auth/token/refresh/"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh }),
  });

  const text = await response.text();
  const data = text ? JSON.parse(text) : {};

  if (!response.ok || !data?.access) {
    throw new Error(data?.detail || data?.error || "Token refresh failed.");
  }

  // hna n7afdou token jdida fl localStorage
  localStorage.setItem("access", data.access);
  if (data.refresh) {
    localStorage.setItem("refresh", data.refresh);
  }

  return data.access;
}

// hna function li tb3ath request l backend b token w tmanage refresh automatiquement
export async function apiFetch(path, options = {}) {
  const { headers, ...rest } = options;
  const doFetch = () =>
    fetch(getApiUrl(path), {
      ...rest,
      headers: getAuthHeaders(headers),
    });

  let response = await doFetch();

  if (response.status === 401) {
    try {
      refreshPromise ??= refreshAccessToken().finally(() => {
        refreshPromise = null;
      });
      await refreshPromise;
      response = await doFetch();
    } catch {
      clearAuthAndRedirect();
      throw new Error("Your session expired. Please sign in again.");
    }
  }

  if (response.status === 401) {
    clearAuthAndRedirect();
    throw new Error("Your session expired. Please sign in again.");
  }

  return response;
}

// hna function li tjib JSON response w tro7 error message iza response ghalet
export async function apiFetchJson(path, options = {}) {
  const response = await apiFetch(path, options);
  const text = await response.text();
  const data = text ? JSON.parse(text) : null;

  if (!response.ok) {
    const message = data?.detail || data?.error || `Request failed (HTTP ${response.status})`;
    throw new Error(message);
  }

  return data;
}

// hna function li tjib data user l current authenticated user
export function fetchCurrentUser() {
  return apiFetchJson("/auth/me/");
}
