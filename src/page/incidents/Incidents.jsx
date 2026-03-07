import React, { useEffect, useMemo, useState } from "react";
import { Box, Chip, Alert } from "@mui/material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import { useNavigate } from "react-router-dom";
import Header from "../../components/Header";

const API_BASE = "http://localhost:8001/api";

export default function Incidents() {
  const navigate = useNavigate();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    fetch(`${API_BASE}/incidents/`)
      .then(async (res) => {
        const data = await res.json().catch(() => []);
        if (!res.ok) throw new Error(data?.detail || `HTTP ${res.status}`);
        setRows(Array.isArray(data) ? data : []);
      })
      .catch((e) => setErr(String(e.message || e)))
      .finally(() => setLoading(false));
  }, []);

  const columns = useMemo(
    () => [
      { field: "number", headerName: "Incident ID", flex: 1, minWidth: 140 },
      {
        field: "state",
        headerName: "Status",
        flex: 1,
        minWidth: 130,
        renderCell: (params) => {
          const value = String(params.value || "");
          let color = "default";
          if (value === "Open") color = "error";
          else if (value === "In Progress") color = "warning";
          else if (value === "Resolved") color = "success";
          else if (value === "Closed") color = "info";
          // @ts-ignore
          return <Chip label={value || "-"} color={color} size="small" />;
        },
      },
      { field: "priority", headerName: "Priority", flex: 0.8, minWidth: 100 },
      {
        field: "affected_service",
        headerName: "Affected Service",
        flex: 1.2,
        minWidth: 170,
      },
      {
        field: "responsible_group",
        headerName: "Responsible Group",
        flex: 1.2,
        minWidth: 180,
      },
      { field: "opened", headerName: "Opened", flex: 1, minWidth: 150 },
      {
        field: "is_major",
        headerName: "Major",
        flex: 0.7,
        minWidth: 90,
        renderCell: (params) =>
          params.value ? (
            <Chip label="Yes" color="error" size="small" />
          ) : (
            <Chip label="No" variant="outlined" size="small" />
          ),
      },
      {
        field: "sla_breached",
        headerName: "SLA Breached",
        flex: 0.9,
        minWidth: 130,
        renderCell: (params) =>
          params.value ? (
            <Chip label="Yes" color="warning" size="small" />
          ) : (
            <Chip label="No" color="success" variant="outlined" size="small" />
          ),
      },
    ],
    []
  );

  return (
    <Box>
      <Header title="INCIDENTS" subTitle="Key incident records to focus on" />

      {err ? <Alert severity="error" sx={{ mb: 2 }}>{err}</Alert> : null}

      <Box sx={{ height: 650, mx: "auto" }}>
        <DataGrid
          rows={rows}
          columns={columns}
          loading={loading}
          getRowId={(row) => row.id}
          disableRowSelectionOnClick
          slots={{ toolbar: GridToolbar }}
          onRowClick={(params) => navigate(`/incidents/${params.row.number}`)}
          initialState={{
            pagination: {
              paginationModel: { pageSize: 10, page: 0 },
            },
          }}
          pageSizeOptions={[10, 25, 50]}
          sx={{ "& .MuiDataGrid-row": { cursor: "pointer" } }}
        />
      </Box>
    </Box>
  );
}