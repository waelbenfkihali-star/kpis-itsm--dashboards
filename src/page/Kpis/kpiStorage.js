// hne logic stockage mta3 KPIs fil localStorage: load, validate, update, delete, w merge m3a default KPIs.
import { defaultKpis, mergeWithDefaultKpis } from "./kpiCatalog";

const KEY = "kpis";
const DELETED_KEY = "kpis_deleted";
const CATALOG_VERSION_KEY = "kpis_catalog_version";
const CATALOG_VERSION = "2026-03-15-inc-req-chg";

// hne function loadDeletedIds: tchargi data wala context l lazem 9bal ma page taffichi contenu s7i7.
function loadDeletedIds() {
  try {
    return JSON.parse(localStorage.getItem(DELETED_KEY) || "[]");
  } catch {
    return [];
  }
}

// hne function saveDeletedIds: t3awen ba9i l code fil fichier hedha b logic sghira.
function saveDeletedIds(ids) {
  localStorage.setItem(DELETED_KEY, JSON.stringify(ids));
}

// hne function syncCatalogVersion: t3awen ba9i l code fil fichier hedha b logic sghira.
function syncCatalogVersion() {
  const savedVersion = localStorage.getItem(CATALOG_VERSION_KEY);

  if (savedVersion !== CATALOG_VERSION) {
    localStorage.setItem(CATALOG_VERSION_KEY, CATALOG_VERSION);
    saveDeletedIds([]);
  }
}

// hne function loadKpis: tchargi data wala context l lazem 9bal ma page taffichi contenu s7i7.
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

// hne function saveKpis: t3awen ba9i l code fil fichier hedha b logic sghira.
export function saveKpis(list) {
  localStorage.setItem(KEY, JSON.stringify(list));
}

// hne function validateKpi: t3awen ba9i l code fil fichier hedha b logic sghira.
export function validateKpi(form) {
  const current = loadKpis();
  const kpiId = String(form.kpi_id || "").trim();
  const name = String(form.name || "").trim();

  if (!kpiId || !name || !String(form.owner || "").trim() || !String(form.module || "").trim()) {
    return "Veuillez renseigner tous les champs obligatoires : KPI ID, nom, propriétaire et module.";
  }

  // hne function duplicateKpiId: t3awen ba9i l code fil fichier hedha b logic sghira.
  const duplicateKpiId = current.find((item) =>
    String(item.kpi_id || "").trim().toLowerCase() === kpiId.toLowerCase() &&
    String(item.id) !== String(form.id)
  );
  if (duplicateKpiId) {
    return `Échec de l’ajout du KPI : l’identifiant KPI "${kpiId}" est déjà utilisé.`;
  }

  // hne function duplicateName: t3awen ba9i l code fil fichier hedha b logic sghira.
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

// hne function upsertKpi: t3awen ba9i l code fil fichier hedha b logic sghira.
export function upsertKpi(kpi) {
  const list = loadKpis();
  // hne function idx: t3awen ba9i l code fil fichier hedha b logic sghira.
  const idx = list.findIndex((x) => String(x.id) === String(kpi.id));
  if (idx >= 0) list[idx] = kpi;
  else list.push(kpi);
  saveDeletedIds(loadDeletedIds().filter((id) => id !== kpi.kpi_id));
  saveKpis(list);
}

// hne function deleteKpiById: t3awen ba9i l code fil fichier hedha b logic sghira.
export function deleteKpiById(id) {
  const current = loadKpis();
  // hne function deleted: t3awen ba9i l code fil fichier hedha b logic sghira.
  const deleted = current.find((x) => String(x.id) === String(id));
  // hne function list: t3awen ba9i l code fil fichier hedha b logic sghira.
  const list = current.filter((x) => String(x.id) !== String(id));
  if (deleted?.kpi_id) {
    const deletedIds = new Set(loadDeletedIds());
    deletedIds.add(deleted.kpi_id);
    saveDeletedIds(Array.from(deletedIds));
  }
  saveKpis(list);
  return list;
}

// hne function getKpiById: ta9ra valeur mocht9a men data l 7aliya.
export function getKpiById(id) {
  return loadKpis().find((x) => String(x.id) === String(id)) || null;
}
