import React, { useEffect, useState } from "react";
import { Alert, Box, Button, Chip, Grid, Paper, Stack, Typography } from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";

import Header from "../../components/Header";
import { getModuleLabel, getModulePath } from "../analysis/kpiNavigation";
import { getKpiById } from "./kpiStorage";

const DetailItem = ({ label, value }) => (
  <Paper elevation={1} sx={{ p: 2, borderRadius: "14px", height: "100%" }}>
    <Typography variant="body2" sx={{ color: "text.secondary", mb: 0.5, fontSize: "12px" }}>
      {label}
    </Typography>
    <Typography sx={{ fontWeight: 600, wordBreak: "break-word" }}>
      {value !== null && value !== undefined && value !== "" ? String(value) : "-"}
    </Typography>
  </Paper>
);

export default function KpiDetails() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [row, setRow] = useState(null);

  useEffect(() => {
    setRow(getKpiById(id));
  }, [id]);

  if (!row) {
    return (
      <Box>
        <Header title="KPI DETAILS" subTitle="KPI not found" />
        <Alert severity="warning" sx={{ mb: 2 }}>
          KPI not found.
        </Alert>
        <Button variant="outlined" onClick={() => navigate("/mykpis")}>
          Back
        </Button>
      </Box>
    );
  }

  const modulePath = getModulePath(row.module);
  const moduleLabel = getModuleLabel(row.module);

  return (
    <Box>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
          gap: 1.5,
          flexWrap: "wrap",
        }}
      >
        <Header
          title={`KPI ${row.kpi_id || row.id}`}
          subTitle={`${row.name || "-"} • ${row.module || "-"}`}
        />

        <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
          <Button
            variant="contained"
            color="success"
            onClick={() =>
              navigate(modulePath, {
                state: { selectedKpi: row },
              })
            }
          >
            Open {moduleLabel}
          </Button>
          <Button variant="outlined" onClick={() => navigate("/mykpis")}>
            Back
          </Button>
          <Button variant="contained" onClick={() => navigate(`/editkpi/${row.id}`)}>
            Edit
          </Button>
        </Box>
      </Box>

      <Paper elevation={1} sx={{ p: 2, borderRadius: "14px", mb: 2 }}>
        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={1.5}
          justifyContent="space-between"
          alignItems={{ xs: "flex-start", md: "center" }}
        >
          <Box>
            <Typography variant="body2" sx={{ color: "text.secondary", mb: 0.5 }}>
              Analysis shortcut
            </Typography>
            <Typography sx={{ fontWeight: 600 }}>
              Open {moduleLabel} from this page, select the rows you need, then click Analyse for this KPI.
            </Typography>
          </Box>
          <Chip label={`${moduleLabel} linked`} color="primary" variant="outlined" />
        </Stack>
      </Paper>

      <Grid container spacing={2}>
        <Grid item xs={12} md={4}><DetailItem label="KPI ID" value={row.kpi_id} /></Grid>
        <Grid item xs={12} md={4}><DetailItem label="Name" value={row.name} /></Grid>
        <Grid item xs={12} md={4}><DetailItem label="Owner" value={row.owner} /></Grid>
        <Grid item xs={12} md={4}><DetailItem label="Module" value={row.module} /></Grid>
        <Grid item xs={12} md={4}><DetailItem label="Dimension" value={row.dimension} /></Grid>
        <Grid item xs={12} md={4}><DetailItem label="Target" value={row.target} /></Grid>
        <Grid item xs={12} md={4}><DetailItem label="Frequency" value={row.frequency} /></Grid>
        <Grid item xs={12} md={4}><DetailItem label="Unit" value={row.unit} /></Grid>
        <Grid item xs={12} md={4}><DetailItem label="Status" value={row.status} /></Grid>
        <Grid item xs={12}><DetailItem label="Formula" value={row.formula} /></Grid>
        <Grid item xs={12}><DetailItem label="Source" value={row.source} /></Grid>
        <Grid item xs={12}><DetailItem label="Description" value={row.description} /></Grid>
      </Grid>
    </Box>
  );
}
