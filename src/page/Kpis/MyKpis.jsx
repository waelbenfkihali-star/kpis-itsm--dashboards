import React, { useEffect, useMemo, useState } from "react";
import { Box, IconButton, Button } from "@mui/material";
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

  // ✅ load from localStorage (if empty, seed)
  useEffect(() => {
    const list = loadKpis();
    if (!list.length) {
      saveKpis(seed);
      setRows(seed);
    } else {
      setRows(list);
    }
  }, []);

  function deleteKpi(id) {
    const next = deleteKpiById(id);
    setRows(next);
  }

  const columns = useMemo(
    () => [
      { field: "kpi_id", headerName: "KPI ID", flex: 1, minWidth: 120 },
      { field: "name", headerName: "Name", flex: 2, minWidth: 220 },
      { field: "owner", headerName: "Owner", flex: 1, minWidth: 140 },
      { field: "frequency", headerName: "Frequency", flex: 1, minWidth: 120 },
      { field: "unit", headerName: "Unit", flex: 1, minWidth: 90 },
      { field: "status", headerName: "Status", flex: 1, minWidth: 110 },
      {
        field: "actions",
        headerName: "Actions",
        flex: 1,
        minWidth: 140,
        sortable: false,
        filterable: false,
        renderCell: (params) => (
          <>
            <IconButton
              color="primary"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                navigate(`/EditKpi/${params.id}`);
              }}
            >
              <EditIcon />
            </IconButton>

            <IconButton
              color="error"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                deleteKpi(params.id);
              }}
            >
              <DeleteIcon />
            </IconButton>
          </>
        ),
      },
    ],
    [navigate] // ok
  );

  return (
    
    
    <Box sx={{ p: 2 }}>
      <Header title="MY KPIs" subTitle="Manage your KPI definitions" />

      {/* ✅ Block متاع التابل: الزر فوقه مباشرة */}
      <Box sx={{ mt: 2 }}>
        {/* زر Define KPI فوق الـDataGrid بالضبط */}
        <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 1 }}>
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
        <Box sx={{ height: 600 }}>
          <DataGrid
            rows={rows}
            columns={columns}
            checkboxSelection
            disableRowSelectionOnClick
            slots={{ toolbar: GridToolbar }}
            pageSizeOptions={[5, 10, 20]}
          />
        </Box>
      </Box>
    </Box>
  );
};

export default MyKpis;