// @ts-ignore
// hne page incidents: fiha tableau, filters, delete, w selection mta3 rows bech yet7alllou.
import React, { useEffect, useMemo, useState } from "react";
import {
  Box,
  Chip,
  Alert,
  Stack,
  TextField,
  Autocomplete,
  Button,
  Paper,
  Typography
} from "@mui/material";

import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import { useLocation, useNavigate } from "react-router-dom";

import Header from "../../components/Header";
import DeleteToolbar from "../../components/DeleteToolbar";
import GlobalScopeFilters from "../../components/GlobalScopeFilters";
import { apiFetch } from "../../utils/api";

// hne component Incidents: mas2oul 3la affichage joz2 men l interface wala page kamla men l app.
export default function Incidents() {

  const navigate = useNavigate();
  const location = useLocation();
  const selectedKpi = location.state?.selectedKpi || null;

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [selectedIds, setSelectedIds] = useState([]);

  const [filters, setFilters] = useState({
    search: "",
    states: [],
    priorities: [],
    services: [],
    groups: []
  });

  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  useEffect(() => {

    apiFetch("/incidents/")
      .then(async (res) => {

        // hne variable data: data m7adhra lel affichage wala l analyse.
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

  // hne function filteredRows: t5arrej kan rows wala data elli yjew ma3a filters l moufa3lin taw.
  const filteredRows = useMemo(() => {

    return rows.filter((r) => {
      if (
        filters.search &&
        !Object.values(r).some((value) =>
          String(value || "").toLowerCase().includes(filters.search.toLowerCase())
        )
      )
        return false;

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

  const activeFilterCount = useMemo(
    () =>
      [
        filters.search,
        filters.states.length,
        filters.priorities.length,
        filters.services.length,
        filters.groups.length,
        dateFrom,
        dateTo,
      ].filter(Boolean).length,
    [filters, dateFrom, dateTo]
  );

  // hne function handleAnalyse: tet9ad biha actions mta3 l user kif click, change, open, wala close, w ba3dha tbadel state wala navigation.
  function handleAnalyse() {

      // hne variable selectedData: data m7adhra lel affichage wala l analyse.
      const selectedData = filteredRows.filter((r) =>
      selectedIds.includes(r.id)
    );

    navigate("/incidents-analysis", {
      state: { data: selectedData, selectedKpi }
    });

  }

  // hne function resetFilters: l form wala l filters l 7ala l aslaya.
  function resetFilters() {
    setFilters({
      search: "",
      states: [],
      priorities: [],
      services: [],
      groups: []
    });
    setDateFrom("");
    setDateTo("");
  }
  // hne function updateFilter: tbadel part men state wala data hasb l ma3loumet jdida.
  function updateFilter(key, value) {
    if (key === "dateFrom") {
      setDateFrom(value);
      return;
    }
    if (key === "dateTo") {
      setDateTo(value);
      return;
    }
    setFilters((prev) => ({ ...prev, [key]: value }));
  }

  // hne variable columns: ta3ref columns mta3 DataGrid w kol colonne chnia tori.
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

      {selectedKpi ? (
        <Paper sx={{ p: 2, mb: 2 }}>
          <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" gap={2}>
            <Box>
              <Typography variant="overline" color="primary.main">
                Selected KPI
              </Typography>
              <Typography variant="h6">
                {selectedKpi.kpi_id} - {selectedKpi.name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Select the incident rows you want, then click Analyse to open a dashboard focused on this KPI.
              </Typography>
            </Box>
            <Button
              variant="text"
              onClick={() => navigate("/incidents", { replace: true })}
            >
              Clear KPI
            </Button>
          </Stack>
        </Paper>
      ) : null}

      {err ? <Alert severity="error" sx={{ mb: 2 }}>{err}</Alert> : null}


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
          api="/incidents/delete/"
        />

        <Button
          variant="contained"
          color="success"
          disabled={!selectedIds.length}
          onClick={handleAnalyse}
        >
          {selectedKpi ? `Analyse ${selectedKpi.kpi_id}` : "Analyse"}
        </Button>

      </Box>


      <GlobalScopeFilters
        title="Incident Filters"
        activeCount={activeFilterCount}
        onReset={resetFilters}
        filters={{ ...filters, dateFrom, dateTo }}
        onChange={updateFilter}
        statusOptions={stateOptions}
        statusLabel="State"
        serviceOptions={serviceOptions}
        groupOptions={groupOptions}
      >
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
      </GlobalScopeFilters>

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
          /* hne click 3la ay sater yehez l user l saf7et details mta3 l incident hedheka. */
          onRowClick={(params) =>
            navigate(`/incidents/${params.row.number}`)
          }
          pageSizeOptions={[10, 25, 50]}
        />

      </Box>

    </Box>

  );

}
