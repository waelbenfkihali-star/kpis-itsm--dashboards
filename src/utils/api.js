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

