import React, { useMemo } from "react";
import { Box, Button, Chip, Paper, Stack, Typography, useTheme } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { ResponsiveBar } from "@nivo/bar";
import { ResponsiveLine } from "@nivo/line";
import { ResponsivePie } from "@nivo/pie";
import { useLocation, useNavigate } from "react-router-dom";
import Header from "../../components/Header";
import {
  agingByState,
  countBy,
  countWhere,
  monthlyDualSeries,
  monthlySeries,
  ratio,
  topLabel,
} from "../analysis/analysisUtils";

function KpiCard({ title, value, note }) {
  return (
    <Paper sx={{ p: 2.2, flex: 1, minWidth: 200 }}>
      <Typography variant="body2" color="text.secondary" mb={0.8}>
        {title}
      </Typography>
      <Typography variant="h4" fontWeight={700}>
        {value}
      </Typography>
      <Typography variant="body2" color="text.secondary" mt={0.8}>
        {note}
      </Typography>
    </Paper>
  );
}

function ChartCard({ title, note, children, height = 320 }) {
  return (
    <Paper sx={{ p: 2, flex: 1, minWidth: 320 }}>
      <Typography variant="h6">{title}</Typography>
      {note ? (
        <Typography variant="body2" color="text.secondary" mb={1.5} mt={0.5}>
          {note}
        </Typography>
      ) : (
        <Box mb={1.5} />
      )}
      <Box sx={{ height }}>{children}</Box>
    </Paper>
  );
}

