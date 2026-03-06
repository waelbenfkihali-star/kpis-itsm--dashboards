import React, { useMemo, useState } from "react";
import { Box } from "@mui/material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import Header from "../../components/Header"; // عدّل المسار حسب مكان الصفحة عندك

// ✅ Front-only mock data
const MOCK_CHANGES = [
  {
    id: 1,
    number: "CHG-3001",
    state: "Open",
    priority: "P2",
    change_type: "Normal",
    approval: "Requested",
    opened: "2026-03-01",
    closed: "",
    planned_start_date: "2026-03-05",
    planned_end_date: "2026-03-05",
    responsible_group: "Change Management",
    success: null,
  },
  {
    id: 2,
    number: "CHG-3002",
    state: "Closed",
    priority: "P3",
    change_type: "Standard",
    approval: "Approved",
    opened: "2026-02-18",
    closed: "2026-02-20",
    planned_start_date: "2026-02-19",
    planned_end_date: "2026-02-19",
    responsible_group: "Infrastructure",
    success: true,
  },
  {
    id: 3,
    number: "CHG-3003",
    state: "Closed",
    priority: "P1",
    change_type: "Emergency",
    approval: "Approved",
    opened: "2026-03-02",
    closed: "2026-03-02",
    planned_start_date: "2026-03-02",
    planned_end_date: "2026-03-02",
    responsible_group: "Network",
    success: false,
  },
];

export default function Changes() {
  const [rows] = useState(MOCK_CHANGES);

  const columns = useMemo(
    () => [
      { field: "number", headerName: "Change ID", flex: 1, minWidth: 140 },
      { field: "state", headerName: "Status", flex: 1, minWidth: 120 },
      { field: "priority", headerName: "Priority", flex: 0.8, minWidth: 90 },
      { field: "change_type", headerName: "Type", flex: 1, minWidth: 120 },
      { field: "approval", headerName: "Approval", flex: 1, minWidth: 120 },
      { field: "opened", headerName: "Opened", flex: 1, minWidth: 120 },
      { field: "closed", headerName: "Closed", flex: 1, minWidth: 120 },
      {
        field: "planned_start_date",
        headerName: "Planned Start",
        flex: 1,
        minWidth: 140,
      },
      {
        field: "planned_end_date",
        headerName: "Planned End",
        flex: 1,
        minWidth: 140,
      },
      {
        field: "responsible_group",
        headerName: "Assignment Group",
        flex: 1.2,
        minWidth: 180,
      },
      {
        field: "success",
        headerName: "Success",
        flex: 0.8,
        minWidth: 110,
        type: "boolean",
      },
    ],
    []
  );

  return (
    <Box>
      <Header title="CHANGES" subTitle="Change Management - List & tracking" />

      <Box sx={{ height: 650, mx: "auto" }}>
        <DataGrid
          rows={rows}
          columns={columns}
          disableRowSelectionOnClick
          slots={{ toolbar: GridToolbar }}
          initialState={{
            pagination: { paginationModel: { pageSize: 10, page: 0 } },
          }}
          pageSizeOptions={[10, 25, 50]}
        />
      </Box>
    </Box>
  );
}