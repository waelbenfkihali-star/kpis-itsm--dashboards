export const STORAGE_KEYS = {
  incidents: "itsm_import_incidents",
  requests: "itsm_import_requests",
  changes: "itsm_import_changes",
};

export function saveImportedData(kind, rows) {
  const key = STORAGE_KEYS[kind];
  if (!key) return;
  localStorage.setItem(key, JSON.stringify(Array.isArray(rows) ? rows : []));
}

export function loadImportedData(kind) {
  const key = STORAGE_KEYS[kind];
  if (!key) return [];
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function clearImportedData() {
  Object.values(STORAGE_KEYS).forEach((key) => localStorage.removeItem(key));
}

function normalizeBool(value) {
  if (typeof value === "boolean") return value;
  const v = String(value ?? "").trim().toLowerCase();
  return ["true", "yes", "y", "1", "major", "oui"].includes(v);
}

function normalizeNumber(value) {
  if (value === null || value === undefined || value === "") return 0;
  const n = Number(value);
  return Number.isNaN(n) ? 0 : n;
}

export function mapIncidentRows(rows) {
  return (rows || []).map((row, index) => ({
    id: index + 1,
    number: row["Number"] ?? "",
    state: row["State"] ?? "",
    priority: row["Priority"] ?? "",
    affected_service: row["Affected Service"] ?? "",
    parent: row["Parent"] ?? "",
    parent_incident: row["Parent Incident"] ?? "",
    service_owner: row["Service Owner"] ?? "",
    configuration_item: row["Configuration item"] ?? "",
    location: row["Location"] ?? "",
    description: row["Description"] ?? "",
    short_description: row["Short description"] ?? "",
    opened: row["Opened"] ?? "",
    resolution_code: row["Resolution code"] ?? "",
    resolution_notes: row["Resolution notes"] ?? "",
    responsible_group: row["Responsible group"] ?? "",
    responsible_user: row["Responsible user"] ?? "",
    resolved: row["Resolved"] ?? "",
    reopen_count: normalizeNumber(row["Reopen count"]),
    caller: row["Caller"] ?? "",
    aging_group: row["Aging Group"] ?? "",
    duration: normalizeNumber(row["Duration"]),
    service_classification: row["Service classification"] ?? "",
    business_duration: normalizeNumber(row["Business duration"]),
    problem: row["Problem"] ?? "",
    sla: row["SLA"] ?? "",
    schedule: row["Schedule"] ?? "",
    location_division: row["Location Division"] ?? "",
    service_request: row["Service Request"] ?? "",
    is_major:
      normalizeBool(row["Is Major"]) ||
      String(row["Priority"] ?? "").trim().toUpperCase() === "P1",
    sla_breached:
      normalizeBool(row["SLA Breached"]) ||
      String(row["SLA"] ?? "").toLowerCase().includes("breach"),
  }));
}

export function mapRequestRows(rows) {
  return (rows || []).map((row, index) => ({
    id: index + 1,
    count: normalizeNumber(row["Count"]),
    number: row["Number"] ?? "",
    state: row["State"] ?? "",
    item: row["Item"] ?? "",
    short_description: row["Short description"] ?? "",
    description: row["Description"] ?? "",
    affected_service: row["Affected Service"] ?? "",
    parent: row["Parent"] ?? "",
    service_owner: row["Service Owner"] ?? "",
    request: row["Request"] ?? "",
    requested_for: row["Requested for"] ?? "",
    opened: row["Opened"] ?? "",
    opened_by: row["Opened by"] ?? "",
    responsible_group: row["Responsible group"] ?? "",
    responsible_user: row["Responsible user"] ?? "",
    location: row["Location"] ?? "",
    aging_group: row["Aging Group"] ?? "",
    location_division: row["Location Division"] ?? "",
    updated: row["Updated"] ?? "",
    resolve_time: row["Resolve Time"] ?? "",
    service_classification: row["Service classification"] ?? "",
    closed: row["Closed"] ?? "",
    closed_by: row["Closed by"] ?? "",
    it_service: row["IT Service"] ?? "",
  }));
}

export function mapChangeRows(rows) {
  return (rows || []).map((row, index) => ({
    id: index + 1,
    count: normalizeNumber(row["Count"]),
    number: row["Number"] ?? "",
    type: row["Type"] ?? "",
    state: row["State"] ?? "",
    priority: row["Priority"] ?? "",
    affected_service: row["Affected Service"] ?? "",
    parent: row["Parent"] ?? "",
    service_owner: row["Service Owner"] ?? "",
    configuration_item: row["Configuration item"] ?? "",
    location: row["Location"] ?? "",
    description: row["Description"] ?? "",
    short_description: row["Short description"] ?? "",
    opened: row["Opened"] ?? "",
    planned_start_date: row["Planned start date"] ?? "",
    planned_end_date: row["Planned end date"] ?? "",
    closed: row["Closed"] ?? "",
    responsible_group: row["Responsible group"] ?? "",
    responsible_user: row["Responsible user"] ?? "",
    location_division: row["Location Division"] ?? "",
    service_classification: row["Service classification"] ?? "",
    risk: row["Risk"] ?? "",
    category: row["Category"] ?? "",
    close_code: row["Close code"] ?? row["Close Code"] ?? "",
    close_notes: row["Close notes"] ?? row["Close Notes"] ?? "",
  }));
}