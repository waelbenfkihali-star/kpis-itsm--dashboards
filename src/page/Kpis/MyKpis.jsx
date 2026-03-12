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
} from "@mui/material";

import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import Header from "../../components/Header";
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
    frequency: "Monthly",
    unit: "%",
    status: "Active",
  },
  {
    id: 2,
    kpi_id: "5.8.02",
    name: "Incident Resolution Time",
    owner: "IT Support",
    frequency: "Weekly",
    unit: "minutes",
    status: "Active",
  },
];

const MyKpis = () => {

  const navigate = useNavigate();

  const [rows, setRows] = useState([]);
  const [search, setSearch] = useState("");

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

  const filteredRows = useMemo(() => {

    if (!search) return rows;

    return rows.filter((r) =>
      Object.values(r).some((v) =>
        String(v).toLowerCase().includes(search.toLowerCase())
      )
    );

  }, [rows, search]);

  const columns = useMemo(
    () => [

      { field: "kpi_id", headerName: "KPI ID", flex: 1, minWidth: 120 },

      { field: "name", headerName: "Name", flex: 2, minWidth: 220 },

      { field: "owner", headerName: "Owner", flex: 1, minWidth: 140 },

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

            {rows.length} KPI{rows.length !== 1 && "s"}

          </Typography>

          <TextField
            size="small"
            placeholder="Search KPI..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

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

        <Paper sx={{ height: 600 }}>

          <DataGrid
            rows={filteredRows}
            columns={columns}

            checkboxSelection
            disableRowSelectionOnClick

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