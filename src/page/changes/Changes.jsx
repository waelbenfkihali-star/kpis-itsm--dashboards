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
import PageFilters from "../../components/PageFilters";

const API_BASE = "http://localhost:8001/api";

export default function Changes() {

  const navigate = useNavigate();

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [selectedIds, setSelectedIds] = useState([]);

  const [filters, setFilters] = useState({
    search: "",
    states: [],
    types: [],
    priorities: [],
    groups: [],
    dateFrom: "",
    dateTo: ""
  });

  useEffect(() => {
    fetch(`${API_BASE}/changes/`)
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

  const typeOptions = useMemo(
    () => [...new Set(rows.map((r) => r.type).filter(Boolean))],
    [rows]
  );

  const priorityOptions = useMemo(
    () => [...new Set(rows.map((r) => r.priority).filter(Boolean))],
    [rows]
  );

  const groupOptions = useMemo(
    () => [...new Set(rows.map((r) => r.responsible_group).filter(Boolean))],
    [rows]
  );

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

      if (filters.types.length && !filters.types.includes(r.type))
        return false;

      if (filters.priorities.length && !filters.priorities.includes(r.priority))
        return false;

      if (filters.groups.length && !filters.groups.includes(r.responsible_group))
        return false;

      if (filters.dateFrom && new Date(r.planned_start_date) < new Date(filters.dateFrom))
        return false;

      if (filters.dateTo && new Date(r.planned_start_date) > new Date(filters.dateTo))
        return false;

      return true;

    });

  }, [rows, filters]);

  const activeFilterCount = useMemo(
    () =>
      [
        filters.search,
        filters.states.length,
        filters.types.length,
        filters.priorities.length,
        filters.groups.length,
        filters.dateFrom,
        filters.dateTo,
      ].filter(Boolean).length,
    [filters]
  );

  function resetFilters() {
    setFilters({
      search: "",
      states: [],
      types: [],
      priorities: [],
      groups: [],
      dateFrom: "",
      dateTo: ""
    });
  }

  const columns = [

    { field: "number", headerName: "Change ID", flex: 1 },

    {
      field: "state",
      headerName: "Status",
      flex: 1,
      renderCell: (params) => {

        const value = params.value || "";
        let color = "default";

        if (value === "Closed") color = "success";
        else if (value === "Scheduled") color = "warning";
        else if (value === "Implementation") color = "info";

        return <Chip label={value} color={color} size="small" />;

      }
    },

    { field: "type", headerName: "Type", flex: 1 },

    { field: "priority", headerName: "Priority", flex: 1 },

    { field: "affected_service", headerName: "Service", flex: 1.2 },

    { field: "responsible_group", headerName: "Group", flex: 1.2 },

    { field: "planned_start_date", headerName: "Planned Start", flex: 1 },

    { field: "closed", headerName: "Closed", flex: 1 }

  ];

  return (
    <Box>

      <Header title="CHANGES" subTitle="Key change records to focus on" />

      {err && <Alert severity="error" sx={{ mb:2 }}>{err}</Alert>}

      <Stack direction="row" justifyContent="space-between" sx={{ mb:2 }}>

        <DeleteToolbar
          selectedIds={selectedIds}
          setSelectedIds={setSelectedIds}
          rows={rows}
          setRows={setRows}
          api={`${API_BASE}/changes/delete/`}
        />

        <Button
          variant="contained"
          color="success"
          disabled={!selectedIds.length}
          onClick={()=>console.log("Analyse rows:",selectedIds)}
        >
          Analyse
        </Button>

      </Stack>

      <PageFilters
        title="Change Filters"
        activeCount={activeFilterCount}
        onReset={resetFilters}
      >
        <TextField
          label="Global Search"
          size="small"
          value={filters.search}
          onChange={(e)=>setFilters({...filters,search:e.target.value})}
          sx={{width:220}}
        />

        <Autocomplete
          multiple
          options={stateOptions}
          value={filters.states}
          onChange={(e,v)=>setFilters({...filters,states:v})}
          renderInput={(p)=><TextField {...p} label="Status" size="small"/>}
          sx={{width:200}}
        />

        <Autocomplete
          multiple
          options={typeOptions}
          value={filters.types}
          onChange={(e,v)=>setFilters({...filters,types:v})}
          renderInput={(p)=><TextField {...p} label="Type" size="small"/>}
          sx={{width:200}}
        />

        <Autocomplete
          multiple
          options={priorityOptions}
          value={filters.priorities}
          onChange={(e,v)=>setFilters({...filters,priorities:v})}
          renderInput={(p)=><TextField {...p} label="Priority" size="small"/>}
          sx={{width:200}}
        />

        <Autocomplete
          multiple
          options={groupOptions}
          value={filters.groups}
          onChange={(e,v)=>setFilters({...filters,groups:v})}
          renderInput={(p)=><TextField {...p} label="Group" size="small"/>}
          sx={{width:200}}
        />

        <TextField
          type="date"
          label="From"
          size="small"
          InputLabelProps={{shrink:true}}
          value={filters.dateFrom}
          onChange={(e)=>setFilters({...filters,dateFrom:e.target.value})}
        />

        <TextField
          type="date"
          label="To"
          size="small"
          InputLabelProps={{shrink:true}}
          value={filters.dateTo}
          onChange={(e)=>setFilters({...filters,dateTo:e.target.value})}
        />
      </PageFilters>

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
          onRowClick={(p)=>navigate(`/changes/${p.row.number}`)}
          pageSizeOptions={[10,25,50]}
        />

      </Box>

    </Box>
  );
}
