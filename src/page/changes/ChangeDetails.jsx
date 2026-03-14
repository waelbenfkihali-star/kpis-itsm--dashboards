import React, { useEffect, useState } from "react";
import { Box, Button, Grid, Paper, Typography, Alert } from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import Header from "../../components/Header";
import { apiFetch } from "../../utils/api";

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

export default function ChangeDetails() {
  const navigate = useNavigate();
  const { number } = useParams();
  const [row, setRow] = useState(null);
  const [err, setErr] = useState("");

  useEffect(() => {
    apiFetch(`/changes/${encodeURIComponent(number)}/`)
      .then(async (res) => {
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data?.detail || `HTTP ${res.status}`);
        setRow(data);
      })
      .catch((e) => setErr(String(e.message || e)));
  }, [number]);

  if (err) {
    return (
      <Box>
        <Header title="CHANGE DETAILS" subTitle="Error loading record" />
        <Alert severity="error" sx={{ mb: 2 }}>{err}</Alert>
        <Button variant="outlined" onClick={() => navigate("/changes")}>Back</Button>
      </Box>
    );
  }

  if (!row) {
    return (
      <Box>
        <Header title="CHANGE DETAILS" subTitle="Loading..." />
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
        <Header title={`CHANGE ${row.number}`} subTitle={`${row.state || "-"} • ${row.type || "-"}`} />
        <Button variant="outlined" onClick={() => navigate("/changes")}>Back</Button>
      </Box>

      <Grid container spacing={2}>
        <Grid item xs={12} md={4}><DetailItem label="Count" value={row.count} /></Grid>
        <Grid item xs={12} md={4}><DetailItem label="Number" value={row.number} /></Grid>
        <Grid item xs={12} md={4}><DetailItem label="Type" value={row.type} /></Grid>
        <Grid item xs={12} md={4}><DetailItem label="State" value={row.state} /></Grid>
        <Grid item xs={12} md={4}><DetailItem label="Priority" value={row.priority} /></Grid>
        <Grid item xs={12} md={4}><DetailItem label="Risk" value={row.risk} /></Grid>
        <Grid item xs={12} md={6}><DetailItem label="Affected Service" value={row.affected_service} /></Grid>
        <Grid item xs={12} md={6}><DetailItem label="Service Owner" value={row.service_owner} /></Grid>
        <Grid item xs={12} md={6}><DetailItem label="Configuration Item" value={row.configuration_item} /></Grid>
        <Grid item xs={12} md={6}><DetailItem label="Category" value={row.category} /></Grid>
        <Grid item xs={12}><DetailItem label="Short Description" value={row.short_description} /></Grid>
        <Grid item xs={12}><DetailItem label="Description" value={row.description} /></Grid>
        <Grid item xs={12} md={4}><DetailItem label="Opened" value={row.opened} /></Grid>
        <Grid item xs={12} md={4}><DetailItem label="Planned Start Date" value={row.planned_start_date} /></Grid>
        <Grid item xs={12} md={4}><DetailItem label="Planned End Date" value={row.planned_end_date} /></Grid>
        <Grid item xs={12} md={4}><DetailItem label="Closed" value={row.closed} /></Grid>
        <Grid item xs={12} md={4}><DetailItem label="Responsible Group" value={row.responsible_group} /></Grid>
        <Grid item xs={12} md={4}><DetailItem label="Responsible User" value={row.responsible_user} /></Grid>
        <Grid item xs={12} md={4}><DetailItem label="Location" value={row.location} /></Grid>
        <Grid item xs={12} md={4}><DetailItem label="Location Division" value={row.location_division} /></Grid>
        <Grid item xs={12} md={4}><DetailItem label="Service Classification" value={row.service_classification} /></Grid>
        <Grid item xs={12} md={6}><DetailItem label="Close Code" value={row.close_code} /></Grid>
        <Grid item xs={12} md={6}><DetailItem label="Parent" value={row.parent} /></Grid>
        <Grid item xs={12}><DetailItem label="Close Notes" value={row.close_notes} /></Grid>
      </Grid>
    </Box>
  );
}
