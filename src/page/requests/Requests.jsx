// @ts-ignore
// hne page requests: fiha tableau, filters, delete, w selection mta3 rows bech yet7alllou.
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

// hne component Requests: mas2oul 3la affichage joz2 men l interface wala page kamla men l app.
export default function Requests() {

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
    items: [],
    services: [],
    groups: [],
    users: [],
    openedFrom: "",
    openedTo: "",
    closedFrom: "",
    closedTo: ""
  });

  useEffect(() => {
    apiFetch("/requests/")
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

  const itemOptions = useMemo(
    () => [...new Set(rows.map((r) => r.item).filter(Boolean))],
    [rows]
  );

  const serviceOptions = useMemo(
    () => [...new Set(rows.map((r) => r.it_service).filter(Boolean))],
    [rows]
  );

  const groupOptions = useMemo(
    () => [...new Set(rows.map((r) => r.responsible_group).filter(Boolean))],
    [rows]
  );

  const userOptions = useMemo(
    () => [...new Set(rows.map((r) => r.requested_for).filter(Boolean))],
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

      if (filters.items.length && !filters.items.includes(r.item))
        return false;

      if (filters.services.length && !filters.services.includes(r.it_service))
        return false;

      if (filters.groups.length && !filters.groups.includes(r.responsible_group))
        return false;

      if (filters.users.length && !filters.users.includes(r.requested_for))
        return false;

      if (filters.openedFrom && new Date(r.opened) < new Date(filters.openedFrom))
        return false;

      if (filters.openedTo && new Date(r.opened) > new Date(filters.openedTo))
        return false;

      if (filters.closedFrom && new Date(r.closed) < new Date(filters.closedFrom))
        return false;

      if (filters.closedTo && new Date(r.closed) > new Date(filters.closedTo))
        return false;

      return true;

    });

  }, [rows, filters]);

  const activeFilterCount = useMemo(
    () =>
      [
        filters.search,
        filters.states.length,
        filters.items.length,
        filters.services.length,
        filters.groups.length,
        filters.users.length,
        filters.openedFrom,
        filters.openedTo,
        filters.closedFrom,
        filters.closedTo,
      ].filter(Boolean).length,
    [filters]
  );

  // hne function resetFilters: l form wala l filters l 7ala l aslaya.
  function resetFilters() {
    setFilters({
      search: "",
      states: [],
      items: [],
      services: [],
      groups: [],
      users: [],
      openedFrom: "",
      openedTo: "",
      closedFrom: "",
      closedTo: ""
    });
  }
  // hne function updateFilter: tbadel part men state wala data hasb l ma3loumet jdida.
  function updateFilter(key, value) {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }

  // hne function handleAnalyse: tet9ad biha actions mta3 l user kif click, change, open, wala close, w ba3dha tbadel state wala navigation.
  function handleAnalyse() {
    // hne variable selectedData: data m7adhra lel affichage wala l analyse.
    const selectedData = filteredRows.filter((row) => selectedIds.includes(row.id));
    navigate("/requests-analysis", { state: { data: selectedData, selectedKpi } });
  }

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
                Filter and select the request rows you need, then click Analyse to open the KPI-focused dashboard.
              </Typography>
            </Box>
            <Button
              variant="text"
              onClick={() => navigate("/requests", { replace: true })}
            >
              Clear KPI
            </Button>
          </Stack>
        </Paper>
      ) : null}

      {err && <Alert severity="error" sx={{ mb:2 }}>{err}</Alert>}

      <Stack direction="row" justifyContent="space-between" sx={{ mb:2 }}>

        <DeleteToolbar
          selectedIds={selectedIds}
          setSelectedIds={setSelectedIds}
          rows={rows}
          setRows={setRows}
          api="/requests/delete/"
        />

        <Button
          variant="contained"
          color="success"
          disabled={!selectedIds.length}
          onClick={handleAnalyse}
        >
          {selectedKpi ? `Analyse ${selectedKpi.kpi_id}` : "Analyse"}
        </Button>

      </Stack>

      <GlobalScopeFilters
        title="Request Filters"
        activeCount={activeFilterCount}
        onReset={resetFilters}
        filters={filters}
        onChange={updateFilter}
        statusOptions={stateOptions}
        serviceOptions={serviceOptions}
        serviceLabel="IT Service"
        groupOptions={groupOptions}
        dateFromKey="openedFrom"
        dateToKey="openedTo"
        dateFromLabel="Opened From"
        dateToLabel="Opened To"
      >
        <Autocomplete
          multiple
          options={itemOptions}
          value={filters.items}
          onChange={(e,v)=>setFilters({...filters,items:v})}
          renderInput={(p)=><TextField {...p} label="Item" size="small"/>}
          sx={{width:200}}
        />

        <Autocomplete
          multiple
          options={userOptions}
          value={filters.users}
          onChange={(e,v)=>setFilters({...filters,users:v})}
          renderInput={(p)=><TextField {...p} label="Requested For" size="small"/>}
          sx={{width:220}}
        />

        <TextField
          type="date"
          label="Closed From"
          size="small"
          InputLabelProps={{shrink:true}}
          value={filters.closedFrom}
          onChange={(e)=>setFilters({...filters,closedFrom:e.target.value})}
        />

        <TextField
          type="date"
          label="Closed To"
          size="small"
          InputLabelProps={{shrink:true}}
          value={filters.closedTo}
          onChange={(e)=>setFilters({...filters,closedTo:e.target.value})}
        />
      </GlobalScopeFilters>

      <Box sx={{height:650}}>

        <DataGrid
          rows={filteredRows}
          columns={columns}
          loading={loading}
          checkboxSelection
          getRowId={(row)=>row.id}
          disableRowSelectionOnClick
          slots={{toolbar:GridToolbar}}
          onRowSelectionModelChange={(ids)=>setSelectedIds(ids)}
          onRowClick={(p)=>navigate(`/requests/${p.row.number}`)}
          pageSizeOptions={[10,25,50]}
        />

      </Box>

    </Box>
  );
}
