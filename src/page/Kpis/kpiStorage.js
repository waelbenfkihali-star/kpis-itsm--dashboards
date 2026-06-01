// hne logic stockage mta3 KPIs via backend API: load, validate, create, update, w delete.
import { apiFetchJson } from "../../utils/api";

// hne path principal mta3 KPI endpoints fil backend.
const KPI_API = "/kpis/";
const LEGACY_KEY = "kpis";
const LEGACY_DELETED_KEY = "kpis_deleted";
const LEGACY_MIGRATED_KEY = "kpis_backend_migrated";
let migrationPromise = null;

// hne n7adhrou payload clean men form data bach backend t9belha kif ma يلزم.
function normalizeKpiPayload(kpi = {}) {
  return {
    kpi_id: String(kpi.kpi_id || "").trim(),
    name: String(kpi.name || "").trim(),
    owner: String(kpi.owner || "").trim(),
    module: String(kpi.module || "").trim(),
    dimension: String(kpi.dimension || "").trim(),
    target: String(kpi.target || "").trim(),
    frequency: String(kpi.frequency || "").trim(),
    unit: String(kpi.unit || "").trim(),
    formula: String(kpi.formula || "").trim(),
    source: String(kpi.source || "").trim(),
    status: String(kpi.status || "Active").trim(),
    description: String(kpi.description || "").trim(),
  };
}

function loadLegacyJson(key, fallback) {
  try {
    return JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback));
  } catch {
    return fallback;
  }
}

function samePayload(a = {}, b = {}) {
  const left = normalizeKpiPayload(a);
  const right = normalizeKpiPayload(b);
  return Object.keys(left).every((key) => left[key] === right[key]);
}

async function migrateLegacyKpis() {
  if (localStorage.getItem(LEGACY_MIGRATED_KEY) === "1") {
    return;
  }

  migrationPromise ??= (async () => {
    const saved = loadLegacyJson(LEGACY_KEY, []);
    const deletedIds = new Set(loadLegacyJson(LEGACY_DELETED_KEY, []).map((item) => String(item || "").trim().toLowerCase()));

    if (!saved.length && !deletedIds.size) {
      localStorage.setItem(LEGACY_MIGRATED_KEY, "1");
      return;
    }

    const backendRows = await apiFetchJson(KPI_API);
    const byKpiId = new Map(
      backendRows.map((item) => [String(item.kpi_id || "").trim().toLowerCase(), item])
    );

    for (const item of saved) {
      const kpiId = String(item?.kpi_id || "").trim().toLowerCase();
      if (!kpiId) continue;

      const existing = byKpiId.get(kpiId);
      const payload = normalizeKpiPayload(item);

      try {
        if (!existing) {
          const created = await apiFetchJson(KPI_API, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });
          byKpiId.set(kpiId, created);
        } else if (!samePayload(existing, item)) {
          const updated = await apiFetchJson(`${KPI_API}${existing.id}/`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });
          byKpiId.set(kpiId, updated);
        }
      } catch {}
    }

    for (const deletedId of deletedIds) {
      const existing = byKpiId.get(deletedId);
      if (!existing) continue;
      try {
        await apiFetchJson(`${KPI_API}${existing.id}/`, {
          method: "DELETE",
        });
      } catch {}
    }

    localStorage.setItem(LEGACY_MIGRATED_KEY, "1");
  })().finally(() => {
    migrationPromise = null;
  });

  return migrationPromise;
}

// hne njibou KPIs lkol men backend/database.
export async function loadKpis() {
  await migrateLegacyKpis();
  return apiFetchJson(KPI_API);
}

// hne nvalidiw l form 9bal save, w nzidou check 3al duplicates men data jeya men backend.
export async function validateKpi(form) {
  const current = await loadKpis();
  const kpiId = String(form.kpi_id || "").trim();
  const name = String(form.name || "").trim();

  if (!kpiId || !name || !String(form.owner || "").trim() || !String(form.module || "").trim()) {
    return "Veuillez renseigner tous les champs obligatoires : KPI ID, nom, propriétaire et module.";
  }

  const duplicateKpiId = current.find((item) =>
    String(item.kpi_id || "").trim().toLowerCase() === kpiId.toLowerCase() &&
    String(item.id) !== String(form.id)
  );
  if (duplicateKpiId) {
    return `Échec de l’ajout du KPI : l’identifiant KPI "${kpiId}" est déjà utilisé.`;
  }

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

// hne create wala update hasb ken l KPI 3andha id mawjouda wala le.
export function upsertKpi(kpi) {
  const payload = normalizeKpiPayload(kpi);

  if (kpi?.id) {
    return apiFetchJson(`${KPI_API}${kpi.id}/`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  }

  return apiFetchJson(KPI_API, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

// hne nfas5ou KPI men backend, w kenha default تتخبى و kenha custom تتمسح.
export async function deleteKpiById(id) {
  await apiFetchJson(`${KPI_API}${id}/`, {
    method: "DELETE",
  });
  return loadKpis();
}

// hne njibou KPI wa7da بالـ id mta3ha men backend.
export function getKpiById(id) {
  return apiFetchJson(`${KPI_API}${id}/`);
}
