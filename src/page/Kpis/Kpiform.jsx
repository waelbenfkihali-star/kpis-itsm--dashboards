import React, { useState } from "react";
import { Box, TextField, Grid, Button, MenuItem, Stack } from "@mui/material";
import { useNavigate } from "react-router-dom";
import Header from "../../components/Header";
import { upsertKpi } from "./kpiStorage";

const KpiForm = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    kpi_id: "",
    name: "",
    owner: "",
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

  function submit() {
    // ✅ create new KPI in localStorage
    const newKpi = {
      id: Date.now(), // simple unique id
      ...form,
    };

    upsertKpi(newKpi);
    navigate("/kpis/my");
  }

  return (
    <Box>
      <Header title="DEFINE KPI" subTitle="Create a KPI definition" />

      <Box sx={{ mt: 3, maxWidth: 900 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <TextField
              label="KPI ID"
              fullWidth
              value={form.kpi_id}
              onChange={(e) => setField("kpi_id", e.target.value)}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              label="Name"
              fullWidth
              value={form.name}
              onChange={(e) => setField("name", e.target.value)}
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
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              label="Frequency"
              fullWidth
              value={form.frequency}
              onChange={(e) => setField("frequency", e.target.value)}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              label="Unit"
              fullWidth
              value={form.unit}
              onChange={(e) => setField("unit", e.target.value)}
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
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              label="Source"
              fullWidth
              value={form.source}
              onChange={(e) => setField("source", e.target.value)}
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
          <Button variant="contained" color="primary" onClick={submit}>
            Save KPI
          </Button>

          <Button variant="outlined" onClick={() => navigate("/MyKpis")}>
            Cancel
          </Button>
        </Stack>
      </Box>
    </Box>
  );
};

export default KpiForm;