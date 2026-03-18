import React from "react";
import { Autocomplete, TextField } from "@mui/material";
import PageFilters from "./PageFilters";

export default function GlobalScopeFilters({
  title,
  activeCount,
  onReset,
  filters,
  onChange,
  statusOptions = [],
  statusKey = "states",
  statusLabel = "Status",
  serviceOptions = [],
  serviceKey = "services",
  serviceLabel = "Service",
  groupOptions = [],
  groupKey = "groups",
  groupLabel = "Group",
  dateFromKey = "dateFrom",
  dateToKey = "dateTo",
  dateFromLabel = "From",
  dateToLabel = "To",
  children,
}) {
  return (
    <PageFilters title={title} activeCount={activeCount} onReset={onReset}>
      <TextField
        label="Global Search"
        size="small"
        value={filters.search || ""}
        onChange={(event) => onChange("search", event.target.value)}
        sx={{ width: 220 }}
      />

      <Autocomplete
        multiple
        options={statusOptions}
        value={filters[statusKey] || []}
        onChange={(_, value) => onChange(statusKey, value)}
        renderInput={(params) => <TextField {...params} label={statusLabel} size="small" />}
        sx={{ width: 220 }}
      />

      <Autocomplete
        multiple
        options={serviceOptions}
        value={filters[serviceKey] || []}
        onChange={(_, value) => onChange(serviceKey, value)}
        renderInput={(params) => <TextField {...params} label={serviceLabel} size="small" />}
        sx={{ width: 240 }}
      />

      <Autocomplete
        multiple
        options={groupOptions}
        value={filters[groupKey] || []}
        onChange={(_, value) => onChange(groupKey, value)}
        renderInput={(params) => <TextField {...params} label={groupLabel} size="small" />}
        sx={{ width: 240 }}
      />

      <TextField
        type="date"
        label={dateFromLabel}
        size="small"
        InputLabelProps={{ shrink: true }}
        value={filters[dateFromKey] || ""}
        onChange={(event) => onChange(dateFromKey, event.target.value)}
        sx={{ width: 170 }}
      />

      <TextField
        type="date"
        label={dateToLabel}
        size="small"
        InputLabelProps={{ shrink: true }}
        value={filters[dateToKey] || ""}
        onChange={(event) => onChange(dateToKey, event.target.value)}
        sx={{ width: 170 }}
      />

      {children}
    </PageFilters>
  );
}
