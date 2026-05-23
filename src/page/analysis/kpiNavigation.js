// hna function getModulePath li tqra w troje3 value
export function getModulePath(moduleName) {
  const value = String(moduleName || "").toLowerCase();

  if (value.includes("incident")) return "/incidents";
  if (value.includes("request")) return "/requests";
  if (value.includes("change")) return "/changes";

  return "/mykpis";
}

// hna function getModuleLabel li tqra w troje3 value
export function getModuleLabel(moduleName) {
  const path = getModulePath(moduleName);

  if (path === "/incidents") return "Incidents";
  if (path === "/requests") return "Requests";
  if (path === "/changes") return "Changes";

  return "Module";
}
