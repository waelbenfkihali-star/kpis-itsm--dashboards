import React, { useEffect, useState, useMemo } from "react";
import {
  Box,
  TextField,
  Grid,
  Button,
  MenuItem,
  Stack,
  Alert,
  Paper,
  Typography,
} from "@mui/material";

import { useNavigate, useParams } from "react-router-dom";
import Header from "../../components/Header";

import { getKpiById, upsertKpi, loadKpis, saveKpis } from "./kpiStorage";

const seed = [
  {
    id: 1,
    kpi_id: "5.8.01",
    name: "SLA Compliance",
    owner: "Service Desk",
    module: "Incidents",
    dimension: "",
    target: "",
    frequency: "Monthly",
    unit: "%",
    formula: "",
    source: "",
    status: "Active",
    description: "",
  },
  {
    id: 2,
    kpi_id: "5.8.02",
    name: "Incident Resolution Time",
    owner: "IT Support",
    module: "Incidents",
    dimension: "",
    target: "",
    frequency: "Weekly",
    unit: "minutes",
    formula: "",
    source: "",
    status: "Active",
    description: "",
  },
];

const EditKpi = () => {

  const navigate = useNavigate();
  const { id } = useParams();

  const [notFound, setNotFound] = useState(false);

  const [form, setForm] = useState({
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
  });

  useEffect(() => {

    let kpi = getKpiById(id);

    if (!kpi) {
      const list = loadKpis();
      if (!list.length) {
        saveKpis(seed);
        kpi = seed.find((x) => String(x.id) === String(id)) || null;
      }
    }

    if (!kpi) {
      setNotFound(true);
      return;
    }

    setNotFound(false);

    setForm({
      id: kpi.id,
      kpi_id: kpi.kpi_id || "",
      name: kpi.name || "",
      owner: kpi.owner || "",
      module: kpi.module || "",
      dimension: kpi.dimension || "",
      target: kpi.target || "",
      frequency: kpi.frequency || "",
      unit: kpi.unit || "",
      formula: kpi.formula || "",
      source: kpi.source || "",
      status: kpi.status || "Active",
      description: kpi.description || "",
    });

  }, [id]);

  function setField(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  const isValid = useMemo(() => {
    return (
      form.name.trim() !== "" &&
      form.owner.trim() !== "" &&
      form.module.trim() !== ""
    );
  }, [form]);

  function resetForm() {
    setForm((prev) => ({
      ...prev,
      name: "",
      owner: "",
      module: "",
      dimension: "",
      target: "",
      frequency: "",
      unit: "",
      formula: "",
      source: "",
      description: "",
    }));
  }

  function submit() {

    if (!isValid) return;

    upsertKpi(form);

    navigate("/MyKpis");

  }

  return (

    <Box>

      <Header
        title="EDIT KPI"
        subTitle={`Editing KPI: ${form.kpi_id || id}`}
      />

      {notFound ? (

        <Box sx={{ mt: 2,  width: "100%" }}>

          <Alert severity="warning">
            KPI not found (id: {id})
          </Alert>

          <Stack direction="row" spacing={2} sx={{ mt: 2 }}>

            <Button
              variant="contained"
              onClick={() => navigate("/MyKpis")}
            >
              Back to My KPIs
            </Button>

            <Button
              variant="outlined"
              onClick={() => navigate("/Kpiform")}
            >
              Define KPI
            </Button>

          </Stack>

        </Box>

      ) : (

        <Paper sx={{ mt: 3, p: 3,  width: "100%" }}>

          <Grid container spacing={2}>

            <Grid item xs={12} md={6}>
              <TextField
                label="KPI ID"
                fullWidth
                value={form.kpi_id}
                disabled
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

            <Button
              variant="contained"
              onClick={submit}
              disabled={!isValid}
            >
              Save Changes
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

      )}

    </Box>
  );
};

export default EditKpi;
