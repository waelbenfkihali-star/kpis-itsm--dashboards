// hne page detail mta3 incident wa7da: tjib ticket hasb number w tori informations mta3ha.
import React, { useEffect, useState } from "react";
import { Box, Button, Grid, Paper, Typography, Alert } from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import Header from "../../components/Header";
import { apiFetch } from "../../utils/api";

// hne component DetailItem: mas2oul 3la affichage joz2 men l interface wala page kamla men l app.
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

// hne component IncidentDetails: mas2oul 3la affichage joz2 men l interface wala page kamla men l app.
export default function IncidentDetails() {
  const navigate = useNavigate();
  const { number } = useParams();
  const [row, setRow] = useState(null);
  const [err, setErr] = useState("");

  useEffect(() => {
    apiFetch(`/incidents/${encodeURIComponent(number)}/`)
      .then(async (res) => {
        // hne variable data: data m7adhra lel affichage wala l analyse.
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data?.detail || `HTTP ${res.status}`);
        setRow(data);
      })
      .catch((e) => setErr(String(e.message || e)));
  }, [number]);

  if (err) {
    return (
      <Box>
        <Header title="INCIDENT DETAILS" subTitle="Error loading record" />
        <Alert severity="error" sx={{ mb: 2 }}>{err}</Alert>
        <Button variant="outlined" onClick={() => navigate("/incidents")}>Back</Button>
      </Box>
    );
  }

  if (!row) {
    return (
      <Box>
        <Header title="INCIDENT DETAILS" subTitle="Loading..." />
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
        <Header title={`INCIDENT ${row.number}`} subTitle={`${row.state || "-"} • ${row.priority || "-"}`} />
        <Button variant="outlined" onClick={() => navigate("/incidents")}>Back</Button>
      </Box>

      <Grid container spacing={2}>
        <Grid item xs={12} md={4}><DetailItem label="Number" value={row.number} /></Grid>
        <Grid item xs={12} md={4}><DetailItem label="State" value={row.state} /></Grid>
        <Grid item xs={12} md={4}><DetailItem label="Priority" value={row.priority} /></Grid>
        <Grid item xs={12} md={6}><DetailItem label="Affected Service" value={row.affected_service} /></Grid>
        <Grid item xs={12} md={6}><DetailItem label="Service Owner" value={row.service_owner} /></Grid>
        <Grid item xs={12} md={6}><DetailItem label="Responsible Group" value={row.responsible_group} /></Grid>
        <Grid item xs={12} md={6}><DetailItem label="Responsible User" value={row.responsible_user} /></Grid>
        <Grid item xs={12} md={6}><DetailItem label="Opened" value={row.opened} /></Grid>
        <Grid item xs={12} md={6}><DetailItem label="Resolved" value={row.resolved} /></Grid>
        <Grid item xs={12} md={4}><DetailItem label="Major Incident" value={row.is_major ? "Yes" : "No"} /></Grid>
        <Grid item xs={12} md={4}><DetailItem label="SLA Breached" value={row.sla_breached ? "Yes" : "No"} /></Grid>
        <Grid item xs={12} md={4}><DetailItem label="Reopen Count" value={row.reopen_count} /></Grid>
        <Grid item xs={12} md={6}><DetailItem label="Configuration Item" value={row.configuration_item} /></Grid>
        <Grid item xs={12} md={6}><DetailItem label="Location" value={row.location} /></Grid>
        <Grid item xs={12} md={4}><DetailItem label="Location Division" value={row.location_division} /></Grid>
        <Grid item xs={12} md={4}><DetailItem label="Caller" value={row.caller} /></Grid>
        <Grid item xs={12} md={4}><DetailItem label="Aging Group" value={row.aging_group} /></Grid>
        <Grid item xs={12} md={4}><DetailItem label="Duration" value={row.duration} /></Grid>
        <Grid item xs={12} md={4}><DetailItem label="Business Duration" value={row.business_duration} /></Grid>
        <Grid item xs={12} md={4}><DetailItem label="SLA" value={row.sla} /></Grid>
        <Grid item xs={12} md={4}><DetailItem label="Schedule" value={row.schedule} /></Grid>
        <Grid item xs={12} md={4}><DetailItem label="Problem" value={row.problem} /></Grid>
        <Grid item xs={12} md={4}><DetailItem label="Service Request" value={row.service_request} /></Grid>
        <Grid item xs={12} md={6}><DetailItem label="Parent" value={row.parent} /></Grid>
        <Grid item xs={12} md={6}><DetailItem label="Parent Incident" value={row.parent_incident} /></Grid>
        <Grid item xs={12} md={6}><DetailItem label="Resolution Code" value={row.resolution_code} /></Grid>
        <Grid item xs={12} md={6}><DetailItem label="Service Classification" value={row.service_classification} /></Grid>
        <Grid item xs={12}><DetailItem label="Short Description" value={row.short_description} /></Grid>
        <Grid item xs={12}><DetailItem label="Description" value={row.description} /></Grid>
        <Grid item xs={12}><DetailItem label="Resolution Notes" value={row.resolution_notes} /></Grid>
      </Grid>
    </Box>
  );
}
