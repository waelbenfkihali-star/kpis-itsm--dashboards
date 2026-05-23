// hna storage helper li y7adhhir Kpis fl localStorage
import { defaultKpis, mergeWithDefaultKpis } from "./kpiCatalog";

const KEY = "kpis";
const DELETED_KEY = "kpis_deleted";
const CATALOG_VERSION_KEY = "kpis_catalog_version";
const CATALOG_VERSION = "2026-03-15-inc-req-chg";

// hna function loadDeletedIds li tload data w troje3 response
function loadDeletedIds() {
  try {
    return JSON.parse(localStorage.getItem(DELETED_KEY) || "[]");
  } catch {
    return [];
  }
}

// hna function saveDeletedIds li tperform helper logic
function saveDeletedIds(ids) {
  localStorage.setItem(DELETED_KEY, JSON.stringify(ids));
}

// hna function syncCatalogVersion li tperform helper logic
function syncCatalogVersion() {
  const savedVersion = localStorage.getItem(CATALOG_VERSION_KEY);

  if (savedVersion !== CATALOG_VERSION) {
    localStorage.setItem(CATALOG_VERSION_KEY, CATALOG_VERSION);
    saveDeletedIds([]);
  }
}

// hna function loadKpis li tload data w troje3 response
export function loadKpis() {
  syncCatalogVersion();

  try {
    const saved = JSON.parse(localStorage.getItem(KEY) || "[]");
    const deletedIds = new Set(loadDeletedIds());
    return mergeWithDefaultKpis(saved).filter((item) => !deletedIds.has(item.kpi_id));
  } catch {
    const deletedIds = new Set(loadDeletedIds());
    return defaultKpis.filter((item) => !deletedIds.has(item.kpi_id));
  }
}

// hna function saveKpis li tperform helper logic
export function saveKpis(list) {
  localStorage.setItem(KEY, JSON.stringify(list));
}

// hna function validateKpi li tperform helper logic
export function validateKpi(form) {
  const current = loadKpis();
  const kpiId = String(form.kpi_id || "").trim();
  const name = String(form.name || "").trim();

  if (!kpiId || !name || !String(form.owner || "").trim() || !String(form.module || "").trim()) {
    return "Veuillez renseigner tous les champs obligatoires : KPI ID, nom, propriétaire et module.";
  }

    // hna function duplicateKpiId li tperform helper logic
  const duplicateKpiId = current.find((item) =>
    String(item.kpi_id || "").trim().toLowerCase() === kpiId.toLowerCase() &&
    String(item.id) !== String(form.id)
  );
  if (duplicateKpiId) {
    return `Échec de l’ajout du KPI : l’identifiant KPI "${kpiId}" est déjà utilisé.`;
  }

    // hna function duplicateName li tperform helper logic
  const duplicateName = current.find((item) =>
    String(item.name || "").trim().toLowerCase() === name.toLowerCase() &&
    String(item.id) !== String(form.id)
  );
  if (duplicateName) {
    return `Échec de l’ajout du KPI : le nom "${name}" est déjà utilisé.`;
  }

  if (String(form.target || "").match(/-\s*\d+/)) {
    return "Échec de l’ajout du KPI : le seuil doit être un nombre positif.";
  }

  return "";
}

// hna function upsertKpi li tperform helper logic
export function upsertKpi(kpi) {
  const list = loadKpis();
    // hna function idx li tperform helper logic
  const idx = list.findIndex((x) => String(x.id) === String(kpi.id));
  if (idx >= 0) list[idx] = kpi;
  else list.push(kpi);
  saveDeletedIds(loadDeletedIds().filter((id) => id !== kpi.kpi_id));
  saveKpis(list);
}

// hna function deleteKpiById li tperform helper logic
export function deleteKpiById(id) {
  const current = loadKpis();
    // hna function deleted li tperform helper logic
  const deleted = current.find((x) => String(x.id) === String(id));
    // hna function list li tperform helper logic
  const list = current.filter((x) => String(x.id) !== String(id));
  if (deleted?.kpi_id) {
    const deletedIds = new Set(loadDeletedIds());
    deletedIds.add(deleted.kpi_id);
    saveDeletedIds(Array.from(deletedIds));
  }
  saveKpis(list);
  return list;
}

// hna function getKpiById li tqra w troje3 value
export function getKpiById(id) {
  return loadKpis().find((x) => String(x.id) === String(id)) || null;
}
