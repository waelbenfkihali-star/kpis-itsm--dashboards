import React, { useState, useMemo } from "react";
import {
  Box,
  TextField,
  Grid,
  Button,
  MenuItem,
  Stack,
  Paper,
  Typography,
} from "@mui/material";

import { useNavigate } from "react-router-dom";
import Header from "../../components/Header";
import { upsertKpi } from "./kpiStorage";

const KpiForm = () => {

  const navigate = useNavigate();

  const [form, setForm] = useState({
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
  });

  function setField(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  const isValid = useMemo(() => {
    return (
      form.kpi_id.trim() !== "" &&
      form.name.trim() !== "" &&
      form.owner.trim() !== "" &&
      form.module.trim() !== ""
    );
  }, [form]);

  function resetForm() {
    setForm({
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
    });
  }

  function submit() {

    if (!isValid) return;

    const newKpi = {
      id: Date.now(),
      ...form,
    };

    upsertKpi(newKpi);

    navigate("/MyKpis");

  }

  return (

    <Box>

      <Header
        title="DEFINE KPI"
        subTitle="Create a KPI definition"
      />

      <Paper sx={{ mt: 3, p: 3, width: "100%" }}>

        <Grid container spacing={2}>

          <Grid item xs={12} md={6}>
            <TextField
              label="KPI ID"
              fullWidth
              value={form.kpi_id}
              onChange={(e) => setField("kpi_id", e.target.value)}
              helperText="Example: 5.8.03"
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
              <MenuItem value="Incidents">Incidents</MenuItem>
              <MenuItem value="Requests">Requests</MenuItem>
              <MenuItem value="Changes">Changes</MenuItem>
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
              helperText="Example: >95%"
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
              <MenuItem value="Daily">Daily</MenuItem>
              <MenuItem value="Weekly">Weekly</MenuItem>
              <MenuItem value="Monthly">Monthly</MenuItem>
              <MenuItem value="Quarterly">Quarterly</MenuItem>
              <MenuItem value="Yearly">Yearly</MenuItem>
            </TextField>
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              label="Unit"
              fullWidth
              value={form.unit}
              onChange={(e) => setField("unit", e.target.value)}
              helperText="%, minutes, hours..."
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
              <MenuItem value="Active">Active</MenuItem>
              <MenuItem value="Retired">Retired</MenuItem>
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
              helperText="ServiceNow, Monitoring tool, etc"
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

        <Stack direction="row" spacing={2} sx={{ mt: 3 }}>

          <Button
            variant="contained"
            onClick={submit}
            disabled={!isValid}
          >
            Save KPI
          </Button>

          <Button
            variant="outlined"
            onClick={resetForm}
          >
            Reset
          </Button>

          <Button
            variant="text"
            onClick={() => navigate("/MyKpis")}
          >
            Cancel
          </Button>

        </Stack>

      </Paper>

    </Box>

  );
};

export default KpiForm;
