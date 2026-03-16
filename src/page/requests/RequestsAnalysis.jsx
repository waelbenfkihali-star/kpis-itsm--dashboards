import React, { useMemo } from "react";
import { Box, Button, Chip, Paper, Stack, Typography, useTheme } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { ResponsiveBar } from "@nivo/bar";
import { ResponsiveLine } from "@nivo/line";
import { ResponsivePie } from "@nivo/pie";
import ExportPdfButton from "../../components/ExportPdfButton";
import { useLocation, useNavigate } from "react-router-dom";
import Header from "../../components/Header";
import ChartLegend from "../analysis/ChartLegend";
import {
  agingByState,
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
  renderPieTooltip,
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

function hasKeyword(text, keywords) {
  return keywords.some((keyword) => text.includes(keyword));
}

export default function RequestsAnalysis() {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const rows = Array.isArray(location.state?.data) ? location.state.data : [];
  const selectedKpi = location.state?.selectedKpi || null;

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
  const serviceMonthly = useMemo(() => monthlyBreakdown(rows, "opened", "it_service", 5), [rows]);
  const groupMonthly = useMemo(() => monthlyBreakdown(rows, "opened", "responsible_group", 5), [rows]);
  const itemMonthly = useMemo(() => monthlyBreakdown(rows, "opened", "item", 5), [rows]);

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
      <Box className="print-dashboard-root">
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
  const focusedView = useMemo(() => {
    if (!selectedKpi) return null;

    const base = {
      title: `${selectedKpi.kpi_id} - ${selectedKpi.name}`,
      note: selectedKpi.description || "Focused KPI dashboard built from your selected request rows.",
    };

    switch (selectedKpi.kpi_id) {
      case "REQ-01":
        return {
          ...base,
          cards: [
            { title: "Open Request Backlog", value: backlog, note: `${ratio(backlog, total)}% of scope is still open` },
            { title: "> 60 Days Backlog", value: olderThan60, note: "Old requests requiring attention" },
            { title: "Top Group", value: groups[0]?.label || "-", note: "Group carrying the biggest backlog" },
          ],
          chart: { title: "Backlog Aging by State", type: "stacked", data: agingStateData },
          extras: [
            {
              title: "Backlog by Group per Month",
              note: "Monthly comparison of top groups inside the request backlog.",
              type: "stacked",
              ...monthlyBreakdown(openRows, "opened", "responsible_group", 5),
            },
            {
              title: "Backlog by Service",
              note: "Business service view of the selected backlog scope.",
              type: "bar",
              data: services,
            },
          ],
        };
      case "REQ-02":
        return {
          ...base,
          cards: [
            { title: "Closed Requests", value: closed, note: `${ratio(closed, total)}% of selected requests are closed` },
            { title: "Top Service", value: services[0]?.label || "-", note: "Service with highest closure volume" },
            { title: "Top Request Item", value: items[0]?.label || "-", note: "Most requested item in selected scope" },
          ],
          chart: { title: "Closed Request Contributors", type: "bar", data: services },
          extras: [
            {
              title: "Closed Requests by Service per Month",
              note: "Monthly closure comparison for the top services.",
              type: "stacked",
              ...monthlyBreakdown(closedRows, "closed", "it_service", 5),
            },
            {
              title: "Closed Requests by Item",
              note: "Which request items contributed most to closure volume.",
              type: "bar",
              data: items,
            },
          ],
        };
      case "REQ-03":
        return {
          ...base,
          cards: [
            { title: "Requests Created", value: total, note: "Selected request volume used as control KPI" },
            { title: "Closed Requests", value: closed, note: "Requests already completed or closed" },
            { title: "Backlog", value: backlog, note: "Requests still pending" },
          ],
          line: { title: "Requests Created Trend", data: openedMonthly, label: "Created Requests" },
          extras: [
            {
              title: "Request Volume by Service per Month",
              note: "Monthly service comparison for created requests.",
              type: "stacked",
              ...serviceMonthly,
            },
            {
              title: "Request Volume by Group per Month",
              note: "Shows which groups received the highest monthly request load.",
              type: "stacked",
              ...groupMonthly,
            },
          ],
        };
      case "REQ-04":
        return {
          ...base,
          cards: [
            { title: "> 60 Days Backlog", value: olderThan60, note: "Aging backlog over 60 days" },
            { title: "Open Requests", value: backlog, note: "Current open scope" },
            { title: "Top Group", value: groups[0]?.label || "-", note: "Group most impacted by old requests" },
          ],
          chart: { title: "Aging by Responsible Group", type: "bar", data: groups },
          extras: [
            {
              title: "Old Backlog by Group per Month",
              note: "Month over month view of the groups driving older backlog.",
              type: "stacked",
              ...monthlyBreakdown(openRows.filter((row) => row.opened && row.state), "opened", "responsible_group", 5),
            },
            {
              title: "Old Backlog by Item",
              note: "Shows which request items stay open the longest.",
              type: "bar",
              data: items,
            },
          ],
        };
      case "REQ-05":
        return {
          ...base,
          cards: [
            { title: "Closure Rate", value: `${ratio(closed, total)}%`, note: "Calculated from selected requests" },
            { title: "Closed Requests", value: closed, note: "Closed or completed rows in scope" },
            { title: "Open Requests", value: backlog, note: "Remaining backlog rows" },
          ],
          chart: { title: "Closure Contributors by Service", type: "bar", data: services },
          extras: [
            {
              title: "Closure Rate Support View by Service per Month",
              note: "Monthly closure comparison for top business services.",
              type: "stacked",
              ...monthlyBreakdown(closedRows, "closed", "it_service", 5),
            },
            {
              title: "Closure Contributors by Group",
              note: "Operational ownership perspective behind closure performance.",
              type: "bar",
              data: groups,
            },
          ],
        };
      case "REQ-06":
        return {
          ...base,
          cards: [
            { title: "Top Business Service", value: services[0]?.label || "-", note: "Largest request demand in selected scope" },
            { title: "Requests in Scope", value: total, note: "Rows selected for KPI analysis" },
            { title: "Top Requested For", value: requestedFor[0]?.label || "-", note: "Most represented requester" },
          ],
          chart: { title: "Requests by Business Service", type: "bar", data: services },
          extras: [
            {
              title: "Business Service Demand per Month",
              note: "Monthly comparison between top services from the selected scope.",
              type: "stacked",
              ...serviceMonthly,
            },
            {
              title: "Request Item Demand per Month",
              note: "Additional explanation by top request items.",
              type: "stacked",
              ...itemMonthly,
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

          if (hasKeyword(descriptor, ["aging", "60 days", "backlog", "open"])) {
            return {
              ...base,
              cards: [
                { title: "Open Backlog", value: backlog, note: `${ratio(backlog, total)}% of scope remains open` },
                { title: "> 60 Days Backlog", value: olderThan60, note: "Older requests still pending" },
                { title: "Top Group", value: groups[0]?.label || "-", note: "Group most represented in backlog" },
              ],
              chart: { title: "Backlog Aging by State", type: "stacked", data: agingStateData },
              extras: [
                {
                  title: "Backlog by Group per Month",
                  note: "Monthly comparison of top groups inside the selected backlog.",
                  type: "stacked",
                  ...monthlyBreakdown(openRows, "opened", "responsible_group", 5),
                },
                {
                  title: "Backlog by Service",
                  note: "Service view of the same selected request backlog.",
                  type: "bar",
                  data: services,
                },
              ],
            };
          }

          if (hasKeyword(descriptor, ["close", "closure", "completed"])) {
            return {
              ...base,
              cards: [
                { title: "Closed Requests", value: closed, note: `${ratio(closed, total)}% of scope is closed` },
                { title: "Closure Rate", value: `${ratio(closed, total)}%`, note: "Calculated from selected rows" },
                { title: "Top Service", value: services[0]?.label || "-", note: "Service with the highest closure volume" },
              ],
              chart: { title: "Closed Requests by Service", type: "bar", data: services },
              extras: [
                {
                  title: "Closed Requests by Service per Month",
                  note: "Monthly closure comparison across the top services.",
                  type: "stacked",
                  ...monthlyBreakdown(closedRows, "closed", "it_service", 5),
                },
                {
                  title: "Closed Requests by Group",
                  note: "Operational ownership view for the closure scope.",
                  type: "bar",
                  data: groups,
                },
              ],
            };
          }

          if (hasKeyword(descriptor, ["service", "business service", "grouped"])) {
            return {
              ...base,
              cards: [
                { title: "Requests in Scope", value: total, note: "Rows selected for KPI analysis" },
                { title: "Top Service", value: services[0]?.label || "-", note: "Most represented service in scope" },
                { title: "Top Request Item", value: items[0]?.label || "-", note: "Most represented item in scope" },
              ],
              chart: { title: "Requests by Service", type: "bar", data: services },
              extras: [
                {
                  title: "Requests by Service per Month",
                  note: "Monthly comparison between the top services.",
                  type: "stacked",
                  ...serviceMonthly,
                },
                {
                  title: "Requests by Item per Month",
                  note: "Additional item-level explanation for the selected scope.",
                  type: "stacked",
                  ...itemMonthly,
                },
              ],
            };
          }

          return {
            ...base,
            cards: [
              { title: "Requests in Scope", value: total, note: "Rows selected for this KPI" },
              { title: "Open Backlog", value: backlog, note: "Requests still pending attention" },
              { title: "Closed Requests", value: closed, note: "Requests already completed or closed" },
            ],
            line: { title: "Request Volume Trend", data: openedMonthly, label: "Requests" },
            extras: [
              {
                title: "Request Volume by Service per Month",
                note: "Monthly comparison for the top services in the selected scope.",
                type: "stacked",
                ...serviceMonthly,
              },
              {
                title: "Request Volume by Group per Month",
                note: "Shows which groups handled the selected request scope.",
                type: "stacked",
                ...groupMonthly,
              },
            ],
          };
        }
    }
  }, [selectedKpi, backlog, total, olderThan60, groups, closed, services, items, openedMonthly, requestedFor, agingStateData, openRows, closedRows, serviceMonthly, groupMonthly, itemMonthly]);

  return (
    <Box className="print-dashboard-root">
      <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" alignItems={{ xs: "flex-start", md: "center" }} mb={2} spacing={2}>
        <Header
          title={focusedView ? focusedView.title : "SERVICE REQUEST FULFILLMENT DASHBOARD"}
          subTitle={
            focusedView
              ? `${focusedView.note} ${total} selected requests in scope.`
              : `${total} selected requests - KPI and aging view aligned to the monthly report`
          }
        />
        <Stack direction="row" spacing={1} className="print-export-hidden">
          <Button variant="outlined" onClick={() => navigate("/requests")}>
            Back
          </Button>
          <ExportPdfButton fileName={(focusedView?.title || "requests-dashboard").replaceAll(" ", "-").toLowerCase()} />
        </Stack>
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
          ) : focusedView.chart?.type === "stacked" ? (
            <ChartCard
              title={focusedView.chart.title}
              note={focusedView.note}
              height={300}
              legendItems={makeLegendItems([...new Set(openRows.map((row) => row.state).filter(Boolean))])}
            >
              <ResponsiveBar
                data={focusedView.chart.data}
                keys={[...new Set(openRows.map((row) => row.state).filter(Boolean))]}
                indexBy="aging"
                groupMode="stacked"
                margin={{ top: 20, right: 20, bottom: 60, left: 50 }}
                padding={0.28}
                colors={({ id }) =>
                  getChartColor([...new Set(openRows.map((row) => row.state).filter(Boolean))].indexOf(id))
                }
                axisLeft={{ legend: "Request Count", legendOffset: -40 }}
                tooltip={renderBarTooltip}
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
        </>
      ) : (
        <>
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
            tooltip={renderLineTooltip}
            theme={{ textColor: theme.palette.text.primary }}
          />
        </ChartCard>

        <ChartCard
          title="Backlog vs Closed Trend"
          note="Shows the selected scope trend between newly opened and closed requests."
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
            colors={({ id }) =>
              getChartColor([...new Set(openRows.map((row) => row.state).filter(Boolean))].indexOf(id))
            }
            axisLeft={{ legend: "Request Count", legendOffset: -40 }}
            tooltip={renderBarTooltip}
            theme={{ textColor: theme.palette.text.primary }}
          />
        </ChartCard>

        <ChartCard
          title="Aging by Group Level"
          note="Distribution of backlog volume by responsible group."
          height={300}
          legendItems={makeLegendItems(groups.slice(0, 6).map((item) => item.label))}
        >
          <ResponsivePie
            data={groups.slice(0, 6).map((item, index) => ({
              id: item.label,
              label: item.label,
              value: item.value,
              color: getChartColor(index),
            }))}
            margin={{ top: 20, right: 80, bottom: 50, left: 80 }}
            innerRadius={0.55}
            padAngle={0.7}
            cornerRadius={3}
            activeOuterRadiusOffset={8}
            colors={{ datum: "data.color" }}
            tooltip={renderPieTooltip}
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
            colors={({ index }) => getChartColor(index)}
            axisBottom={{ tickRotation: -35 }}
            axisLeft={{ legend: "Count", legendOffset: -40 }}
            tooltip={renderBarTooltip}
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
            colors={({ index }) => getChartColor(index)}
            axisBottom={{ tickRotation: -35 }}
            axisLeft={{ legend: "Count", legendOffset: -40 }}
            tooltip={renderBarTooltip}
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
        </>
      )}
    </Box>
  );
}
