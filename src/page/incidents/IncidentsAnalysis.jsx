import React, { useMemo } from "react";
import { Alert, Box, Button, Chip, Paper, Stack, Typography } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { useLocation, useNavigate } from "react-router-dom";
import Header from "../../components/Header";

function buildSummary(rows, key) {
  const counts = {};

  rows.forEach((row) => {
    const value = row[key] || "Unknown";
    counts[value] = (counts[value] || 0) + 1;
  });

  return Object.entries(counts).sort((a, b) => b[1] - a[1]);
}

export default function IncidentsAnalysis() {
  const navigate = useNavigate();
  const location = useLocation();
  const rows = Array.isArray(location.state?.data) ? location.state.data : [];

  const byState = useMemo(() => buildSummary(rows, "state"), [rows]);
  const byPriority = useMemo(() => buildSummary(rows, "priority"), [rows]);

  if (!rows.length) {
    return (
      <Box>
        <Header title="INCIDENT ANALYSIS" subTitle="No incidents were selected" />
        <Alert severity="info" sx={{ mb: 2 }}>
          Select one or more incidents from the incidents table, then reopen analysis.
        </Alert>
        <Button variant="outlined" onClick={() => navigate("/incidents")}>
          Back to incidents
        </Button>
      </Box>
    );
  }

  const columns = [
    { field: "number", headerName: "Incident ID", flex: 1, minWidth: 140 },
    { field: "state", headerName: "Status", flex: 1, minWidth: 140 },
    { field: "priority", headerName: "Priority", flex: 0.8, minWidth: 100 },
    { field: "affected_service", headerName: "Service", flex: 1.2, minWidth: 180 },
    { field: "responsible_group", headerName: "Group", flex: 1.2, minWidth: 180 },
    { field: "opened", headerName: "Opened", flex: 1, minWidth: 160 },
  ];

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
        <Header
          title="INCIDENT ANALYSIS"
          subTitle={`${rows.length} selected incidents`}
        />
        <Button variant="outlined" onClick={() => navigate("/incidents")}>
          Back
        </Button>
      </Stack>

      <Stack direction={{ xs: "column", md: "row" }} spacing={2} mb={2}>
        <Paper sx={{ p: 2, flex: 1 }}>
          <Typography variant="h6" mb={1}>
            By Status
          </Typography>
          <Stack direction="row" flexWrap="wrap" gap={1}>
            {byState.map(([label, count]) => (
              <Chip key={label} label={`${label}: ${count}`} color="primary" variant="outlined" />
            ))}
          </Stack>
        </Paper>

        <Paper sx={{ p: 2, flex: 1 }}>
          <Typography variant="h6" mb={1}>
            By Priority
          </Typography>
          <Stack direction="row" flexWrap="wrap" gap={1}>
            {byPriority.map(([label, count]) => (
              <Chip key={label} label={`${label}: ${count}`} color="secondary" variant="outlined" />
            ))}
          </Stack>
        </Paper>
      </Stack>

      <Box sx={{ height: 520 }}>
        <DataGrid
          rows={rows}
          columns={columns}
          disableRowSelectionOnClick
          getRowId={(row) => row.id}
          onRowClick={(params) => navigate(`/incidents/${params.row.number}`)}
          pageSizeOptions={[10, 25, 50]}
        />
      </Box>
    </Box>
  );
}