export default function RequestsAnalysis() {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const rows = Array.isArray(location.state?.data) ? location.state.data : [];

  const openRows = useMemo(
    () => rows.filter((row) => !["Closed", "Resolved", "Completed"].includes(row.state)),
    [rows]
  );
  const closedRows = useMemo(
    () => rows.filter((row) => ["Closed", "Resolved", "Completed"].includes(row.state)),
    [rows]
  );

  const openedMonthly = useMemo(() => monthlySeries(rows, "opened"), [rows]);
  const openedVsClosed = useMemo(
    () => monthlyDualSeries(rows, "opened", "closed", "Opened", "Closed"),
    [rows]
  );
  const agingStateData = useMemo(() => agingByState(openRows, "opened", "state"), [openRows]);
  const services = useMemo(() => countBy(rows, "it_service"), [rows]);
  const groups = useMemo(() => countBy(rows, "responsible_group"), [rows]);
  const requestedFor = useMemo(() => countBy(rows, "requested_for"), [rows]);
  const items = useMemo(() => countBy(rows, "item"), [rows]);

  const columns = [
    { field: "number", headerName: "Request ID", flex: 1, minWidth: 140 },
    { field: "state", headerName: "Status", flex: 1, minWidth: 120 },
    { field: "item", headerName: "Item", flex: 1.2, minWidth: 180 },
    { field: "it_service", headerName: "IT Service", flex: 1.2, minWidth: 170 },
    { field: "responsible_group", headerName: "Group", flex: 1.2, minWidth: 170 },
    { field: "requested_for", headerName: "Requested For", flex: 1.1, minWidth: 160 },
    { field: "opened", headerName: "Opened", flex: 1, minWidth: 150 },
    { field: "closed", headerName: "Closed", flex: 1, minWidth: 150 },
  ];

  if (!rows.length) {
    return (
      <Box>
        <Header title="REQUESTS DASHBOARD" subTitle="No requests selected" />
        <Paper sx={{ p: 2.5 }}>
          <Typography mb={2}>
            Select one or more requests from the requests table, then click Analyse again.
          </Typography>
          <Button variant="outlined" onClick={() => navigate("/requests")}>
            Back to requests
          </Button>
        </Paper>
      </Box>
    );
  }

  const total = rows.length;
  const backlog = openRows.length;
  const closed = closedRows.length;
  const olderThan60 = agingStateData.find((item) => item.aging === "> 60 Days")?.total || 0;
  const modernWorkplaceClosed = countWhere(
    closedRows,
    (row) => String(row.it_service || "").toLowerCase().includes("modern workplace")
  );

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
        <Header
          title="SERVICE REQUEST FULFILLMENT DASHBOARD"
          subTitle={`${total} selected requests - KPI and aging view aligned to the monthly report`}
        />
        <Button variant="outlined" onClick={() => navigate("/requests")}>
          Back
        </Button>
      </Stack>

      <Stack direction={{ xs: "column", lg: "row" }} spacing={2} mb={2}>
        <KpiCard
          title="Closed Requests"
          value={closed}
          note={`${ratio(closed, total)}% of selected requests are closed`}
        />
        <KpiCard
          title="Backlog"
          value={backlog}
          note={`${ratio(backlog, total)}% are still pending attention`}
        />
        <KpiCard
          title="Control KPI"
          value={total}
          note={`Top service: ${topLabel(rows, "it_service")}`}
        />
        <KpiCard
          title="> 60 Days Backlog"
          value={olderThan60}
          note={`${ratio(olderThan60, backlog || 1)}% of backlog is older than 60 days`}
        />
      </Stack>

      <Stack direction={{ xs: "column", xl: "row" }} spacing={2} mb={2}>
        <ChartCard
          title="Service Request KPI Results - Past 6 Months"
          note="Selected requests opened by month, used as control KPI trend."
        >
          <ResponsiveLine
            data={[
              {
                id: "Request Volume",
                data: openedMonthly.map((item) => ({ x: item.month, y: item.value })),
              },
            ]}
            margin={{ top: 20, right: 20, bottom: 60, left: 50 }}
            xScale={{ type: "point" }}
            yScale={{ type: "linear", min: 0, max: "auto", stacked: false }}
            axisBottom={{ tickRotation: -35, legend: "Month", legendOffset: 48 }}
            axisLeft={{ legend: "Requests", legendOffset: -40 }}
            pointSize={8}
            pointBorderWidth={2}
            pointBorderColor={{ from: "serieColor" }}
            useMesh
            colors={{ scheme: "category10" }}
            enableArea
            areaOpacity={0.08}
            theme={{ textColor: theme.palette.text.primary }}
          />
        </ChartCard>

        <ChartCard
          title="Backlog vs Closed Trend"
          note="Shows the selected scope trend between newly opened and closed requests."
        >
          <ResponsiveBar
            data={openedVsClosed}
            keys={["Opened", "Closed"]}
            indexBy="month"
            groupMode="grouped"
            margin={{ top: 20, right: 20, bottom: 60, left: 50 }}
            padding={0.28}
            colors={{ scheme: "set2" }}
            axisBottom={{ tickRotation: -35 }}
            axisLeft={{ legend: "Count", legendOffset: -40 }}
            theme={{ textColor: theme.palette.text.primary }}
          />
        </ChartCard>
      </Stack>

      <Paper sx={{ p: 2, mb: 2 }}>
        <Typography variant="h6" mb={1}>
          KPI Highlights
        </Typography>
        <Stack direction="row" flexWrap="wrap" gap={1}>
          <Chip label={`Top service: ${services[0]?.label || "Unknown"}`} color="primary" variant="outlined" />
          <Chip label={`Top item: ${items[0]?.label || "Unknown"}`} color="primary" variant="outlined" />
          <Chip label={`Top group: ${groups[0]?.label || "Unknown"}`} color="primary" variant="outlined" />
          <Chip
            label={`${modernWorkplaceClosed} closed requests tied to Modern Workplace`}
            color="secondary"
            variant="outlined"
          />
        </Stack>
      </Paper>

      <Stack direction={{ xs: "column", xl: "row" }} spacing={2} mb={2}>
        <ChartCard
          title="Aging by State"
          note="Backlog aging structure inspired by the request aging dashboard."
          height={300}
        >
          <ResponsiveBar
            data={agingStateData}
            keys={[...new Set(openRows.map((row) => row.state).filter(Boolean))]}
            indexBy="aging"
            groupMode="stacked"
            margin={{ top: 20, right: 20, bottom: 60, left: 50 }}
            padding={0.28}
            colors={{ scheme: "paired" }}
            axisLeft={{ legend: "Request Count", legendOffset: -40 }}
            theme={{ textColor: theme.palette.text.primary }}
          />
        </ChartCard>

        <ChartCard
          title="Aging by Group Level"
          note="Distribution of backlog volume by responsible group."
          height={300}
        >
          <ResponsivePie
            data={groups.slice(0, 6).map((item) => ({ id: item.label, label: item.label, value: item.value }))}
            margin={{ top: 20, right: 80, bottom: 50, left: 80 }}
            innerRadius={0.55}
            padAngle={0.7}
            cornerRadius={3}
            activeOuterRadiusOffset={8}
            colors={{ scheme: "set2" }}
            theme={{ textColor: theme.palette.text.primary }}
          />
        </ChartCard>
      </Stack>

      <Stack direction={{ xs: "column", xl: "row" }} spacing={2} mb={2}>
        <ChartCard
          title="Aging by Responsible Group (Top 10)"
          note="Backlog concentration by responsible group."
        >
          <ResponsiveBar
            data={groups.slice(0, 10).map((item) => ({ label: item.label, value: item.value }))}
            keys={["value"]}
            indexBy="label"
            margin={{ top: 20, right: 20, bottom: 90, left: 50 }}
            padding={0.3}
            colors={{ scheme: "nivo" }}
            axisBottom={{ tickRotation: -35 }}
            axisLeft={{ legend: "Count", legendOffset: -40 }}
            theme={{ textColor: theme.palette.text.primary }}
          />
        </ChartCard>

        <ChartCard
          title="Top Requested For"
          note="Selected request scope by requested user population."
        >
          <ResponsiveBar
            data={requestedFor.slice(0, 10).map((item) => ({ label: item.label, value: item.value }))}
            keys={["value"]}
            indexBy="label"
            margin={{ top: 20, right: 20, bottom: 90, left: 50 }}
            padding={0.3}
            colors={{ scheme: "paired" }}
            axisBottom={{ tickRotation: -35 }}
            axisLeft={{ legend: "Count", legendOffset: -40 }}
            theme={{ textColor: theme.palette.text.primary }}
          />
        </ChartCard>
      </Stack>

      <Paper sx={{ p: 2 }}>
        <Typography variant="h6" mb={1.5}>
          Selected Request Scope
        </Typography>
        <Box sx={{ height: 520 }}>
          <DataGrid
            rows={rows}
            columns={columns}
            disableRowSelectionOnClick
            getRowId={(row) => row.id}
            onRowClick={(params) => navigate(`/requests/${params.row.number}`)}
            pageSizeOptions={[10, 25, 50]}
          />
        </Box>
      </Paper>
    </Box>
  );
}
