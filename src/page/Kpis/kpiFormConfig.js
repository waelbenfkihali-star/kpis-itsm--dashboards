export const KPI_INITIAL_FORM = {
  id: "",
  kpi_id: "",
  name: "",
  owner: "",
  module: "",
  dimension: "",
  target: "",
  frequency: "",
  unit: "",
  formula: "",
  source: "",
  status: "Active",
  description: "",
};

export const KPI_MODULE_OPTIONS = ["Incidents", "Requests", "Changes"];

export const KPI_FREQUENCY_OPTIONS = [
  "Daily",
  "Weekly",
  "Monthly",
  "Quarterly",
  "Yearly",
];

export const KPI_STATUS_OPTIONS = ["Active", "Retired"];
