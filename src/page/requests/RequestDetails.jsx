// hne page detail mta3 request wa7da: tjib ticket hasb number w tori informations mta3ha.
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

// hne component RequestDetails: mas2oul 3la affichage joz2 men l interface wala page kamla men l app.
export default function RequestDetails() {
  const navigate = useNavigate();
  const { number } = useParams();
  const [row, setRow] = useState(null);
  const [err, setErr] = useState("");

  useEffect(() => {
    apiFetch(`/requests/${encodeURIComponent(number)}/`)
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
        <Header title="REQUEST DETAILS" subTitle="Error loading record" />
        <Alert severity="error" sx={{ mb: 2 }}>{err}</Alert>
        <Button variant="outlined" onClick={() => navigate("/requests")}>Back</Button>
      </Box>
    );
  }

  if (!row) {
    return (
      <Box>
        <Header title="REQUEST DETAILS" subTitle="Loading..." />
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
        <Header title={`REQUEST ${row.number}`} subTitle={`${row.state || "-"} - ${row.item || "-"}`} />
        <Button variant="outlined" onClick={() => navigate("/requests")}>Back</Button>
      </Box>

      <Grid container spacing={2}>
        <Grid item xs={12} md={4}><DetailItem label="Count" value={row.count} /></Grid>
        <Grid item xs={12} md={4}><DetailItem label="Number" value={row.number} /></Grid>
        <Grid item xs={12} md={4}><DetailItem label="State" value={row.state} /></Grid>
        <Grid item xs={12} md={6}><DetailItem label="Item" value={row.item} /></Grid>
        <Grid item xs={12} md={6}><DetailItem label="IT Service" value={row.it_service} /></Grid>
        <Grid item xs={12}><DetailItem label="Short Description" value={row.short_description} /></Grid>
        <Grid item xs={12}><DetailItem label="Description" value={row.description} /></Grid>
        <Grid item xs={12} md={6}><DetailItem label="Affected Service" value={row.affected_service} /></Grid>
        <Grid item xs={12} md={6}><DetailItem label="Service Owner" value={row.service_owner} /></Grid>
        <Grid item xs={12} md={6}><DetailItem label="Request" value={row.request} /></Grid>
        <Grid item xs={12} md={6}><DetailItem label="Requested For" value={row.requested_for} /></Grid>
        <Grid item xs={12} md={6}><DetailItem label="Opened" value={row.opened} /></Grid>
        <Grid item xs={12} md={6}><DetailItem label="Opened By" value={row.opened_by} /></Grid>
        <Grid item xs={12} md={6}><DetailItem label="Responsible Group" value={row.responsible_group} /></Grid>
        <Grid item xs={12} md={6}><DetailItem label="Responsible User" value={row.responsible_user} /></Grid>
        <Grid item xs={12} md={4}><DetailItem label="Location" value={row.location} /></Grid>
        <Grid item xs={12} md={4}><DetailItem label="Aging Group" value={row.aging_group} /></Grid>
        <Grid item xs={12} md={4}><DetailItem label="Location Division" value={row.location_division} /></Grid>
        <Grid item xs={12} md={4}><DetailItem label="Updated" value={row.updated} /></Grid>
        <Grid item xs={12} md={4}><DetailItem label="Resolve Time" value={row.resolve_time} /></Grid>
        <Grid item xs={12} md={4}><DetailItem label="Service Classification" value={row.service_classification} /></Grid>
        <Grid item xs={12} md={4}><DetailItem label="Closed" value={row.closed} /></Grid>
        <Grid item xs={12} md={4}><DetailItem label="Closed By" value={row.closed_by} /></Grid>
        <Grid item xs={12} md={4}><DetailItem label="Parent" value={row.parent} /></Grid>
      </Grid>
    </Box>
  );
}
