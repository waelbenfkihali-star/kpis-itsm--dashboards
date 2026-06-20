// @ts-ignore
// hne page incidents: taffichi tableau mta3 incidents, filters, delete, selection, w analyse.
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
import { useLocation, useNavigate, useOutletContext } from "react-router-dom";

import Header from "../../components/Header";
import DeleteToolbar from "../../components/DeleteToolbar";
import GlobalScopeFilters from "../../components/GlobalScopeFilters";
import { apiFetch } from "../../utils/api";

// hne component mta3 incidents: yjib data men backend w yaffichiha fi tableau.
export default function Incidents() {

  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser } = useOutletContext();
  const isAdmin = currentUser?.access === "Admin";

  // hne nchofo ken fama KPI jey mel page okhra bech na3mlou analyse 3lih.
  const selectedKpi = location.state?.selectedKpi || null;

  // hne n5aznou incidents elli jeyin men backend.
  const [rows, setRows] = useState([]);

  // hne n3arfou ken data mazelt tetcharga walla lÃ©.
  const [loading, setLoading] = useState(true);

  // hne n5aznou error message ken request tfachel.
  const [err, setErr] = useState("");

  // hne n5aznou ids mta3 rows elli l user selectionnehom.
  const [selectedIds, setSelectedIds] = useState([]);

  // hne n5aznou filters mta3 recherche, status, priority, service w group.
  const [filters, setFilters] = useState({
    search: "",
    states: [],
    priorities: [],
    services: [],
    groups: [],
    majors: []
  });

  // hne filters mta3 date dÃ©but w date fin.
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  useEffect(() => {

    // hne n3aytou lel backend bech njibou liste mta3 incidents.
    apiFetch("/incidents/")
      .then(async (res) => {

        // hne n9raw response JSON, w ken fama mochkel nraj3ou tableau feragh.
        const data = await res.json().catch(() => []);
        if (!res.ok) throw new Error(data?.detail || `HTTP ${res.status}`);

        // hne n7ottou data fi rows ken response tableau.
        setRows(Array.isArray(data) ? data : []);

      })
      .catch((e) => setErr(String(e.message || e)))
      .finally(() => setLoading(false));

  }, []);

  // hne n5arjou liste unique mta3 states bech Ù†Ø³ØªØ¹Ù…Ù„ÙˆÙ‡Ø§ fi filter.
  const stateOptions = useMemo(
    () => [...new Set(rows.map((r) => r.state).filter(Boolean))],
    [rows]
  );

  // hne n5arjou liste unique mta3 priorities.
  const priorityOptions = useMemo(
    () => [...new Set(rows.map((r) => r.priority).filter(Boolean))],
    [rows]
  );

  // hne n5arjou liste unique mta3 services.
  const serviceOptions = useMemo(
    () => [...new Set(rows.map((r) => r.affected_service).filter(Boolean))],
    [rows]
  );

  // hne n5arjou liste unique mta3 responsible groups.
  const groupOptions = useMemo(
    () => [...new Set(rows.map((r) => r.responsible_group).filter(Boolean))],
    [rows]
  );
  const majorOptions = useMemo(() => ["Yes", "No"], []);

  // hne nfiltriw incidents Ø­Ø³Ø¨ filters elli l user 7atthom.
  const filteredRows = useMemo(() => {

    return rows.filter((r) => {
      // hne search ylawwej fi kol les champs mta3 incident.
      if (
        filters.search &&
        !Object.values(r).some((value) =>
          String(value || "").toLowerCase().includes(filters.search.toLowerCase())
        )
      )
        return false;

      // hne filter Ø­Ø³Ø¨ state.
      if (filters.states.length && !filters.states.includes(r.state))
        return false;

      // hne filter Ø­Ø³Ø¨ priority.
      if (filters.priorities.length && !filters.priorities.includes(r.priority))
        return false;

      // hne filter Ø­Ø³Ø¨ affected service.
      if (filters.services.length && !filters.services.includes(r.affected_service))
        return false;

      // hne filter Ø­Ø³Ø¨ responsible group.
      if (filters.groups.length && !filters.groups.includes(r.responsible_group))
        return false;

      if (filters.majors.length) {
        const majorLabel = r.is_major ? "Yes" : "No";
        if (!filters.majors.includes(majorLabel)) return false;
      }

      // hne filter date from.
      if (dateFrom && new Date(r.opened) < new Date(dateFrom))
        return false;

      // hne filter date to.
      if (dateTo && new Date(r.opened) > new Date(dateTo))
        return false;

      return true;

    });

  }, [rows, filters, dateFrom, dateTo]);

  // hne n7esbou 9addeh men filter activÃ© taw.
  const activeFilterCount = useMemo(
    () =>
      [
        filters.search,
        filters.states.length,
        filters.priorities.length,
        filters.services.length,
        filters.groups.length,
        filters.majors.length,
        dateFrom,
        dateTo,
      ].filter(Boolean).length,
    [filters, dateFrom, dateTo]
  );

  // hne ki l user yclicki Analyse, ne5dhou rows sÃ©lectionnÃ©s w nemchiw lel page analysis.
  function handleAnalyse() {

    // hne n5arjou data elli l user sÃ©lectionnÃ©ha bark.
    const selectedData = filteredRows.filter((r) =>
      selectedIds.includes(r.id)
    );

    navigate("/incidents-analysis", {
      state: { data: selectedData, selectedKpi }
    });

  }

  // hne nraj3ou filters lkol lel initial state.
  function resetFilters() {
    setFilters({
      search: "",
      states: [],
      priorities: [],
      services: [],
      groups: [],
      majors: []
    });
    setDateFrom("");
    setDateTo("");
  }

  // hne nbaddlou filter mou3ayen Ø­Ø³Ø¨ key elli jeya.
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

  // hne na3rfou columns mta3 tableau w chnia kol colonne taffichi.
  const columns = useMemo(() => [

    { field: "number", headerName: "Incident ID", flex: 1, minWidth: 140 },

    {
      field: "state",
      headerName: "Status",
      flex: 1,
      minWidth: 130,
      renderCell: (params) => {

        // hne nbadlou couleur mta3 status Ø­Ø³Ø¨ valeur.
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

        {isAdmin ? (
          <DeleteToolbar
            selectedIds={selectedIds}
            setSelectedIds={setSelectedIds}
            rows={rows}
            setRows={setRows}
            api="/incidents/delete/"
          />
        ) : <Box />}

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
        <Autocomplete
          multiple
          options={majorOptions}
          value={filters.majors}
          onChange={(e, v) => setFilters({ ...filters, majors: v })}
          renderInput={(params) => (
            <TextField {...params} label="Major" size="small" />
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
          // hne ki l user yclicki 3la row, nemchiw lel details mta3 incident hedheka.
          onRowClick={(params) =>
            navigate(`/incidents/${params.row.number}`)
          }
          pageSizeOptions={[10, 25, 50]}
        />

      </Box>

    </Box>

  );

}
