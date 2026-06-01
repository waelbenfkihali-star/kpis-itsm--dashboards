// hne fichier central mta3 API: menou nabniw URLs, nzidou token, نجددو session, w nرجعو responses بطريقة منظمة.
const API_BASE = "http://localhost:8001/api";
let refreshPromise = null;

// hne nركبو lien complet mta3 backend انطلاقًا من path sghira.
export function getApiUrl(path = "") {
  return `${API_BASE}${path}`;
}

// hne njibou access token elli t5aznet ba3d login.
export function getAuthToken() {
  return localStorage.getItem("access");
}

// hne n7adhrou headers mta3 request w nzidou Authorization ken token mawjouda.
export function getAuthHeaders(extraHeaders = {}) {
  const token = getAuthToken();

  return {
    ...extraHeaders,
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

// hne ken session tفسد, ننحو tokens w nرجعو user direct lel login.
function clearAuthAndRedirect() {
  localStorage.removeItem("access");
  localStorage.removeItem("refresh");
  window.location.replace("/login");
}

// hne ki access token توفى, نستعملو refresh token باش nجيبو access جديدة.
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

  // hne nثبتو اللي refresh نجحت w backend رجعت access token جديدة.
  if (!response.ok || !data?.access) {
    throw new Error(data?.detail || data?.error || "Token refresh failed.");
  }

  // hne nبدلو access القديمة بوحدة جديدة.
  localStorage.setItem("access", data.access);

  // hne ken backend رجعت refresh جديدة زادة, nحدثوها زادة.
  if (data.refresh) {
    localStorage.setItem("refresh", data.refresh);
  }

  return data.access;
}

// hne principale function elli أغلب pages تستعملها باش تكلم backend.
export async function apiFetch(path, options = {}) {
  const { headers, ...rest } = options;

  // hne helper sghir yبعث request بالheaders الصحيحة كل مرة.
  const doFetch = () =>
    fetch(getApiUrl(path), {
      ...rest,
      headers: getAuthHeaders(headers),
    });

  let response = await doFetch();

  // hne ken backend رجعت 401, يعني غالبًا access token ma3adech valid.
  if (response.status === 401) {
    try {
      refreshPromise ??= refreshAccessToken().finally(() => {
        refreshPromise = null;
      });

      await refreshPromise;

      // hne ba3d ma token تتجدد, يعاود نفس request مرة أخرى.
      response = await doFetch();
    } catch {
      clearAuthAndRedirect();
      throw new Error("Your session expired. Please sign in again.");
    }
  }

  // hne ken 401 بقات حتى ba3d refresh, معناها session سالات نهائيًا.
  if (response.status === 401) {
    clearAuthAndRedirect();
    throw new Error("Your session expired. Please sign in again.");
  }

  return response;
}

// hne wrapper فوق apiFetch: تقرى JSON مباشرة w ترجّع error message أوضح.
export async function apiFetchJson(path, options = {}) {
  const response = await apiFetch(path, options);

  const text = await response.text();
  const data = text ? JSON.parse(text) : null;

  // hne ken request فشلت, nرمو Error message مفهومة للpage اللي نادت function هاذي.
  if (!response.ok) {
    const message =
      data?.detail ||
      data?.error ||
      `Request failed (HTTP ${response.status})`;

    throw new Error(message);
  }

  return data;
}

// hne helper جاهز باش نجيبو current user من endpoint متاع auth.
export function fetchCurrentUser() {
  return apiFetchJson("/auth/me/");
}
