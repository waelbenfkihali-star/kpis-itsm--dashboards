import React, { useMemo } from "react";
import { Box, Button, Chip, Paper, Stack, Typography, useTheme } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { ResponsiveBar } from "@nivo/bar";
import { ResponsiveLine } from "@nivo/line";
import { useLocation, useNavigate } from "react-router-dom";
import Header from "../../components/Header";
import ChartLegend from "../analysis/ChartLegend";
import {
  countBy,
  countWhere,
  diffInDays,
  getChartColor,
  makeLegendItems,
  monthlyBreakdown,
  monthlyDualSeries,
  monthlySeries,
  ratio,
  renderBarTooltip,
  renderLineTooltip,
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

function ChartCard({ title, note, children, height = 320, legendItems = [] }) {
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
      <ChartLegend items={legendItems} />
    </Paper>
  );
}

export default function ChangesAnalysis() {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const rows = Array.isArray(location.state?.data) ? location.state.data : [];
  const selectedKpi = location.state?.selectedKpi || null;

  const openedMonthly = useMemo(() => monthlySeries(rows, "opened"), [rows]);
  const openedVsClosed = useMemo(
    () => monthlyDualSeries(rows, "opened", "closed", "Opened", "Closed"),
    [rows]
  );
  const services = useMemo(() => countBy(rows, "affected_service"), [rows]);
  const groups = useMemo(() => countBy(rows, "responsible_group"), [rows]);
  const states = useMemo(() => countBy(rows, "state"), [rows]);
  const types = useMemo(() => countBy(rows, "type"), [rows]);
  const serviceMonthly = useMemo(() => monthlyBreakdown(rows, "opened", "affected_service", 5), [rows]);
  const groupMonthly = useMemo(() => monthlyBreakdown(rows, "opened", "responsible_group", 5), [rows]);
  const typeMonthly = useMemo(() => monthlyBreakdown(rows, "opened", "type", 5), [rows]);

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
  const focusedView = useMemo(() => {
    if (!selectedKpi) return null;

    const base = {
      title: `${selectedKpi.kpi_id} - ${selectedKpi.name}`,
      note: selectedKpi.description || "Focused KPI dashboard built from your selected change rows.",
    };

    switch (selectedKpi.kpi_id) {
      case "CHG-01":
        return {
          ...base,
          cards: [
            { title: "Past Due Changes", value: pastDue, note: "Changes past planned end date" },
            { title: "Open Changes", value: open, note: "Open change backlog in selected scope" },
            { title: "Top Group", value: groups[0]?.label || "-", note: "Group most affected by past due work" },
          ],
          chart: { title: "Past Due Changes by Group", data: groups },
          extras: [
            {
              title: "Past Due Change Pressure by Group per Month",
              note: "Monthly comparison between the groups carrying delayed changes.",
              type: "stacked",
              ...groupMonthly,
            },
            {
              title: "Past Due Changes by Service",
              note: "Business-facing view of delayed change concentration.",
              type: "bar",
              data: services,
            },
          ],
        };
      case "CHG-02":
        return {
          ...base,
          cards: [
            { title: "Critical Changes", value: critical, note: `${ratio(critical, total)}% of scope is critical` },
            { title: "Open Critical Pressure", value: open, note: "Open selected changes still under execution" },
            { title: "Top Service", value: services[0]?.label || "-", note: "Service most impacted in selected scope" },
          ],
          chart: { title: "Critical Change Distribution by Service", data: services },
          extras: [
            {
              title: "Critical Changes by Service per Month",
              note: "Monthly service comparison for critical changes.",
              type: "stacked",
              ...monthlyBreakdown(rows.filter((row) => row.priority === "P1"), "opened", "affected_service", 5),
            },
            {
              title: "Critical Changes by Group",
              note: "Operational ownership view for critical changes.",
              type: "bar",
              data: groups,
            },
          ],
        };
      case "CHG-03":
        return {
          ...base,
          cards: [
            { title: "Changes Created", value: total, note: "Selected change volume used as control KPI" },
            { title: "Closed Changes", value: closed, note: `${ratio(closed, total)}% already closed` },
            { title: "Emergency Changes", value: emergency, note: "Emergency load within selected scope" },
          ],
          line: { title: "Changes Created Trend", data: openedMonthly, label: "Created Changes" },
          extras: [
            {
              title: "Change Volume by Service per Month",
              note: "Monthly comparison between top impacted services.",
              type: "stacked",
              ...serviceMonthly,
            },
            {
              title: "Change Volume by Type per Month",
              note: "Shows how change types evolved across months in the selected scope.",
              type: "stacked",
              ...typeMonthly,
            },
          ],
        };
      case "CHG-04":
        return {
          ...base,
          cards: [
            { title: "Emergency Changes", value: emergency, note: `${ratio(emergency, total)}% of scope is emergency type` },
            { title: "Open Changes", value: open, note: "Emergency operational pressure inside selected scope" },
            { title: "Top Group", value: groups[0]?.label || "-", note: "Group most exposed to emergency work" },
          ],
          chart: { title: "Emergency Change Distribution by Group", data: groups },
          extras: [
            {
              title: "Emergency Changes by Group per Month",
              note: "Monthly comparison of emergency workload by group.",
              type: "stacked",
              ...monthlyBreakdown(rows.filter((row) => String(row.type || "").toLowerCase().includes("emergency")), "opened", "responsible_group", 5),
            },
            {
              title: "Emergency Changes by Service",
              note: "Service view for emergency change concentration.",
              type: "bar",
              data: services,
            },
          ],
        };
      case "CHG-05":
        return {
          ...base,
          cards: [
            { title: "Closed Changes %", value: `${ratio(closed, total)}%`, note: "Closure efficiency from selected rows" },
            { title: "Closed Changes", value: closed, note: "Closed or implemented changes" },
            { title: "Open Changes", value: open, note: "Still pending selected changes" },
          ],
          chart: { title: "Closed Change Distribution by Service", data: services },
          extras: [
            {
              title: "Closed Changes by Service per Month",
              note: "Monthly comparison of closure volume across top services.",
              type: "stacked",
              ...monthlyBreakdown(rows.filter((row) => ["Closed", "Resolved", "Implemented", "Completed"].includes(row.state)), "closed", "affected_service", 5),
            },
            {
              title: "Closed Changes by Group",
              note: "Operational ownership behind closure performance.",
              type: "bar",
              data: groups,
            },
          ],
        };
      case "CHG-06":
        return {
          ...base,
          cards: [
            { title: "Open Change Backlog", value: open, note: `${ratio(open, total)}% of selected scope remains open` },
            { title: "Past Due Changes", value: pastDue, note: "Open changes that exceeded planned date" },
            { title: "Top Group", value: groups[0]?.label || "-", note: "Group carrying the largest backlog" },
          ],
          chart: { title: "Open Change Backlog by Group", data: groups },
          extras: [
            {
              title: "Open Change Backlog by Group per Month",
              note: "Monthly comparison of the open backlog by responsible group.",
              type: "stacked",
              ...groupMonthly,
            },
            {
              title: "Open Change Backlog by Type",
              note: "Shows which change types dominate the selected backlog.",
              type: "bar",
              data: types,
            },
          ],
        };
      default:
        return null;
    }
  }, [selectedKpi, pastDue, open, groups, critical, total, services, closed, emergency, openedMonthly]);

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
        <Header
          title={focusedView ? focusedView.title : "CHANGE MANAGEMENT DASHBOARD"}
          subTitle={
            focusedView
              ? `${focusedView.note} ${total} selected changes in scope.`
              : `${total} selected changes - KPI report aligned to the monthly change slides`
          }
        />
        <Button variant="outlined" onClick={() => navigate("/changes")}>
          Back
        </Button>
      </Stack>

      {focusedView ? (
        <>
          <Stack direction={{ xs: "column", lg: "row" }} spacing={2} mb={2}>
            {focusedView.cards.map((card) => (
              <KpiCard key={card.title} title={card.title} value={card.value} note={card.note} />
            ))}
          </Stack>

          {focusedView.line ? (
            <ChartCard title={focusedView.line.title} note={focusedView.note}>
              <ResponsiveLine
                data={[
                  {
                    id: focusedView.line.label,
                    data: focusedView.line.data.map((item) => ({ x: item.month, y: item.value })),
                  },
                ]}
                margin={{ top: 20, right: 20, bottom: 60, left: 50 }}
                xScale={{ type: "point" }}
                yScale={{ type: "linear", min: 0, max: "auto", stacked: false }}
                axisBottom={{ tickRotation: -35 }}
                axisLeft={{ legend: "Count", legendOffset: -40 }}
                pointSize={8}
                pointBorderWidth={2}
                pointBorderColor={{ from: "serieColor" }}
                useMesh
                colors={{ scheme: "category10" }}
                enableArea
                areaOpacity={0.08}
                tooltip={renderLineTooltip}
                theme={{ textColor: theme.palette.text.primary }}
              />
            </ChartCard>
          ) : (
            <ChartCard title={focusedView.chart.title} note={focusedView.note}>
              <ResponsiveBar
                data={focusedView.chart.data.slice(0, 10).map((item) => ({ label: item.label, value: item.value }))}
                keys={["value"]}
                indexBy="label"
                margin={{ top: 20, right: 20, bottom: 90, left: 50 }}
                padding={0.3}
                colors={({ index }) => getChartColor(index)}
                axisBottom={{ tickRotation: -35 }}
                axisLeft={{ legend: "Count", legendOffset: -40 }}
                tooltip={renderBarTooltip}
                theme={{ textColor: theme.palette.text.primary }}
              />
            </ChartCard>
          )}

          {focusedView.extras?.length ? (
            <Stack direction={{ xs: "column", xl: "row" }} spacing={2} mt={2}>
              {focusedView.extras.map((extra) => (
                <ChartCard
                  key={extra.title}
                  title={extra.title}
                  note={extra.note}
                  height={320}
                  legendItems={extra.type === "stacked" ? makeLegendItems(extra.keys) : []}
                >
                  {extra.type === "stacked" ? (
                    <ResponsiveBar
                      data={extra.data}
                      keys={extra.keys}
                      indexBy="month"
                      groupMode="grouped"
                      margin={{ top: 20, right: 20, bottom: 60, left: 50 }}
                      padding={0.28}
                      colors={({ id }) => getChartColor(extra.keys.indexOf(id))}
                      axisBottom={{ tickRotation: -35 }}
                      axisLeft={{ legend: "Count", legendOffset: -40 }}
                      tooltip={renderBarTooltip}
                      theme={{ textColor: theme.palette.text.primary }}
                    />
                  ) : (
                    <ResponsiveBar
                      data={extra.data.slice(0, 10).map((item) => ({ label: item.label, value: item.value }))}
                      keys={["value"]}
                      indexBy="label"
                      margin={{ top: 20, right: 20, bottom: 90, left: 50 }}
                      padding={0.3}
                      colors={({ index }) => getChartColor(index)}
                      axisBottom={{ tickRotation: -35 }}
                      axisLeft={{ legend: "Count", legendOffset: -40 }}
                      tooltip={renderBarTooltip}
                      theme={{ textColor: theme.palette.text.primary }}
                    />
                  )}
                </ChartCard>
              ))}
            </Stack>
          ) : null}

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
        </>
      ) : (
        <>
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
            tooltip={renderLineTooltip}
            theme={{ textColor: theme.palette.text.primary }}
          />
        </ChartCard>

        <ChartCard
          title="Open vs Closed Trend"
          note="Selected scope trend between change creation and closure."
          legendItems={makeLegendItems(["Opened", "Closed"])}
        >
          <ResponsiveBar
            data={openedVsClosed}
            keys={["Opened", "Closed"]}
            indexBy="month"
            groupMode="grouped"
            margin={{ top: 20, right: 20, bottom: 60, left: 50 }}
            padding={0.28}
            colors={({ id }) => getChartColor(["Opened", "Closed"].indexOf(id))}
            axisBottom={{ tickRotation: -35 }}
            axisLeft={{ legend: "Count", legendOffset: -40 }}
            tooltip={renderBarTooltip}
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
            colors={({ index }) => getChartColor(index)}
            axisBottom={{ tickRotation: -35 }}
            axisLeft={{ legend: "Count", legendOffset: -40 }}
            tooltip={renderBarTooltip}
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
            colors={({ index }) => getChartColor(index)}
            axisBottom={{ tickRotation: -35 }}
            axisLeft={{ legend: "Count", legendOffset: -40 }}
            tooltip={renderBarTooltip}
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
          colors={({ index }) => getChartColor(index)}
          axisBottom={{ tickRotation: -35 }}
          axisLeft={{ legend: "Count", legendOffset: -40 }}
          tooltip={renderBarTooltip}
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
        </>
      )}
    </Box>
  );
}
