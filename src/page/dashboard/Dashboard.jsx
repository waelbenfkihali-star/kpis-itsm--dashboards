// hne dashboard principal: yjib data mta3 incidents, requests w changes, y7seb KPIs, w yaffichi cards, charts w summary.
import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Paper,
  Stack,
  Typography,
  useTheme,
} from "@mui/material";

import WarningAmberOutlinedIcon from "@mui/icons-material/WarningAmberOutlined";
import AssignmentTurnedInOutlinedIcon from "@mui/icons-material/AssignmentTurnedInOutlined";
import BuildCircleOutlinedIcon from "@mui/icons-material/BuildCircleOutlined";
import ErrorOutlineOutlinedIcon from "@mui/icons-material/ErrorOutlineOutlined";
import { ResponsiveBar } from "@nivo/bar";
import { ResponsiveLine } from "@nivo/line";
import ExecutiveSummary from "../../components/ExecutiveSummary";
import ExportPdfButton from "../../components/ExportPdfButton";
import Header from "../../components/Header";
import PrintReportHeader from "../../components/PrintReportHeader";
import { apiFetch } from "../../utils/api";
import ChartLegend from "../analysis/ChartLegend";
import { buildDashboardInsights } from "../analysis/reportInsights";
import {
  countBy,
  countWhere,
  getChartColor,
  makeLegendItems,
  monthlyBreakdown,
  monthlySeries,
  renderBarTooltip,
  renderLineTooltip,
} from "../analysis/analysisUtils";

// hne card sghira taffichi KPI wa7ed: icon, title, valeur w note.
function StatCard({ icon, title, subtitle, value, note }) {
  return (
    <Paper sx={{ p: 2.2, flex: 1, minWidth: 220, borderRadius: 3 }}>
      <Stack direction="row" spacing={1.2} alignItems="center" mb={1}>
        {icon}
        <Typography fontWeight={700}>{title}</Typography>
      </Stack>
      <Typography variant="body2" color="text.secondary" mb={1}>
        {subtitle}
      </Typography>
      <Typography variant="h4" fontWeight={800} mb={0.8}>
        {value}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        {note}
      </Typography>
    </Paper>
  );
}

// hne card mta3 chart: taffichi title, note, chart w legend ken mawjoud.
function DashboardChartCard({ title, note, children, legendItems = [], height = 250, className = "" }) {
  return (
    <Paper className={className} sx={{ p: 2, borderRadius: 3 }}>
      <Typography variant="h6" mb={0.5}>
        {title}
      </Typography>
      <Typography variant="body2" color="text.secondary" mb={1.5}>
        {note}
      </Typography>
      <Box sx={{ height }}>{children}</Box>
      <ChartLegend items={legendItems} />
    </Paper>
  );
}

// hne function t5alli ken les derniers mois 7aseb limit.
function takeLastMonths(points, limit = 6) {
  return points.slice(-limit);
}

// hne function t5alli ken breakdown mta3 les derniers mois.
function takeLastBreakdown(breakdown, limit = 6) {
  return {
    keys: breakdown.keys || [],
    data: (breakdown.data || []).slice(-limit),
  };
}

// hne function ta3mel tick values s7a7 lel axis mta3 charts bech l graph yji ndhif.
function buildIntegerTickValues(chart) {
  const values =
    chart.type === "line"
      ? (chart.data || []).map((item) => Number(item.value) || 0)
      : (chart.data || []).flatMap((item) =>
          (chart.keys || []).map((key) => Number(item[key]) || 0)
        );

  const max = Math.max(0, ...values);

  if (max <= 5) {
    return Array.from({ length: max + 1 }, (_, index) => index);
  }

  const steps = 4;
  const step = Math.max(1, Math.ceil(max / steps));
  const ticks = [0];

  for (let current = step; current < max; current += step) {
    ticks.push(current);
  }

  if (ticks[ticks.length - 1] !== max) {
    ticks.push(max);
  }

  return ticks;
}

