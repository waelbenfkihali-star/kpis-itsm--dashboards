import React, { useMemo } from "react";
import { Box, Button, Chip, Paper, Stack, Typography, useTheme } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { ResponsiveBar } from "@nivo/bar";
import { ResponsiveLine } from "@nivo/line";
import ExecutiveSummary from "../../components/ExecutiveSummary";
import ExportPdfButton from "../../components/ExportPdfButton";
import { useLocation, useNavigate } from "react-router-dom";
import Header from "../../components/Header";
import PrintReportHeader from "../../components/PrintReportHeader";
import ChartLegend from "../analysis/ChartLegend";
import {
  average,
  countBy,
  countWhere,
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
import { buildIncidentInsights } from "../analysis/reportInsights";

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

function hasKeyword(text, keywords) {
  return keywords.some((keyword) => text.includes(keyword));
}

export default function IncidentsAnalysis() {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const rows = Array.isArray(location.state?.data) ? location.state.data : [];
  const selectedKpi = location.state?.selectedKpi || null;

  const openBacklogRows = useMemo(
    () => rows.filter((row) => ["Open", "In Progress", "Pending"].includes(row.state)),
    [rows]
  );
  const majorRows = useMemo(() => rows.filter((row) => row.is_major), [rows]);
  const closedRows = useMemo(
    () => rows.filter((row) => ["Closed", "Resolved"].includes(row.state)),
    [rows]
  );

  const backlogMonthly = useMemo(() => monthlySeries(openBacklogRows, "opened"), [openBacklogRows]);
  const openVsClosedMonthly = useMemo(
    () => monthlyDualSeries(rows, "opened", "resolved", "Opened", "Resolved"),
    [rows]
  );

  const services = useMemo(() => countBy(rows, "affected_service"), [rows]);
  const sites = useMemo(() => countBy(rows, "location"), [rows]);
  const groups = useMemo(() => countBy(rows, "responsible_group"), [rows]);

  const columns = [
    { field: "number", headerName: "Incident ID", flex: 1, minWidth: 140 },
    { field: "state", headerName: "Status", flex: 1, minWidth: 130 },
    { field: "priority", headerName: "Priority", flex: 0.8, minWidth: 100 },
    { field: "affected_service", headerName: "Service", flex: 1.2, minWidth: 180 },
    { field: "responsible_group", headerName: "Group", flex: 1.2, minWidth: 180 },
    { field: "location", headerName: "Site", flex: 1.1, minWidth: 170 },
    { field: "opened", headerName: "Opened", flex: 1, minWidth: 150 },
  ];

  if (!rows.length) {
    return (
      <Box className="print-dashboard-root">
        <Header title="INCIDENTS DASHBOARD" subTitle="No incidents selected" />
        <Paper sx={{ p: 2.5 }}>
          <Typography mb={2}>
            Select one or more incidents from the incidents table, then click Analyse again.
          </Typography>
          <Button variant="outlined" onClick={() => navigate("/incidents")}>
            Back to incidents
          </Button>
        </Paper>
      </Box>
    );
  }

  const total = rows.length;
  const backlog = openBacklogRows.length;
  const major = majorRows.length;
  const resolved = closedRows.length;
  const unassignedBacklog = countWhere(
    openBacklogRows,
    (row) => !String(row.responsible_user || "").trim()
  );
  const slaBreached = countWhere(rows, (row) => row.sla_breached);
  const avgHandle = average(rows, "duration");
  const avgBusiness = average(rows, "business_duration");
  const avgMajorResolution = average(rows, "duration", (row) => row.is_major);
  const focusedServices = useMemo(() => countBy(majorRows, "affected_service"), [majorRows]);
  const serviceMonthly = useMemo(() => monthlyBreakdown(rows, "opened", "affected_service", 5), [rows]);
  const groupMonthly = useMemo(() => monthlyBreakdown(rows, "opened", "responsible_group", 5), [rows]);
  const siteMonthly = useMemo(() => monthlyBreakdown(rows, "opened", "location", 5), [rows]);

  const focusedView = useMemo(() => {
    if (!selectedKpi) return null;

    const kpiId = selectedKpi.kpi_id;
    const base = {
      title: `${selectedKpi.kpi_id} - ${selectedKpi.name}`,
      note: selectedKpi.description || "Focused KPI dashboard built from your selected incident rows.",
    };

    switch (kpiId) {
      case "INC-01":
        return {
          ...base,
          cards: [
            { title: "Major Incidents", value: major, note: `${ratio(major, total)}% of selected incidents are major` },
            { title: "Total Selection", value: total, note: "Incident scope used for KPI analysis" },
            { title: "Top Service", value: focusedServices[0]?.label || "-", note: "Most impacted service among major incidents" },
          ],
          chart: { title: "Major Incidents by IT Service", data: focusedServices },
          extras: [
            {
              title: "Major Incidents by Service per Month",
              note: "Compares top impacted services month by month inside the selected scope.",
              type: "stacked",
              ...monthlyBreakdown(majorRows, "opened", "affected_service", 5),
            },
            {
              title: "Major Incident Sites",
              note: "Additional view by impacted sites.",
              type: "bar",
              data: sites,
            },
          ],
        };
      case "INC-03":
        return {
          ...base,
          cards: [
            { title: "Open Incident Backlog", value: backlog, note: `${ratio(backlog, total)}% of selected incidents are open` },
            { title: "Unassigned Backlog", value: unassignedBacklog, note: "Backlog without responsible user" },
            { title: "Top Service", value: services[0]?.label || "-", note: "Service carrying the largest backlog" },
          ],
          chart: { title: "Current Backlog by IT Service", data: services },
          extras: [
            {
              title: "Backlog by Service per Month",
              note: "Shows how top services contribute to backlog over time.",
              type: "stacked",
              ...monthlyBreakdown(openBacklogRows, "opened", "affected_service", 5),
            },
            {
              title: "Backlog by Responsible Group",
              note: "Operational ownership view for the selected backlog scope.",
              type: "bar",
              data: groups,
            },
          ],
        };
      case "INC-06":
        return {
          ...base,
          cards: [
            { title: "Incidents Created", value: total, note: "Selected incident volume used as control KPI" },
            { title: "Resolved or Closed", value: resolved, note: `${ratio(resolved, total)}% already resolved` },
            { title: "SLA Breached", value: slaBreached, note: "Selected incidents breaching SLA" },
          ],
          line: { title: "Incidents Created Trend", data: monthlySeries(rows, "opened"), label: "Created Incidents" },
          extras: [
            {
              title: "Incident Volume by Service per Month",
              note: "Compares the top services contributing to incident creation month by month.",
              type: "stacked",
              ...serviceMonthly,
            },
            {
              title: "Incident Volume by Group per Month",
              note: "Shows which groups received the biggest monthly incident volume.",
              type: "stacked",
              ...groupMonthly,
            },
          ],
        };
      case "INC-07":
      case "INC-08":
        return {
          ...base,
          cards: [
            { title: "Top Service", value: services[0]?.label || "-", note: "Service most impacted in the selected scope" },
            { title: "Incidents in Scope", value: total, note: "Rows selected for this KPI" },
            { title: "Major Incidents", value: major, note: "Major count within selected scope" },
          ],
          chart: { title: "Service Breakdown", data: services },
          extras: [
            {
              title: "Service Comparison per Month",
              note: "Monthly comparison between the top impacted services.",
              type: "stacked",
              ...serviceMonthly,
            },
            {
              title: "Site Comparison per Month",
              note: "Shows which sites are repeatedly impacted across months.",
              type: "stacked",
              ...siteMonthly,
            },
          ],
        };
      case "INC-09":
      case "INC-15":
        return {
          ...base,
          cards: [
            { title: "SLA Breached Incidents", value: slaBreached, note: `${ratio(slaBreached, total)}% of scope breached SLA` },
            { title: "Compliance Rate", value: `${100 - ratio(slaBreached, total)}%`, note: "Calculated from selected rows" },
            { title: "Open Backlog", value: backlog, note: "Open incidents still under monitoring" },
          ],
          chart: { title: "Breached Incidents by Group", data: groups },
          extras: [
            {
              title: "Breached Incidents by Group per Month",
              note: "Monthly comparison of groups most exposed to SLA breaches.",
              type: "stacked",
              ...monthlyBreakdown(rows.filter((row) => row.sla_breached), "opened", "responsible_group", 5),
            },
            {
              title: "Breached Incidents by Service",
              note: "Shows where the SLA issue is concentrated by service.",
              type: "bar",
              data: countBy(rows.filter((row) => row.sla_breached), "affected_service"),
            },
          ],
        };
      case "INC-12":
      case "INC-13":
        return {
          ...base,
          cards: [
            { title: "Compliance Rate", value: `${100 - ratio(slaBreached, total)}%`, note: "KPI compliance from selected scope" },
            { title: "Breached Incidents", value: slaBreached, note: "Incidents outside SLA target" },
            { title: "Resolved", value: resolved, note: "Resolved incidents in selected scope" },
          ],
          chart: { title: "SLA Impact by Responsible Group", data: groups },
          extras: [
            {
              title: "Compliance Pressure by Group per Month",
              note: "Month over month SLA pressure on the top responsible groups.",
              type: "stacked",
              ...groupMonthly,
            },
            {
              title: "Compliance Pressure by Service",
              note: "Additional business-facing view by impacted services.",
              type: "bar",
              data: services,
            },
          ],
        };
      default:
        {
          const descriptor = [
            selectedKpi.name,
            selectedKpi.dimension,
            selectedKpi.formula,
            selectedKpi.description,
          ]
            .join(" ")
            .toLowerCase();

          if (hasKeyword(descriptor, ["sla", "breach", "compliance", "response", "resolution"])) {
            return {
              ...base,
              cards: [
                { title: "Compliance Rate", value: `${100 - ratio(slaBreached, total)}%`, note: "Estimated from selected incident scope" },
                { title: "SLA Breached", value: slaBreached, note: "Incidents outside the SLA target" },
                { title: "Resolved", value: resolved, note: "Resolved or closed incidents in selected scope" },
              ],
              chart: { title: "SLA Impact by Group", data: groups },
              extras: [
                {
                  title: "SLA Pressure by Group per Month",
                  note: "Monthly comparison of the groups exposed to SLA pressure.",
                  type: "stacked",
                  ...monthlyBreakdown(rows.filter((row) => row.sla_breached), "opened", "responsible_group", 5),
                },
                {
                  title: "SLA Pressure by Service",
                  note: "Shows which services are most represented in the breached scope.",
                  type: "bar",
                  data: countBy(rows.filter((row) => row.sla_breached), "affected_service"),
                },
              ],
            };
          }

          if (hasKeyword(descriptor, ["major"])) {
            return {
              ...base,
              cards: [
                { title: "Major Incidents", value: major, note: `${ratio(major, total)}% of selected incidents are major` },
                { title: "Incidents in Scope", value: total, note: "Rows selected for this KPI" },
                { title: "Top Impacted Service", value: focusedServices[0]?.label || "-", note: "Service most exposed to major incidents" },
              ],
              chart: { title: "Major Incidents by Service", data: focusedServices },
              extras: [
                {
                  title: "Major Incident Services per Month",
                  note: "Monthly comparison of services impacted by major incidents.",
                  type: "stacked",
                  ...monthlyBreakdown(majorRows, "opened", "affected_service", 5),
                },
                {
                  title: "Major Incident Sites",
                  note: "Additional location view for the same KPI scope.",
                  type: "bar",
                  data: countBy(majorRows, "location"),
                },
              ],
            };
          }

          if (hasKeyword(descriptor, ["backlog", "open", "pending"])) {
            return {
              ...base,
              cards: [
                { title: "Open Backlog", value: backlog, note: `${ratio(backlog, total)}% of the selected incidents are still open` },
                { title: "Unassigned Backlog", value: unassignedBacklog, note: "Open incidents without responsible user" },
                { title: "Top Service", value: services[0]?.label || "-", note: "Service carrying the biggest backlog" },
              ],
              chart: { title: "Open Backlog by Service", data: services },
              extras: [
                {
                  title: "Backlog by Service per Month",
                  note: "Monthly view of services contributing to the selected backlog.",
                  type: "stacked",
                  ...monthlyBreakdown(openBacklogRows, "opened", "affected_service", 5),
                },
                {
                  title: "Backlog by Group",
                  note: "Operational ownership distribution inside the selected backlog.",
                  type: "bar",
                  data: countBy(openBacklogRows, "responsible_group"),
                },
              ],
            };
          }

          if (hasKeyword(descriptor, ["time", "duration", "hour"])) {
            return {
              ...base,
              cards: [
                { title: "Avg Handle Time", value: avgHandle || "-", note: "Average duration across the selected incidents" },
                { title: "Avg Business Duration", value: avgBusiness || "-", note: "Business duration across the selected scope" },
                { title: "Resolved Incidents", value: resolved, note: "Resolved or closed incidents in scope" },
              ],
              chart: { title: "Incident Workload by Group", data: groups },
              extras: [
                {
                  title: "Incident Volume by Group per Month",
                  note: "Monthly view of the groups involved in this KPI scope.",
                  type: "stacked",
                  ...groupMonthly,
                },
                {
                  title: "Incident Volume by Service",
                  note: "Service-based perspective for the same selected incidents.",
                  type: "bar",
                  data: services,
                },
              ],
            };
          }

        return {
          ...base,
          cards: [
            { title: "Selected Incidents", value: total, note: "Scope selected from incidents table" },
            { title: "Open Backlog", value: backlog, note: "Open or in-progress incidents" },
            { title: "Major Incidents", value: major, note: "Major incidents within the scope" },
          ],
          chart: { title: "Incident Breakdown by Service", data: services },
          extras: [
            {
              title: "Incident Service Comparison per Month",
              note: "Monthly comparison across the top services.",
              type: "stacked",
              ...serviceMonthly,
            },
          ],
        };
        }
    }
  }, [
    selectedKpi,
    major,
    total,
    focusedServices,
    backlog,
    unassignedBacklog,
    services,
    resolved,
    slaBreached,
    groups,
    rows,
    avgHandle,
    avgBusiness,
    openBacklogRows,
    majorRows,
    groupMonthly,
  ]);
  const summarySections = useMemo(
    () =>
      buildIncidentInsights({
        rows,
        backlog,
        major,
        slaBreached,
        unassignedBacklog,
        services,
        groups,
      }),
    [rows, backlog, major, slaBreached, unassignedBacklog, services, groups]
  );

  return (
    <Box className="print-dashboard-root">
      <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" alignItems={{ xs: "flex-start", md: "center" }} mb={2} spacing={2}>
        <Header
          title={focusedView ? focusedView.title : "INCIDENT MANAGEMENT KPI DASHBOARD"}
          subTitle={
            focusedView
              ? `${focusedView.note} ${total} selected incidents in scope.`
              : `${total} selected incidents - KPI view aligned to the monthly report style`
          }
        />
        <Stack direction="row" spacing={1} className="print-export-hidden">
          <Button variant="outlined" onClick={() => navigate("/incidents")}>
            Back
          </Button>
          <ExportPdfButton fileName={(focusedView?.title || "incidents-dashboard").replaceAll(" ", "-").toLowerCase()} />
        </Stack>
      </Stack>
      <PrintReportHeader
        reportTitle={focusedView ? focusedView.title : "Incident Management KPI Dashboard"}
        reportSubtitle={
          focusedView
            ? focusedView.note
            : "Incident KPI analysis generated from the selected records."
        }
        scopeLabel={`${rows.length} incidents selected for analysis`}
      />
      <ExecutiveSummary sections={summarySections} />

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
                colors={{ scheme: "set2" }}
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
              Selected Incident Scope
            </Typography>
            <Box sx={{ height: 520 }}>
              <DataGrid
                rows={rows}
                columns={columns}
                disableRowSelectionOnClick
                getRowId={(row) => row.id}
                onRowClick={(params) => navigate(`/incidents/${params.row.number}`)}
                pageSizeOptions={[10, 25, 50]}
              />
            </Box>
          </Paper>
        </>
      ) : (
        <>
      <Stack direction={{ xs: "column", lg: "row" }} spacing={2} mb={2}>
        <KpiCard
          title="Incident Backlog"
          value={backlog}
          note={`${ratio(backlog, total)}% of selected rows are still open or in progress`}
        />
        <KpiCard
          title="Major Incidents"
          value={major}
          note={`${ratio(major, total)}% of the selection is flagged as major`}
        />
        <KpiCard
          title="Control KPI"
          value={total}
          note={`Top service: ${topLabel(rows, "affected_service")}`}
        />
        <KpiCard
          title="Unassigned Backlog"
          value={unassignedBacklog}
          note={`${ratio(unassignedBacklog, backlog || 1)}% of backlog has no responsible user`}
        />
      </Stack>

      <Stack direction={{ xs: "column", xl: "row" }} spacing={2} mb={2}>
        <ChartCard
          title="Incident Management KPI Results - Past 6 Months"
          note="Selected incidents opened by month, similar to the report's control trend."
        >
          <ResponsiveLine
            data={[
              {
                id: "Backlog Volume",
                data: backlogMonthly.map((item) => ({ x: item.month, y: item.value })),
              },
            ]}
            margin={{ top: 20, right: 20, bottom: 60, left: 50 }}
            xScale={{ type: "point" }}
            yScale={{ type: "linear", min: 0, max: "auto", stacked: false }}
            axisBottom={{ tickRotation: -35, legend: "Month", legendOffset: 48 }}
            axisLeft={{ legend: "Incidents", legendOffset: -40 }}
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
          title="Open vs Resolved Trend"
          note="Shows the selected scope trend between opened and resolved incidents."
          legendItems={makeLegendItems(["Opened", "Resolved"])}
        >
          <ResponsiveBar
            data={openVsClosedMonthly}
            keys={["Opened", "Resolved"]}
            indexBy="month"
            groupMode="grouped"
            margin={{ top: 20, right: 20, bottom: 60, left: 50 }}
            padding={0.28}
            colors={({ id }) => getChartColor(["Opened", "Resolved"].indexOf(id))}
            axisBottom={{ tickRotation: -35 }}
            axisLeft={{ legend: "Count", legendOffset: -40 }}
            tooltip={renderBarTooltip}
            theme={{ textColor: theme.palette.text.primary }}
          />
        </ChartCard>
      </Stack>

      <Stack direction={{ xs: "column", lg: "row" }} spacing={2} mb={2}>
        <KpiCard
          title="Avg. Time To Handle"
          value={avgHandle || "-"}
          note="Average duration from the selected incidents"
        />
        <KpiCard
          title="Avg. Business Duration"
          value={avgBusiness || "-"}
          note="Business duration average across selected incidents"
        />
        <KpiCard
          title="Major Resolution Duration"
          value={avgMajorResolution || "-"}
          note="Average duration only for selected major incidents"
        />
        <KpiCard
          title="SLA Resolution Compliance"
          value={`${100 - ratio(slaBreached, total)}%`}
          note={`${slaBreached} incidents in the selection breached the SLA`}
        />
      </Stack>

      <Paper sx={{ p: 2, mb: 2 }}>
        <Typography variant="h6" mb={1}>
          KPI Highlights
        </Typography>
        <Stack direction="row" flexWrap="wrap" gap={1}>
          <Chip label={`Top impacted service: ${services[0]?.label || "Unknown"}`} color="primary" variant="outlined" />
          <Chip label={`Top site: ${sites[0]?.label || "Unknown"}`} color="primary" variant="outlined" />
          <Chip label={`Top responsible group: ${groups[0]?.label || "Unknown"}`} color="primary" variant="outlined" />
          <Chip label={`${resolved} incidents already resolved or closed`} color="secondary" variant="outlined" />
        </Stack>
      </Paper>

      <Stack direction={{ xs: "column", xl: "row" }} spacing={2} mb={2}>
        <ChartCard
          title="Top 10 Impacted Services"
          note="Deep dive by affected services from the selected incidents."
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
          title="Top 10 Sites"
          note="Deep dive by site / location based on the selected incidents."
        >
          <ResponsiveBar
            data={sites.slice(0, 10).map((item) => ({ label: item.label, value: item.value }))}
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
        title="Top 10 Responsible Groups"
        note="Deep dive by the groups carrying most of the selected incidents."
        height={340}
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

      <Paper sx={{ p: 2, mt: 2 }}>
        <Typography variant="h6" mb={1.5}>
          Selected Incident Scope
        </Typography>
        <Box sx={{ height: 520 }}>
          <DataGrid
            rows={rows}
            columns={columns}
            disableRowSelectionOnClick
            getRowId={(row) => row.id}
            onRowClick={(params) => navigate(`/incidents/${params.row.number}`)}
            pageSizeOptions={[10, 25, 50]}
          />
        </Box>
      </Paper>
        </>
      )}
    </Box>
  );
}
