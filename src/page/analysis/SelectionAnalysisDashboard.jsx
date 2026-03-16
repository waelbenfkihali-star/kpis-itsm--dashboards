import React, { useMemo } from "react";
import { Alert, Box, Button, Chip, Paper, Stack, Typography, useTheme } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { ResponsiveBar } from "@nivo/bar";
import { ResponsiveLine } from "@nivo/line";
import { ResponsivePie } from "@nivo/pie";
import { useLocation, useNavigate } from "react-router-dom";
import ExportPdfButton from "../../components/ExportPdfButton";
import Header from "../../components/Header";
import {
  countBy,
  makeBarData,
  makeLineData,
  makePieData,
  monthlySeries,
} from "./analysisUtils";

function KpiCard({ label, value, helper }) {
  return (
    <Paper sx={{ p: 2.2, flex: 1, minWidth: 180 }}>
      <Typography variant="body2" color="text.secondary" mb={0.7}>
        {label}
      </Typography>
      <Typography variant="h4" fontWeight={700}>
        {value}
      </Typography>
      <Typography variant="body2" color="text.secondary" mt={0.7}>
        {helper}
      </Typography>
    </Paper>
  );
}

function ChartCard({ title, children, height = 320 }) {
  return (
    <Paper sx={{ p: 2, flex: 1, minWidth: 320 }}>
      <Typography variant="h6" mb={1.5}>
        {title}
      </Typography>
      <Box sx={{ height }}>{children}</Box>
    </Paper>
  );
}

export default function SelectionAnalysisDashboard({
  title,
  subtitle,
  backPath,
  detailPathPrefix,
  dateKey,
  detailColumns,
  metricCards,
  statusKey,
  primaryBreakdownKey,
  secondaryBreakdownKey,
  insightBuilder,
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const rows = Array.isArray(location.state?.data) ? location.state.data : [];

  const statusCounts = useMemo(() => countBy(rows, statusKey), [rows, statusKey]);
  const primaryCounts = useMemo(() => countBy(rows, primaryBreakdownKey), [rows, primaryBreakdownKey]);
  const secondaryCounts = useMemo(() => countBy(rows, secondaryBreakdownKey), [rows, secondaryBreakdownKey]);
  const monthlyCounts = useMemo(() => monthlySeries(rows, dateKey), [rows, dateKey]);
  const insights = useMemo(
    () => (typeof insightBuilder === "function" ? insightBuilder(rows) : []),
    [rows, insightBuilder]
  );

  if (!rows.length) {
    return (
      <Box className="print-dashboard-root">
        <Header title={title} subTitle={`No ${subtitle.toLowerCase()} selected`} />
        <Alert severity="info" sx={{ mb: 2 }}>
          Select one or more rows from the table, then click Analyse again.
        </Alert>
        <Button variant="outlined" onClick={() => navigate(backPath)}>
          Back
        </Button>
      </Box>
    );
  }

  return (
    <Box className="print-dashboard-root">
      <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" alignItems={{ xs: "flex-start", md: "center" }} mb={2} spacing={2}>
        <Header title={title} subTitle={`${rows.length} selected ${subtitle.toLowerCase()}`} />
        <Stack direction="row" spacing={1} className="print-export-hidden">
          <Button variant="outlined" onClick={() => navigate(backPath)}>
            Back
          </Button>
          <ExportPdfButton fileName={title.replaceAll(" ", "-").toLowerCase()} />
        </Stack>
      </Stack>

      <Stack direction={{ xs: "column", lg: "row" }} spacing={2} mb={2}>
        {metricCards.map((card) => (
          <KpiCard
            key={card.label}
            label={card.label}
            value={card.getValue(rows)}
            helper={card.getHelper(rows)}
          />
        ))}
      </Stack>

      <Paper sx={{ p: 2, mb: 2 }}>
        <Typography variant="h6" mb={1}>
          Analysis Highlights
        </Typography>
        <Stack direction="row" flexWrap="wrap" gap={1}>
          {insights.map((item) => (
            <Chip key={item} label={item} color="primary" variant="outlined" />
          ))}
        </Stack>
      </Paper>

      <Stack direction={{ xs: "column", xl: "row" }} spacing={2} mb={2}>
        <ChartCard title="Status Distribution" height={300}>
          <ResponsivePie
            data={makePieData(statusCounts)}
            margin={{ top: 20, right: 80, bottom: 50, left: 80 }}
            innerRadius={0.55}
            padAngle={0.7}
            cornerRadius={3}
            activeOuterRadiusOffset={8}
            colors={{ scheme: "set2" }}
            theme={{ textColor: theme.palette.text.primary }}
          />
        </ChartCard>

        <ChartCard title="Monthly History" height={300}>
          <ResponsiveLine
            data={makeLineData(monthlyCounts, subtitle)}
            margin={{ top: 20, right: 20, bottom: 60, left: 50 }}
            xScale={{ type: "point" }}
            yScale={{ type: "linear", min: 0, max: "auto", stacked: false }}
            curve="catmullRom"
            axisBottom={{ tickRotation: -35, legend: "Month", legendOffset: 48 }}
            axisLeft={{ legend: "Count", legendOffset: -40 }}
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
      </Stack>

      <Stack direction={{ xs: "column", xl: "row" }} spacing={2} mb={2}>
        <ChartCard title={`Top ${primaryBreakdownKey.replaceAll("_", " ")}`} height={320}>
          <ResponsiveBar
            data={makeBarData(primaryCounts)}
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

        <ChartCard title={`Top ${secondaryBreakdownKey.replaceAll("_", " ")}`} height={320}>
          <ResponsiveBar
            data={makeBarData(secondaryCounts)}
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
          Selected Rows
        </Typography>
        <Box sx={{ height: 520 }}>
          <DataGrid
            rows={rows}
            columns={detailColumns}
            disableRowSelectionOnClick
            getRowId={(row) => row.id}
            onRowClick={(params) => navigate(`${detailPathPrefix}/${params.row.number}`)}
            pageSizeOptions={[10, 25, 50]}
          />
        </Box>
      </Paper>
    </Box>
  );
}
