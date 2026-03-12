import React, { useEffect, useState } from "react";
import { Box, Button, Grid, Paper, Typography, Alert } from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import Header from "../../components/Header";
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

  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
        <Header title={`KPI ${row.kpi_id || row.id}`} subTitle={`${row.name || "-"} • ${row.module || "-"}`} />
        <Box sx={{ display: "flex", gap: 1 }}>
          <Button variant="outlined" onClick={() => navigate("/mykpis")}>
            Back
          </Button>
          <Button variant="contained" onClick={() => navigate(`/editkpi/${row.id}`)}>
            Edit
          </Button>
        </Box>
      </Box>

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
