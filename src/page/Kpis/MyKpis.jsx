import React, { useEffect, useMemo, useState } from "react";
import {
  Box,
  IconButton,
  Button,
  Typography,
  Paper,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Stack,
  Autocomplete,
} from "@mui/material";

import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import Header from "../../components/Header";
import PageFilters from "../../components/PageFilters";
import { useNavigate } from "react-router-dom";

import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddOutlinedIcon from "@mui/icons-material/AddOutlined";

import { deleteKpiById, loadKpis, saveKpis } from "./kpiStorage";

const seed = [
  {
    id: 1,
    kpi_id: "5.8.01",
    name: "SLA Compliance",
    owner: "Service Desk",
    module: "Incidents",
    frequency: "Monthly",
    unit: "%",
    status: "Active",
  },
  {
    id: 2,
    kpi_id: "5.8.02",
    name: "Incident Resolution Time",
    owner: "IT Support",
    module: "Incidents",
    frequency: "Weekly",
    unit: "minutes",
    status: "Active",
  },
];

const MyKpis = () => {

  const navigate = useNavigate();

  const [rows, setRows] = useState([]);
  const [filters, setFilters] = useState({
    search: "",
    kpiIds: [],
    names: [],
    owners: [],
    modules: [],
    frequencies: [],
    units: [],
    statuses: [],
  });

  const [deleteId, setDeleteId] = useState(null);

  useEffect(() => {

    const list = loadKpis();

    if (!list.length) {
      saveKpis(seed);
      setRows(seed);
    } else {
      setRows(list);
    }

  }, []);

  function confirmDelete() {

    const next = deleteKpiById(deleteId);
    setRows(next);
    setDeleteId(null);

  }

  const kpiIdOptions = useMemo(
    () => [...new Set(rows.map((r) => r.kpi_id).filter(Boolean))],
    [rows]
  );

  const nameOptions = useMemo(
    () => [...new Set(rows.map((r) => r.name).filter(Boolean))],
    [rows]
  );

  const ownerOptions = useMemo(
    () => [...new Set(rows.map((r) => r.owner).filter(Boolean))],
    [rows]
  );

  const moduleOptions = useMemo(
    () => [...new Set(rows.map((r) => r.module).filter(Boolean))],
    [rows]
  );

  const frequencyOptions = useMemo(
    () => [...new Set(rows.map((r) => r.frequency).filter(Boolean))],
    [rows]
  );

  const unitOptions = useMemo(
    () => [...new Set(rows.map((r) => r.unit).filter(Boolean))],
    [rows]
  );

  const statusOptions = useMemo(
    () => [...new Set(rows.map((r) => r.status).filter(Boolean))],
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

      if (filters.kpiIds.length && !filters.kpiIds.includes(r.kpi_id))
        return false;

      if (filters.names.length && !filters.names.includes(r.name))
        return false;

      if (filters.owners.length && !filters.owners.includes(r.owner))
        return false;

      if (filters.modules.length && !filters.modules.includes(r.module))
        return false;

      if (filters.frequencies.length && !filters.frequencies.includes(r.frequency))
        return false;

      if (filters.units.length && !filters.units.includes(r.unit))
        return false;

      if (filters.statuses.length && !filters.statuses.includes(r.status))
        return false;

      return true;
    });
  }, [rows, filters]);

  const activeFilterCount = useMemo(() => {
    return [
      filters.search,
      filters.kpiIds.length,
      filters.names.length,
      filters.owners.length,
      filters.modules.length,
      filters.frequencies.length,
      filters.units.length,
      filters.statuses.length,
    ].filter(Boolean).length;
  }, [filters]);

  function resetFilters() {
    setFilters({
      search: "",
      kpiIds: [],
      names: [],
      owners: [],
      modules: [],
      frequencies: [],
      units: [],
      statuses: [],
    });
  }

  const columns = useMemo(
    () => [

      { field: "kpi_id", headerName: "KPI ID", flex: 1, minWidth: 120 },

      { field: "name", headerName: "Name", flex: 2, minWidth: 220 },

      { field: "owner", headerName: "Owner", flex: 1, minWidth: 140 },

      { field: "module", headerName: "Module", flex: 1, minWidth: 130 },

      { field: "frequency", headerName: "Frequency", flex: 1, minWidth: 120 },

      { field: "unit", headerName: "Unit", flex: 1, minWidth: 90 },

      {
        field: "status",
        headerName: "Status",
        flex: 1,
        minWidth: 110,

        renderCell: (params) => (

          <Chip
            label={params.value}
            color={params.value === "Active" ? "success" : "default"}
            size="small"
          />

        ),
      },

      {
        field: "actions",
        headerName: "Actions",
        minWidth: 140,
        sortable: false,
        filterable: false,

        renderCell: (params) => (

          <Box>

            <IconButton
              color="primary"
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/EditKpi/${params.id}`);
              }}
            >
              <EditIcon fontSize="small" />
            </IconButton>

            <IconButton
              color="error"
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                setDeleteId(params.id);
              }}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>

          </Box>

        ),
      },
    ],
    [navigate]
  );

  return (

    <Box sx={{ p: 2 }}>

      <Header
        title="MY KPIs"
        subTitle="Manage your KPI definitions"
      />

      <Box sx={{ mt: 2 }}>

        {/* Top Bar */}

        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 1,
            gap: 2,
          }}
        >

          <Typography variant="body2">

            {filteredRows.length} KPI{filteredRows.length !== 1 && "s"}

          </Typography>

          <Button
            variant="contained"
            startIcon={<AddOutlinedIcon />}
            onClick={() => navigate("/Kpiform")}
            sx={{ textTransform: "capitalize" }}
          >
            Define KPI
          </Button>

        </Box>

        {/* Table */}

        <PageFilters
          title="KPI Filters"
          activeCount={activeFilterCount}
          onReset={resetFilters}
        >
              <TextField
                size="small"
                label="Global Search"
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                sx={{ width: 220 }}
              />

              <Autocomplete
                multiple
                options={kpiIdOptions}
                value={filters.kpiIds}
                onChange={(e, v) => setFilters({ ...filters, kpiIds: v })}
                renderInput={(params) => (
                  <TextField {...params} label="KPI ID" size="small" />
                )}
                sx={{ width: 190 }}
              />

              <Autocomplete
                multiple
                options={nameOptions}
                value={filters.names}
                onChange={(e, v) => setFilters({ ...filters, names: v })}
                renderInput={(params) => (
                  <TextField {...params} label="Name" size="small" />
                )}
                sx={{ width: 220 }}
              />

              <Autocomplete
                multiple
                options={ownerOptions}
                value={filters.owners}
                onChange={(e, v) => setFilters({ ...filters, owners: v })}
                renderInput={(params) => (
                  <TextField {...params} label="Owner" size="small" />
                )}
                sx={{ width: 200 }}
              />

              <Autocomplete
                multiple
                options={moduleOptions}
                value={filters.modules}
                onChange={(e, v) => setFilters({ ...filters, modules: v })}
                renderInput={(params) => (
                  <TextField {...params} label="Module" size="small" />
                )}
                sx={{ width: 180 }}
              />

              <Autocomplete
                multiple
                options={frequencyOptions}
                value={filters.frequencies}
                onChange={(e, v) => setFilters({ ...filters, frequencies: v })}
                renderInput={(params) => (
                  <TextField {...params} label="Frequency" size="small" />
                )}
                sx={{ width: 180 }}
              />

              <Autocomplete
                multiple
                options={unitOptions}
                value={filters.units}
                onChange={(e, v) => setFilters({ ...filters, units: v })}
                renderInput={(params) => (
                  <TextField {...params} label="Unit" size="small" />
                )}
                sx={{ width: 160 }}
              />

              <Autocomplete
                multiple
                options={statusOptions}
                value={filters.statuses}
                onChange={(e, v) => setFilters({ ...filters, statuses: v })}
                renderInput={(params) => (
                  <TextField {...params} label="Status" size="small" />
                )}
                sx={{ width: 170 }}
              />
        </PageFilters>

        <Paper sx={{ height: 600 }}>

          <DataGrid
          rows={filteredRows}
          columns={columns}

          checkboxSelection
          disableRowSelectionOnClick
          onRowClick={(params) => navigate(`/mykpis/${params.row.id}`)}

          slots={{ toolbar: GridToolbar }}

            pageSizeOptions={[5, 10, 20]}

            initialState={{
              pagination: {
                paginationModel: {
                  pageSize: 10,
                },
              },
            }}

            sx={{
              border: 0,
              "& .MuiDataGrid-columnHeaders": {
                fontWeight: "bold",
              },
            }}

            localeText={{
              noRowsLabel: "No KPI defined yet",
            }}
          />

        </Paper>

      </Box>

      {/* Delete Dialog */}

      <Dialog open={Boolean(deleteId)} onClose={() => setDeleteId(null)}>

        <DialogTitle>Delete KPI</DialogTitle>

        <DialogContent>

          <Typography>
            Are you sure you want to delete this KPI ?
          </Typography>

        </DialogContent>

        <DialogActions>

          <Button onClick={() => setDeleteId(null)}>
            Cancel
          </Button>

          <Button
            color="error"
            variant="contained"
            onClick={confirmDelete}
          >
            Delete
          </Button>

        </DialogActions>

      </Dialog>

    </Box>

  );
};

export default MyKpis;
