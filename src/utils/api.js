// hne helpers mta3 l API: nabniw links, n3adiw token fil headers, na3mlou refresh session, w nmasikou errors.
const API_BASE = "http://localhost:8001/api";
let refreshPromise = null;

// hne function getApiUrl: ta9ra valeur mocht9a men data l 7aliya.
export function getApiUrl(path = "") {
  return `${API_BASE}${path}`;
}

// hne function getAuthToken: ta9ra valeur mocht9a men data l 7aliya.
export function getAuthToken() {
  return localStorage.getItem("access");
}

// hne function getAuthHeaders: ta9ra valeur mocht9a men data l 7aliya.
export function getAuthHeaders(extraHeaders = {}) {
  const token = getAuthToken();

  return {
    ...extraHeaders,
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

// hne function clearAuthAndRedirect: t3awen ba9i l code fil fichier hedha b logic sghira.
function clearAuthAndRedirect() {
  localStorage.removeItem("access");
  localStorage.removeItem("refresh");
  window.location.replace("/login");
}

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

  localStorage.setItem("access", data.access);
  if (data.refresh) {
    localStorage.setItem("refresh", data.refresh);
  }

  return data.access;
}

export async function apiFetch(path, options = {}) {
  const { headers, ...rest } = options;
  // hne function doFetch: t3awen ba9i l code fil fichier hedha b logic sghira.
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

// hne function fetchCurrentUser: tjib data men backend w ha b format tnajem l page ou.
export function fetchCurrentUser() {
  return apiFetchJson("/auth/me/");
}
