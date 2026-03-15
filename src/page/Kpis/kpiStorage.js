const KEY = "kpis";
const DELETED_KEY = "kpis_deleted";
import { defaultKpis, mergeWithDefaultKpis } from "./kpiCatalog";

function loadDeletedIds() {
  try {
    return JSON.parse(localStorage.getItem(DELETED_KEY) || "[]");
  } catch {
    return [];
  }
}

function saveDeletedIds(ids) {
  localStorage.setItem(DELETED_KEY, JSON.stringify(ids));
}

export function loadKpis() {
  try {
    const saved = JSON.parse(localStorage.getItem(KEY) || "[]");
    const deletedIds = new Set(loadDeletedIds());
    return mergeWithDefaultKpis(saved).filter((item) => !deletedIds.has(item.kpi_id));
  } catch {
    const deletedIds = new Set(loadDeletedIds());
    return defaultKpis.filter((item) => !deletedIds.has(item.kpi_id));
  }
}

export function saveKpis(list) {
  localStorage.setItem(KEY, JSON.stringify(list));
}

export function upsertKpi(kpi) {
  const list = loadKpis();
  const idx = list.findIndex((x) => String(x.id) === String(kpi.id));
  if (idx >= 0) list[idx] = kpi;
  else list.push(kpi);
  saveDeletedIds(loadDeletedIds().filter((id) => id !== kpi.kpi_id));
  saveKpis(list);
}

export function deleteKpiById(id) {
  const current = loadKpis();
  const deleted = current.find((x) => String(x.id) === String(id));
  const list = current.filter((x) => String(x.id) !== String(id));
  if (deleted?.kpi_id) {
    const deletedIds = new Set(loadDeletedIds());
    deletedIds.add(deleted.kpi_id);
    saveDeletedIds(Array.from(deletedIds));
  }
  saveKpis(list);
  return list;
}

export function getKpiById(id) {
  return loadKpis().find((x) => String(x.id) === String(id)) || null;
}
