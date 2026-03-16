const API_BASE = "http://localhost:8001/api";

export function getApiUrl(path = "") {
  return `${API_BASE}${path}`;
}

export function getAuthToken() {
  return localStorage.getItem("access");
}

export function getAuthHeaders(extraHeaders = {}) {
  const token = getAuthToken();

  return {
    ...extraHeaders,
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export async function apiFetch(path, options = {}) {
  const { headers, ...rest } = options;

  const response = await fetch(getApiUrl(path), {
    ...rest,
    headers: getAuthHeaders(headers),
  });

  if (response.status === 401) {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    window.location.replace("/login");
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

export function fetchCurrentUser() {
  return apiFetchJson("/auth/me/");
}
