import React, { useEffect, useState } from "react";
import {
  Box,
  TextField,
  Grid,
  Button,
  MenuItem,
  Stack,
  Alert,
} from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import Header from "../../components/Header";
import { getKpiById, upsertKpi, loadKpis, saveKpis } from "./kpiStorage";

// ✅ نفس seed متاع MyKpis (باش Edit يخدم حتى إذا localStorage فارغ)
const seed = [
  {
    id: 1,
    kpi_id: "5.8.01",
    name: "SLA Compliance",
    owner: "Service Desk",
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
  const { id } = useParams(); // Route: /EditKpi/:id

  const [notFound, setNotFound] = useState(false);

  const [form, setForm] = useState({
    id: "",
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

  useEffect(() => {
    // 1) جرّب من localStorage
    let kpi = getKpiById(id);

    // 2) إذا ما لقاهاش و localStorage فارغ → seed
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
    // تأكد id يبقى موجود
    setForm({
      id: kpi.id,
      kpi_id: kpi.kpi_id || "",
      name: kpi.name || "",
      owner: kpi.owner || "",
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

  function submit() {
    // ✅ Update localStorage
    upsertKpi(form);
    navigate("/MyKpis");
  }

  return (
    <Box>
      <Header title="EDIT KPI" subTitle={`Editing KPI: ${form.kpi_id || id}`} />

      {notFound ? (
        <Box sx={{ mt: 2, maxWidth: 900 }}>
          <Alert severity="warning">
            KPI not found (id: {id}). Please go back and create it first.
          </Alert>

          <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
            <Button variant="contained" onClick={() => navigate("/MyKpis")}>
              Back to My KPIs
            </Button>
            <Button variant="outlined" onClick={() => navigate("/Kpiform")}>
              Define KPI
            </Button>
          </Stack>
        </Box>
      ) : (
        <Box sx={{ mt: 3, maxWidth: 900 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField label="KPI ID" fullWidth value={form.kpi_id} disabled />
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
            <Button variant="contained" onClick={submit}>
              Save Changes
            </Button>

            <Button variant="outlined" onClick={() => navigate("/MyKpis")}>
              Cancel
            </Button>
          </Stack>
        </Box>
      )}
    </Box>
  );
};

export default EditKpi;