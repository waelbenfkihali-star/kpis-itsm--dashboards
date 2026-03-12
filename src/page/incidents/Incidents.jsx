// @ts-ignore
import React, { useEffect, useMemo, useState } from "react";
import {
  Box,
  Chip,
  Alert,
  Stack,
  TextField,
  Autocomplete,
  Button
} from "@mui/material";

import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import { useNavigate } from "react-router-dom";

import Header from "../../components/Header";
import DeleteToolbar from "../../components/DeleteToolbar";

const API_BASE = "http://localhost:8001/api";

export default function Incidents() {

  const navigate = useNavigate();

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [selectedIds, setSelectedIds] = useState([]);

  const [filters, setFilters] = useState({
    states: [],
    priorities: [],
    services: [],
    groups: []
  });

  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

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

  const stateOptions = useMemo(
    () => [...new Set(rows.map((r) => r.state).filter(Boolean))],
    [rows]
  );

  const priorityOptions = useMemo(
    () => [...new Set(rows.map((r) => r.priority).filter(Boolean))],
    [rows]
  );

  const serviceOptions = useMemo(
    () => [...new Set(rows.map((r) => r.affected_service).filter(Boolean))],
    [rows]
  );

  const groupOptions = useMemo(
    () => [...new Set(rows.map((r) => r.responsible_group).filter(Boolean))],
    [rows]
  );

  const filteredRows = useMemo(() => {

    return rows.filter((r) => {

      if (filters.states.length && !filters.states.includes(r.state))
        return false;

      if (filters.priorities.length && !filters.priorities.includes(r.priority))
        return false;

      if (filters.services.length && !filters.services.includes(r.affected_service))
        return false;

      if (filters.groups.length && !filters.groups.includes(r.responsible_group))
        return false;

      if (dateFrom && new Date(r.opened) < new Date(dateFrom))
        return false;

      if (dateTo && new Date(r.opened) > new Date(dateTo))
        return false;

      return true;

    });

  }, [rows, filters, dateFrom, dateTo]);

  function handleAnalyse() {

    const selectedData = filteredRows.filter((r) =>
      selectedIds.includes(r.id)
    );

    navigate("/incidents-analysis", {
      state: { data: selectedData }
    });

  }

  const columns = useMemo(() => [

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

  ], []);

  return (

    <Box>

      <Header title="INCIDENTS" subTitle="Key incident records to focus on" />

      {err ? <Alert severity="error" sx={{ mb: 2 }}>{err}</Alert> : null}

      {/* Delete + Analyse bar */}

      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2
        }}
      >

        <DeleteToolbar
          selectedIds={selectedIds}
          setSelectedIds={setSelectedIds}
          rows={rows}
          setRows={setRows}
          api={`${API_BASE}/incidents/delete/`}
        />

        <Button
          variant="contained"
          color="success"
          disabled={!selectedIds.length}
          onClick={handleAnalyse}
        >
          Analyse
        </Button>

      </Box>

      {/* Filters */}

      <Stack direction="row" spacing={2} sx={{ mb: 2, flexWrap: "wrap" }}>

        <Autocomplete
          multiple
          options={stateOptions}
          value={filters.states}
          onChange={(e, v) => setFilters({ ...filters, states: v })}
          renderInput={(params) => (
            <TextField {...params} label="State" size="small" />
          )}
          sx={{ width: 220 }}
        />

        <Autocomplete
          multiple
          options={priorityOptions}
          value={filters.priorities}
          onChange={(e, v) => setFilters({ ...filters, priorities: v })}
          renderInput={(params) => (
            <TextField {...params} label="Priority" size="small" />
          )}
          sx={{ width: 220 }}
        />

        <Autocomplete
          multiple
          options={serviceOptions}
          value={filters.services}
          onChange={(e, v) => setFilters({ ...filters, services: v })}
          renderInput={(params) => (
            <TextField {...params} label="Service" size="small" />
          )}
          sx={{ width: 260 }}
        />

        <Autocomplete
          multiple
          options={groupOptions}
          value={filters.groups}
          onChange={(e, v) => setFilters({ ...filters, groups: v })}
          renderInput={(params) => (
            <TextField {...params} label="Group" size="small" />
          )}
          sx={{ width: 260 }}
        />

        <TextField
          type="date"
          label="From"
          size="small"
          InputLabelProps={{ shrink: true }}
          value={dateFrom}
          onChange={(e) => setDateFrom(e.target.value)}
          sx={{ width: 160 }}
        />

        <TextField
          type="date"
          label="To"
          size="small"
          InputLabelProps={{ shrink: true }}
          value={dateTo}
          onChange={(e) => setDateTo(e.target.value)}
          sx={{ width: 160 }}
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
          onRowClick={(params) =>
            navigate(`/incidents/${params.row.number}`)
          }
          pageSizeOptions={[10, 25, 50]}
        />

      </Box>

    </Box>

  );

}