const KEY = "kpis";

export function loadKpis() {
  try {
    return JSON.parse(localStorage.getItem(KEY) || "[]");
  } catch {
    return [];
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
  saveKpis(list);
}

export function deleteKpiById(id) {
  const list = loadKpis().filter((x) => String(x.id) !== String(id));
  saveKpis(list);
  return list;
}

export function getKpiById(id) {
  return loadKpis().find((x) => String(x.id) === String(id)) || null;
}