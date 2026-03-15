export function getModulePath(moduleName) {
  const value = String(moduleName || "").toLowerCase();

  if (value.includes("incident")) return "/incidents";
  if (value.includes("request")) return "/requests";
  if (value.includes("change")) return "/changes";

  return "/mykpis";
}

export function getModuleLabel(moduleName) {
  const path = getModulePath(moduleName);

  if (path === "/incidents") return "Incidents";
  if (path === "/requests") return "Requests";
  if (path === "/changes") return "Changes";

  return "Module";
}
