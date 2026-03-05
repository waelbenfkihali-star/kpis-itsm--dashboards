import React, { useMemo, useState } from "react";
import { Box } from "@mui/material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import Header from "../../components/Header"; // عدّل المسار حسب مكان الصفحة عندك

// ✅ Front-only mock data
const MOCK_REQUESTS = [
  {
    id: 1,
    number: "REQ-2001",
    state: "Open",
    priority: "P2",
    item: "New Laptop",
    it_service: "Workstation",
    responsible_group: "Service Desk",
    opened: "2026-03-01",
    closed: "",
    sla_breached: false,
  },
  {
    id: 2,
    number: "REQ-2002",
    state: "Closed",
    priority: "P3",
    item: "Access VPN",
    it_service: "Network",
    responsible_group: "Network",
    opened: "2026-02-20",
    closed: "2026-02-22",
    sla_breached: false,
  },
  {
    id: 3,
    number: "REQ-2003",
    state: "Open",
    priority: "P1",
    item: "SAP Role Request",
    it_service: "ERP",
    responsible_group: "Application Support",
    opened: "2026-03-03",
    closed: "",
    sla_breached: true,
  },
];

export default function Requests() {
  const [rows] = useState(MOCK_REQUESTS);

  const columns = useMemo(
    () => [
      { field: "number", headerName: "Request ID", flex: 1, minWidth: 140 },
      { field: "state", headerName: "Status", flex: 1, minWidth: 120 },
      { field: "priority", headerName: "Priority", flex: 0.8, minWidth: 90 },
      { field: "item", headerName: "Item", flex: 1.2, minWidth: 160 },
      { field: "it_service", headerName: "IT Service", flex: 1, minWidth: 140 },
      {
        field: "responsible_group",
        headerName: "Assignment Group",
        flex: 1.2,
        minWidth: 180,
      },
      { field: "opened", headerName: "Opened", flex: 1, minWidth: 120 },
      { field: "closed", headerName: "Closed", flex: 1, minWidth: 120 },
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
      <Header title="REQUESTS" subTitle="Service Requests - List & tracking" />

      <Box sx={{ height: 650, mx: "auto" }}>
        <DataGrid
          rows={rows}
          columns={columns}
          checkboxSelection
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