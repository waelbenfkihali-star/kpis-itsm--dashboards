import React from "react";
import { Grid, MenuItem, TextField } from "@mui/material";
import {
  KPI_FREQUENCY_OPTIONS,
  KPI_MODULE_OPTIONS,
  KPI_STATUS_OPTIONS,
} from "./kpiFormConfig";

export default function KpiFieldsForm({
  form,
  setField,
  disableKpiId = false,
}) {
  return (
    <Grid container spacing={2}>
      <Grid item xs={12} md={6}>
        <TextField
          label="KPI ID"
          fullWidth
          value={form.kpi_id}
          onChange={(e) => setField("kpi_id", e.target.value)}
          helperText="Example: INC-01"
          disabled={disableKpiId}
        />
      </Grid>

      <Grid item xs={12} md={6}>
        <TextField
          label="Name"
          fullWidth
          value={form.name}
          onChange={(e) => setField("name", e.target.value)}
          helperText="KPI title"
        />
      </Grid>

      <Grid item xs={12} md={6}>
        <TextField
          label="Owner"
          fullWidth
          value={form.owner}
          onChange={(e) => setField("owner", e.target.value)}
        />
      </Grid>

      <Grid item xs={12} md={6}>
        <TextField
          label="Module"
          select
          fullWidth
          value={form.module}
          onChange={(e) => setField("module", e.target.value)}
          helperText="Choose which ITSM module this KPI belongs to"
        >
          {KPI_MODULE_OPTIONS.map((option) => (
            <MenuItem key={option} value={option}>
              {option}
            </MenuItem>
          ))}
        </TextField>
      </Grid>

      <Grid item xs={12} md={6}>
        <TextField
          label="Dimension"
          fullWidth
          value={form.dimension}
          onChange={(e) => setField("dimension", e.target.value)}
        />
      </Grid>

      <Grid item xs={12} md={6}>
        <TextField
          label="Target"
          fullWidth
          value={form.target}
          onChange={(e) => setField("target", e.target.value)}
          helperText="Example: >= 95%"
        />
      </Grid>

      <Grid item xs={12} md={6}>
        <TextField
          label="Frequency"
          select
          fullWidth
          value={form.frequency}
          onChange={(e) => setField("frequency", e.target.value)}
        >
          {KPI_FREQUENCY_OPTIONS.map((option) => (
            <MenuItem key={option} value={option}>
              {option}
            </MenuItem>
          ))}
        </TextField>
      </Grid>

      <Grid item xs={12} md={6}>
        <TextField
          label="Unit"
          fullWidth
          value={form.unit}
          onChange={(e) => setField("unit", e.target.value)}
          helperText="%, ticket, request, change, hour..."
        />
      </Grid>

      <Grid item xs={12} md={6}>
        <TextField
          label="Status"
          select
          fullWidth
          value={form.status}
          onChange={(e) => setField("status", e.target.value)}
        >
          {KPI_STATUS_OPTIONS.map((option) => (
            <MenuItem key={option} value={option}>
              {option}
            </MenuItem>
          ))}
        </TextField>
      </Grid>

      <Grid item xs={12}>
        <TextField
          label="Formula"
          fullWidth
          value={form.formula}
          onChange={(e) => setField("formula", e.target.value)}
          helperText="Example: resolved_incidents / total_incidents"
        />
      </Grid>

      <Grid item xs={12}>
        <TextField
          label="Source"
          fullWidth
          value={form.source}
          onChange={(e) => setField("source", e.target.value)}
          helperText="ServiceNow Incident, Request, Change, Task SLA..."
        />
      </Grid>

      <Grid item xs={12}>
        <TextField
          label="Description"
          multiline
          rows={3}
          fullWidth
          value={form.description}
          onChange={(e) => setField("description", e.target.value)}
        />
      </Grid>
    </Grid>
  );
}
