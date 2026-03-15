import React, { useMemo } from "react";
import { Box, Button, Chip, Paper, Stack, Typography, useTheme } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { ResponsiveBar } from "@nivo/bar";
import { ResponsiveLine } from "@nivo/line";
import { useLocation, useNavigate } from "react-router-dom";
import Header from "../../components/Header";
import {
  countBy,
  countWhere,
  diffInDays,
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

export default function ChangesAnalysis() {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const rows = Array.isArray(location.state?.data) ? location.state.data : [];

  const openedMonthly = useMemo(() => monthlySeries(rows, "opened"), [rows]);
  const openedVsClosed = useMemo(
    () => monthlyDualSeries(rows, "opened", "closed", "Opened", "Closed"),
    [rows]
  );
  const services = useMemo(() => countBy(rows, "affected_service"), [rows]);
  const groups = useMemo(() => countBy(rows, "responsible_group"), [rows]);
  const states = useMemo(() => countBy(rows, "state"), [rows]);
  const types = useMemo(() => countBy(rows, "type"), [rows]);

  const columns = [
    { field: "number", headerName: "Change ID", flex: 1, minWidth: 140 },
    { field: "state", headerName: "Status", flex: 1, minWidth: 120 },
    { field: "type", headerName: "Type", flex: 1, minWidth: 120 },
    { field: "priority", headerName: "Priority", flex: 0.8, minWidth: 100 },
    { field: "affected_service", headerName: "Service", flex: 1.2, minWidth: 180 },
    { field: "responsible_group", headerName: "Group", flex: 1.2, minWidth: 170 },
    { field: "planned_start_date", headerName: "Planned Start", flex: 1, minWidth: 150 },
    { field: "planned_end_date", headerName: "Planned End", flex: 1, minWidth: 150 },
    { field: "closed", headerName: "Closed", flex: 1, minWidth: 150 },
  ];

  if (!rows.length) {
    return (
      <Box>
        <Header title="CHANGES DASHBOARD" subTitle="No changes selected" />
        <Paper sx={{ p: 2.5 }}>
          <Typography mb={2}>
            Select one or more changes from the changes table, then click Analyse again.
          </Typography>
          <Button variant="outlined" onClick={() => navigate("/changes")}>
            Back to changes
          </Button>
        </Paper>
      </Box>
    );
  }

  const total = rows.length;
  const critical = countWhere(rows, (row) => row.priority === "P1");
  const open = countWhere(
    rows,
    (row) => !["Closed", "Resolved", "Implemented", "Completed"].includes(row.state)
  );
  const closed = countWhere(
    rows,
    (row) => ["Closed", "Resolved", "Implemented", "Completed"].includes(row.state)
  );
  const emergency = countWhere(
    rows,
    (row) => String(row.type || "").toLowerCase().includes("emergency")
  );
  const pastDue = countWhere(
    rows,
    (row) =>
      !row.closed &&
      diffInDays(row.planned_end_date, new Date()) !== null &&
      diffInDays(row.planned_end_date, new Date()) > 0
  );

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
        <Header
          title="CHANGE MANAGEMENT DASHBOARD"
          subTitle={`${total} selected changes - KPI report aligned to the monthly change slides`}
        />
        <Button variant="outlined" onClick={() => navigate("/changes")}>
          Back
        </Button>
      </Stack>

      <Stack direction={{ xs: "column", lg: "row" }} spacing={2} mb={2}>
        <KpiCard
          title="Critical Changes"
          value={critical}
          note={`${ratio(critical, total)}% of selected changes are priority P1`}
        />
        <KpiCard
          title="Past Due Changes"
          value={pastDue}
          note="Changes not implemented according to planned end date"
        />
        <KpiCard
          title="Control KPI"
          value={total}
          note={`Top service: ${topLabel(rows, "affected_service")}`}
        />
        <KpiCard
          title="Emergency Changes"
          value={emergency}
          note={`${ratio(emergency, total)}% of selected changes are emergency type`}
        />
      </Stack>

      <Stack direction={{ xs: "column", xl: "row" }} spacing={2} mb={2}>
        <ChartCard
          title="Change Management KPI Results - Past 6 Months"
          note="Selected changes opened by month, acting as the control KPI trend."
        >
          <ResponsiveLine
            data={[
              {
                id: "Change Volume",
                data: openedMonthly.map((item) => ({ x: item.month, y: item.value })),
              },
            ]}
            margin={{ top: 20, right: 20, bottom: 60, left: 50 }}
            xScale={{ type: "point" }}
            yScale={{ type: "linear", min: 0, max: "auto", stacked: false }}
            axisBottom={{ tickRotation: -35, legend: "Month", legendOffset: 48 }}
            axisLeft={{ legend: "Changes", legendOffset: -40 }}
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
          title="Open vs Closed Trend"
          note="Selected scope trend between change creation and closure."
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

      <Stack direction={{ xs: "column", lg: "row" }} spacing={2} mb={2}>
        <KpiCard
          title="Open Changes"
          value={open}
          note={`${ratio(open, total)}% of selected changes are still open`}
        />
        <KpiCard
          title="Closed Changes %"
          value={`${ratio(closed, total)}%`}
          note={`${closed} selected changes are already closed`}
        />
        <KpiCard
          title="Top Change Type"
          value={topLabel(rows, "type")}
          note="Most represented type in selected scope"
        />
        <KpiCard
          title="Top Responsible Group"
          value={topLabel(rows, "responsible_group")}
          note="Group carrying the biggest change volume"
        />
      </Stack>

      <Paper sx={{ p: 2, mb: 2 }}>
        <Typography variant="h6" mb={1}>
          KPI Highlights
        </Typography>
        <Stack direction="row" flexWrap="wrap" gap={1}>
          <Chip label={`Top state: ${states[0]?.label || "Unknown"}`} color="primary" variant="outlined" />
          <Chip label={`Top type: ${types[0]?.label || "Unknown"}`} color="primary" variant="outlined" />
          <Chip label={`Top service: ${services[0]?.label || "Unknown"}`} color="primary" variant="outlined" />
          <Chip label={`${emergency} emergency changes in selected scope`} color="secondary" variant="outlined" />
        </Stack>
      </Paper>

      <Stack direction={{ xs: "column", xl: "row" }} spacing={2} mb={2}>
        <ChartCard
          title="Top 10 Affected Services"
          note="Deep dive on services most impacted by selected changes."
        >
          <ResponsiveBar
            data={services.slice(0, 10).map((item) => ({ label: item.label, value: item.value }))}
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

        <ChartCard
          title="Top 10 Responsible Groups"
          note="Groups carrying the highest selected change volume."
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
      </Stack>

      <ChartCard
        title="Change Type Distribution"
        note="Overall spread of change types in the selected scope."
        height={320}
      >
        <ResponsiveBar
          data={types.slice(0, 10).map((item) => ({ label: item.label, value: item.value }))}
          keys={["value"]}
          indexBy="label"
          margin={{ top: 20, right: 20, bottom: 90, left: 50 }}
          padding={0.3}
          colors={{ scheme: "set2" }}
          axisBottom={{ tickRotation: -35 }}
          axisLeft={{ legend: "Count", legendOffset: -40 }}
          theme={{ textColor: theme.palette.text.primary }}
        />
      </ChartCard>

      <Paper sx={{ p: 2, mt: 2 }}>
        <Typography variant="h6" mb={1.5}>
          Selected Change Scope
        </Typography>
        <Box sx={{ height: 520 }}>
          <DataGrid
            rows={rows}
            columns={columns}
            disableRowSelectionOnClick
            getRowId={(row) => row.id}
            onRowClick={(params) => navigate(`/changes/${params.row.number}`)}
            pageSizeOptions={[10, 25, 50]}
          />
        </Box>
      </Paper>
    </Box>
  );
}
