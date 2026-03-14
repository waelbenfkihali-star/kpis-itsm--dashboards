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
import { apiFetch } from "../../utils/api";

export default function Requests() {

  const navigate = useNavigate();

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
          onClick={()=>console.log("Analyse rows:",selectedIds)}
        >
          Analyse
        </Button>

      </Stack>

      <PageFilters
        title="Request Filters"
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
          options={itemOptions}
          value={filters.items}
          onChange={(e,v)=>setFilters({...filters,items:v})}
          renderInput={(p)=><TextField {...p} label="Item" size="small"/>}
          sx={{width:200}}
        />

        <Autocomplete
          multiple
          options={serviceOptions}
          value={filters.services}
          onChange={(e,v)=>setFilters({...filters,services:v})}
          renderInput={(p)=><TextField {...p} label="IT Service" size="small"/>}
          sx={{width:220}}
        />

        <Autocomplete
          multiple
          options={groupOptions}
          value={filters.groups}
          onChange={(e,v)=>setFilters({...filters,groups:v})}
          renderInput={(p)=><TextField {...p} label="Group" size="small"/>}
          sx={{width:220}}
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
          label="Opened From"
          size="small"
          InputLabelProps={{shrink:true}}
          value={filters.openedFrom}
          onChange={(e)=>setFilters({...filters,openedFrom:e.target.value})}
        />

        <TextField
          type="date"
          label="Opened To"
          size="small"
          InputLabelProps={{shrink:true}}
          value={filters.openedTo}
          onChange={(e)=>setFilters({...filters,openedTo:e.target.value})}
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
          onRowClick={(p)=>navigate(`/requests/${p.row.number}`)}
          pageSizeOptions={[10,25,50]}
        />

      </Box>

    </Box>
  );
}