// hne component dashboard: yjib data, y7adher stats w charts, w yaffichihom.
export default function Dashboard() {
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [incidents, setIncidents] = useState([]);
  const [requests, setRequests] = useState([]);
  const [changes, setChanges] = useState([]);

  useEffect(() => {
    let active = true;

    Promise.all([
      apiFetch("/incidents/").then((res) => res.json()),
      apiFetch("/requests/").then((res) => res.json()),
      apiFetch("/changes/").then((res) => res.json()),
    ])
      .then(([incData, reqData, chgData]) => {
        if (!active) return;
        setIncidents(Array.isArray(incData) ? incData : []);
        setRequests(Array.isArray(reqData) ? reqData : []);
        setChanges(Array.isArray(chgData) ? chgData : []);
      })
      .catch((e) => {
        if (!active) return;
        setError(String(e.message || e));
      })
      .finally(() => {
        if (!active) return;
        setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const incidentBacklog = useMemo(
    () => incidents.filter((row) => ["Open", "In Progress", "Pending"].includes(row.state)),
    [incidents]
  );
  const majorIncidents = useMemo(
    () => incidents.filter((row) => row.is_major || row.priority === "P1"),
    [incidents]
  );
  const openRequests = useMemo(
    () => requests.filter((row) => !["Closed", "Resolved", "Completed"].includes(row.state)),
    [requests]
  );
  const openChanges = useMemo(
    () => changes.filter((row) => !["Closed", "Resolved", "Implemented", "Completed"].includes(row.state)),
    [changes]
  );

  // hne n7adhrou charts lkol mta3 dashboard 7aseb data mta3 incidents, requests w changes.
  const charts = useMemo(() => {
    // hne n5arjou requests elli mazelt open w 3andhom akther men 60 jours.
    const requestsOlderThan60 = requests.filter((row) => {
      if (["Closed", "Resolved", "Completed"].includes(row.state)) return false;
      if (!row.opened) return false;
      const opened = new Date(row.opened);
      if (Number.isNaN(opened.getTime())) return false;
      return Date.now() - opened.getTime() > 60 * 24 * 60 * 60 * 1000;
    });

    // hne n5arjou changes elli fet planned end date mte3hom w mazalou open.
    const pastDueChanges = changes.filter((row) => {
      if (["Closed", "Resolved", "Implemented", "Completed"].includes(row.state)) return false;
      if (!row.planned_end_date) return false;
      const planned = new Date(row.planned_end_date);
      if (Number.isNaN(planned.getTime())) return false;
      return planned.getTime() < Date.now();
    });

    return [
      {
        title: "INC-01 Major Incidents",
        note: "Past 6 months major incident volume.",
        type: "line",
        lineLabel: "Major Incidents",
        data: takeLastMonths(monthlySeries(majorIncidents, "opened")),
      },
      {
        title: "INC-06 Incident Volume",
        note: "Past 6 months created incidents.",
        type: "line",
        lineLabel: "Created Incidents",
        data: takeLastMonths(monthlySeries(incidents, "opened")),
      },
      {
        title: "INC-07 Backlog by Service",
        note: "Top services contributing to backlog over the past 6 months.",
        type: "stacked",
        ...takeLastBreakdown(monthlyBreakdown(incidentBacklog, "opened", "affected_service", 4)),
      },
      {
        title: "INC-09 SLA Breached Incidents",
        note: "Past 6 months SLA breach volume.",
        type: "line",
        lineLabel: "SLA Breached",
        data: takeLastMonths(monthlySeries(incidents.filter((row) => row.sla_breached), "opened")),
      },
      {
        title: "REQ-01 Open Requests",
        note: "Past 6 months request backlog.",
        type: "line",
        lineLabel: "Open Requests",
        data: takeLastMonths(monthlySeries(openRequests, "opened")),
      },
      {
        title: "REQ-02 Closed Requests",
        note: "Past 6 months closed requests.",
        type: "line",
        lineLabel: "Closed Requests",
        data: takeLastMonths(monthlySeries(requests.filter((row) => row.closed), "closed")),
      },
      {
        title: "REQ-04 Requests Older Than 60 Days",
        note: "Open aging demand over the past 6 months.",
        type: "stacked",
        ...takeLastBreakdown(monthlyBreakdown(requestsOlderThan60, "opened", "responsible_group", 4)),
      },
      {
        title: "CHG-01 Past Due Changes",
        note: "Past due changes tracked over the past 6 months.",
        type: "line",
        lineLabel: "Past Due Changes",
        data: takeLastMonths(monthlySeries(pastDueChanges, "planned_end_date")),
      },
      {
        title: "CHG-04 Emergency Changes",
        note: "Emergency change trend over the past 6 months.",
        type: "line",
        lineLabel: "Emergency Changes",
        data: takeLastMonths(
          monthlySeries(
            changes.filter((row) => String(row.type || "").toLowerCase().includes("emergency")),
            "opened"
          )
        ),
      },
      {
        title: "CHG-06 Open Changes by Group",
        note: "Top responsible groups carrying open changes in the past 6 months.",
        type: "stacked",
        ...takeLastBreakdown(monthlyBreakdown(openChanges, "opened", "responsible_group", 4)),
      },
    ];
  }, [incidents, requests, changes, majorIncidents, incidentBacklog, openRequests, openChanges]);

  const topService = useMemo(
    () => countBy(incidentBacklog, "affected_service")[0]?.label || "-",
    [incidentBacklog]
  );
  const topRequestGroup = useMemo(
    () => countBy(openRequests, "responsible_group")[0]?.label || "-",
    [openRequests]
  );
  const topChangeGroup = useMemo(
    () => countBy(openChanges, "responsible_group")[0]?.label || "-",
    [openChanges]
  );
  const summarySections = useMemo(
    () =>
      buildDashboardInsights({
        incidents,
        requests,
        changes,
        majorIncidents,
        incidentBacklog,
        openRequests,
        openChanges,
      }),
    [incidents, requests, changes, majorIncidents, incidentBacklog, openRequests, openChanges]
  );

  return (
    <Box className="print-dashboard-root">
      <Stack
        direction={{ xs: "column", md: "row" }}
        justifyContent="space-between"
        alignItems={{ xs: "flex-start", md: "center" }}
        spacing={2}
        sx={{ mb: 2 }}
      >
        <Header
          isDashboard
          title="KPI DASHBOARD"
          subTitle="Top KPI views built directly from your incidents, requests, and changes data"
        />
        <ExportPdfButton fileName="kpi-dashboard" />
      </Stack>

      <PrintReportHeader
        reportTitle="ITSM KPI Dashboard"
        reportSubtitle="Executive overview of incidents, requests, and changes with the most important KPI trends."
        scopeLabel={`${incidents.length} incidents, ${requests.length} requests, ${changes.length} changes included`}
      />
      <ExecutiveSummary sections={summarySections} />

      {error ? <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert> : null}
      {loading ? <Alert severity="info" sx={{ mb: 2 }}>Loading dashboard data...</Alert> : null}

      <Stack direction={{ xs: "column", lg: "row" }} flexWrap="wrap" gap={1.5} sx={{ mb: 2 }}>
        <StatCard
          icon={<WarningAmberOutlinedIcon color="warning" />}
          title="Major Incidents"
          subtitle="Current KPI snapshot"
          value={majorIncidents.length}
          note={`Top impacted service: ${topService}`}
        />
        <StatCard
          icon={<ErrorOutlineOutlinedIcon color="error" />}
          title="Incident Backlog"
          subtitle="Open incidents"
          value={incidentBacklog.length}
          note={`${countWhere(incidentBacklog, (row) => row.sla_breached)} incidents breached SLA`}
        />
        <StatCard
          icon={<AssignmentTurnedInOutlinedIcon color="primary" />}
          title="Open Requests"
          subtitle="Pending request backlog"
          value={openRequests.length}
          note={`Top responsible group: ${topRequestGroup}`}
        />
        <StatCard
          icon={<BuildCircleOutlinedIcon color="success" />}
          title="Open Changes"
          subtitle="Change backlog in progress"
          value={openChanges.length}
          note={`Top responsible group: ${topChangeGroup}`}
        />
      </Stack>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            md: "repeat(2, minmax(0, 1fr))",
            xl: "repeat(3, minmax(0, 1fr))",
          },
          gap: 1.5,
        }}
      >
        {charts.map((chart) => (
          // hne kol chart men array yet3ared fi card wa7dou b KPI mte3ou.
          <DashboardChartCard
            key={chart.title}
            title={chart.title}
            note={chart.note}
            legendItems={chart.type === "stacked" ? makeLegendItems(chart.keys) : []}
            className="print-chart-card"
          >
            {chart.type === "line" ? (
              <ResponsiveLine
                data={[
                  {
                    id: chart.lineLabel,
                    data: chart.data.map((item) => ({ x: item.month, y: item.value })),
                  },
                ]}
                margin={{ top: 20, right: 20, bottom: 60, left: 50 }}
                xScale={{ type: "point" }}
                yScale={{ type: "linear", min: 0, max: "auto", stacked: false }}
                axisBottom={{ tickRotation: -35 }}
                axisLeft={{
                  legend: "Count",
                  legendOffset: -40,
                  tickValues: buildIntegerTickValues(chart),
                  format: (value) => `${value}`,
                }}
                yFormat={(value) => `${Math.round(Number(value) || 0)}`}
                pointSize={8}
                pointBorderWidth={2}
                pointBorderColor={{ from: "serieColor" }}
                useMesh
                colors={[getChartColor(0)]}
                enableArea
                areaOpacity={0.08}
                tooltip={renderLineTooltip}
                theme={{ textColor: theme.palette.text.primary }}
              />
            ) : (
              <ResponsiveBar
                data={chart.data}
                keys={chart.keys}
                indexBy="month"
                groupMode="grouped"
                margin={{ top: 20, right: 20, bottom: 60, left: 50 }}
                padding={0.28}
                colors={({ id }) => getChartColor(chart.keys.indexOf(id))}
                axisBottom={{ tickRotation: -35 }}
                axisLeft={{
                  legend: "Count",
                  legendOffset: -40,
                  tickValues: buildIntegerTickValues(chart),
                  format: (value) => `${value}`,
                }}
                valueFormat={(value) => `${Math.round(Number(value) || 0)}`}
                tooltip={renderBarTooltip}
                theme={{ textColor: theme.palette.text.primary }}
              />
            )}
          </DashboardChartCard>
        ))}
      </Box>
    </Box>
  );
}