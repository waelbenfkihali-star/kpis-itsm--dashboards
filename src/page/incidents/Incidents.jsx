import React, { useMemo, useState } from "react";
import { Box } from "@mui/material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import Header from "../../components/Header"; // عدّل المسار حسب مشروعك

// ✅ Front-only mock data (بدّل/زيد كيف تحب)
const MOCK_INCIDENTS = [
  {
    id: 1,
    number: "INC-1001",
    state: "Open",
    priority: "P1",
    responsible_group: "Service Desk",
    opened: "2026-03-01",
    closed: "",
    it_service: "Email",
    is_major: true,
    sla_breached: true,
  },
  {
    id: 2,
    number: "INC-1002",
    state: "Resolved",
    priority: "P2",
    responsible_group: "Network",
    opened: "2026-03-02",
    closed: "2026-03-03",
    it_service: "VPN",
    is_major: false,
    sla_breached: false,
  },
  {
    id: 3,
    number: "INC-1003",
    state: "Closed",
    priority: "P3",
    responsible_group: "Application Support",
    opened: "2026-02-25",
    closed: "2026-02-26",
    it_service: "ERP",
    is_major: false,
    sla_breached: false,
  },
];

export default function Incidents() {
  const [rows] = useState(MOCK_INCIDENTS);

  // ✅ DataGrid columns (Excel-like)
  const columns = useMemo(
    () => [
      { field: "number", headerName: "Incident ID", flex: 1, minWidth: 140 },
      { field: "state", headerName: "Status", flex: 1, minWidth: 120 },
      { field: "priority", headerName: "Priority", flex: 1, minWidth: 90 },
      {
        field: "responsible_group",
        headerName: "Assignment Group",
        flex: 1.2,
        minWidth: 180,
      },
      { field: "opened", headerName: "Opened", flex: 1, minWidth: 120 },
      { field: "closed", headerName: "Closed", flex: 1, minWidth: 120 },
      { field: "it_service", headerName: "IT Service", flex: 1, minWidth: 140 },
      {
        field: "is_major",
        headerName: "Major",
        flex: 0.7,
        minWidth: 90,
        type: "boolean",
      },
      {
        field: "sla_breached",
        headerName: "SLA Breached",
        flex: 0.9,
        minWidth: 130,
        type: "boolean",
      },
    ],
    []
  );

  return (
    <Box>
      <Header title="INCIDENTS" subTitle="Incident Management - List & tracking" />

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