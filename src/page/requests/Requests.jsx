// @ts-ignore
import React, { useEffect, useMemo, useState } from "react";
import {
  Box,
  Chip,
  Alert,
  Stack,
  TextField,
  Autocomplete
} from "@mui/material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import { useNavigate } from "react-router-dom";
import Header from "../../components/Header";
import DeleteToolbar from "../../components/DeleteToolbar";

const API_BASE = "http://localhost:8001/api";

export default function Requests() {

  const navigate = useNavigate();

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [selectedIds, setSelectedIds] = useState([]);

  const [filters, setFilters] = useState({
    states: [],
    services: [],
    groups: []
  });

  useEffect(() => {
    fetch(`${API_BASE}/requests/`)
      .then(async (res) => {
        const data = await res.json().catch(() => []);
        if (!res.ok) throw new Error(data?.detail || `HTTP ${res.status}`);
        setRows(Array.isArray(data) ? data : []);
      })
      .catch((e) => setErr(String(e.message || e)))
      .finally(() => setLoading(false));
  }, []);

  const stateOptions = useMemo(
    // @ts-ignore
    () => [...new Set(rows.map((r) => r.state).filter(Boolean))],
    [rows]
  );

  const serviceOptions = useMemo(
    // @ts-ignore
    () => [...new Set(rows.map((r) => r.it_service).filter(Boolean))],
    [rows]
  );

  const groupOptions = useMemo(
    // @ts-ignore
    () => [...new Set(rows.map((r) => r.responsible_group).filter(Boolean))],
    [rows]
  );

  const filteredRows = useMemo(() => {

    return rows.filter((r) => {

      if (filters.states.length && !filters.states.includes(r.state))
        return false;

      if (filters.services.length && !filters.services.includes(r.it_service))
        return false;

      if (filters.groups.length && !filters.groups.includes(r.responsible_group))
        return false;

      return true;

    });

  }, [rows, filters]);

  const columns = [

    { field: "number", headerName: "Request ID", flex: 1 },

    {
      field: "state",
      headerName: "Status",
      flex: 1,
      renderCell: (params) => {

        const value = params.value || "";
        let color = "default";

        if (value === "Open") color = "warning";
        else if (value === "In Progress") color = "info";
        else if (value === "Closed") color = "success";

        // @ts-ignore
        return <Chip label={value} color={color} size="small" />;

      }
    },

    { field: "item", headerName: "Item", flex: 1.2 },

    { field: "it_service", headerName: "IT Service", flex: 1.2 },

    { field: "responsible_group", headerName: "Group", flex: 1.2 },

    { field: "requested_for", headerName: "Requested For", flex: 1.2 },

    { field: "opened", headerName: "Opened", flex: 1 },

    { field: "closed", headerName: "Closed", flex: 1 }

  ];

  return (
    <Box>

      <Header title="REQUESTS" subTitle="Key service requests to focus on" />

      {err && <Alert severity="error">{err}</Alert>}

      <DeleteToolbar
        selectedIds={selectedIds}
        setSelectedIds={setSelectedIds}
        rows={rows}
        setRows={setRows}
        api={`${API_BASE}/requests/delete/`}
      />

      <Stack direction="row" spacing={2} sx={{ mb: 2, flexWrap: "wrap" }}>

        <Autocomplete
          multiple
          options={stateOptions}
          value={filters.states}
          // @ts-ignore
          onChange={(e, v) => setFilters({ ...filters, states: v })}
          renderInput={(p) => <TextField {...p} label="State" size="small" />}
          sx={{ width: 220 }}
        />

        <Autocomplete
          multiple
          options={serviceOptions}
          value={filters.services}
          // @ts-ignore
          onChange={(e, v) => setFilters({ ...filters, services: v })}
          renderInput={(p) => <TextField {...p} label="Service" size="small" />}
          sx={{ width: 220 }}
        />

        <Autocomplete
          multiple
          options={groupOptions}
          value={filters.groups}
          // @ts-ignore
          onChange={(e, v) => setFilters({ ...filters, groups: v })}
          renderInput={(p) => <TextField {...p} label="Group" size="small" />}
          sx={{ width: 220 }}
        />

      </Stack>

      <Box sx={{ height: 650 }}>

        <DataGrid
          rows={filteredRows}
          columns={columns}
          loading={loading}
          checkboxSelection
          getRowId={(row) => row.id}
          disableRowSelectionOnClick
          slots={{ toolbar: GridToolbar }}
          onRowSelectionModelChange={(ids) => setSelectedIds(ids)}
          onRowClick={(p) => navigate(`/requests/${p.row.number}`)}
          pageSizeOptions={[10, 25, 50]}
        />

      </Box>

    </Box>
  );
}