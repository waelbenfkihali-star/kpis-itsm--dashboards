import React from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Divider,
  Grid,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import SendRoundedIcon from "@mui/icons-material/SendRounded";
import AutoAwesomeOutlinedIcon from "@mui/icons-material/AutoAwesomeOutlined";
import { ResponsiveBar } from "@nivo/bar";
import { ResponsiveLine } from "@nivo/line";
import { ResponsivePie } from "@nivo/pie";
import { useLocation } from "react-router-dom";
import ExportPdfButton from "../../components/ExportPdfButton";
import Header from "../../components/Header";
import PrintReportHeader from "../../components/PrintReportHeader";
import { apiFetch, apiFetchJson } from "../../utils/api";
import ChartLegend from "../analysis/ChartLegend";
import { getChartColor, renderBarTooltip, renderLineTooltip } from "../analysis/analysisUtils";
import {
  buildAssistantResult,
  buildAssistantResultFromIntent,
} from "../../components/insightAssistantUtils";

function KpiCard({ label, value, note }) {
  return (
    <Paper
      variant="outlined"
      sx={{
        p: 2.2,
        borderRadius: 4,
        minWidth: 180,
        flex: 1,
        background: "linear-gradient(180deg, rgba(194,109,58,0.12), rgba(122,143,70,0.06))",
      }}
    >
      <Typography variant="body2" color="text.secondary" sx={{ textTransform: "uppercase", letterSpacing: "0.04em" }}>
        {label}
      </Typography>
      <Typography variant="h4" fontWeight={900} sx={{ mt: 0.7, lineHeight: 1.05 }}>
        {value}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
        {note}
      </Typography>
    </Paper>
  );
}

function InterpretationCard({ interpretation }) {
  if (!interpretation) return null;

  return (
    <Paper variant="outlined" sx={{ p: 2, borderRadius: 3 }}>
      <Typography variant="subtitle1" fontWeight={700} mb={1}>
        Offline Interpretation
      </Typography>
      <Typography variant="body2" color="text.secondary">
        Confidence {interpretation.confidence}% • Module: {interpretation.module} • State: {interpretation.state} • Metric: {interpretation.metric} • Period: {interpretation.period}
      </Typography>
      {(interpretation.groupings || []).length ? (
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          Groupings: {(interpretation.groupings || []).join(", ")}
        </Typography>
      ) : null}
      {(interpretation.filters || []).length ? (
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          Filters: {(interpretation.filters || []).join(" • ")}
        </Typography>
      ) : null}
    </Paper>
  );
}

function SpotlightCard({ spotlight }) {
  if (!spotlight) return null;

  return (
    <Alert
      severity="info"
      sx={{
        borderRadius: 3,
        "& .MuiAlert-message": { width: "100%" },
        backgroundColor: "rgba(122,143,70,0.10)",
        border: "1px solid rgba(122,143,70,0.24)",
      }}
    >
      <Typography variant="subtitle1" fontWeight={700}>
        {spotlight.title}
      </Typography>
      <Typography variant="body2" sx={{ mt: 0.5 }}>
        {spotlight.body}
      </Typography>
    </Alert>
  );
}

function ExecutiveNotes({ notes }) {
  if (!notes?.length) return null;

  return (
    <Paper variant="outlined" sx={{ p: 2, borderRadius: 3 }}>
      <Typography variant="subtitle1" fontWeight={700} mb={1}>
        Executive Summary
      </Typography>
      <Stack spacing={0.8}>
        {notes.map((note) => (
          <Typography key={note} variant="body2" color="text.secondary">
            • {note}
          </Typography>
        ))}
      </Stack>
    </Paper>
  );
}

function buildChartLegend(chart) {
  if (!chart) return [];

  if (chart.type === "multiLine") {
    return (chart.data || []).map((item, index) => ({
      label: item.id,
      color: item.color || getChartColor(index),
    }));
  }

  if (chart.type === "pie") {
    return (chart.data || []).map((item, index) => ({
      label: item.label || item.id,
      color: item.color || getChartColor(index),
    }));
  }

  if (chart.type === "bar") {
    return (chart.data || []).slice(0, 8).map((item, index) => ({
      label: item.label || item.month,
      color: item.color || getChartColor(index),
    }));
  }

  if (chart.type === "line") {
    return [{ label: chart.label || "Series", color: chart.color || getChartColor(0) }];
  }

  return [];
}

function DashboardChart({ chart }) {
  if (!chart) return null;
  const firstPoint = Array.isArray(chart.data) ? chart.data[0] : null;
  const legendItems = buildChartLegend(chart);
  const lineColor = chart.color || getChartColor(0);
  const lineSeries = [
    {
      id: chart.label,
      data: chart.data.map((item) => ({ x: item.month, y: item.value })),
      color: lineColor,
    },
  ];
  const multiLineSeries = (chart.data || []).map((item, index) => ({
    ...item,
    color: item.color || getChartColor(index),
  }));
  const pieData = (chart.data || []).map((item, index) => ({
    ...item,
    color: item.color || getChartColor(index),
  }));
  const barData = (chart.data || []).map((item, index) => ({
    ...item,
    color: item.color || getChartColor(index),
  }));

  if (chart.type === "line") {
    return (
      <Stack sx={{ height: "100%" }}>
        <Box sx={{ flex: 1, minHeight: 0 }}>
          <ResponsiveLine
            data={lineSeries}
            margin={{ top: 20, right: 20, bottom: 60, left: 50 }}
            xScale={{ type: "point" }}
            yScale={{ type: "linear", min: 0, max: "auto", stacked: false }}
            axisBottom={{ tickRotation: -35 }}
            axisLeft={{ legend: "Count", legendOffset: -40 }}
            pointSize={8}
            pointBorderWidth={2}
            pointBorderColor={{ from: "serieColor" }}
            useMesh
            colors={({ color }) => color || lineColor}
            enableArea
            areaOpacity={0.12}
            tooltip={renderLineTooltip}
          />
        </Box>
        <ChartLegend items={legendItems} />
      </Stack>
    );
  }

  if (chart.type === "multiLine") {
    return (
      <Stack sx={{ height: "100%" }}>
        <Box sx={{ flex: 1, minHeight: 0 }}>
          <ResponsiveLine
            data={multiLineSeries}
            margin={{ top: 20, right: 20, bottom: 60, left: 50 }}
            xScale={{ type: "point" }}
            yScale={{ type: "linear", min: 0, max: "auto", stacked: false }}
            axisBottom={{ tickRotation: -35 }}
            axisLeft={{ legend: "Count", legendOffset: -40 }}
            pointSize={8}
            pointBorderWidth={2}
            pointBorderColor={{ from: "serieColor" }}
            useMesh
            colors={({ color, id }) => color || multiLineSeries.find((item) => item.id === id)?.color || getChartColor(0)}
            enableArea={false}
            tooltip={renderLineTooltip}
          />
        </Box>
        <ChartLegend items={legendItems} />
      </Stack>
    );
  }

  if (chart.type === "pie") {
    return (
      <Stack sx={{ height: "100%" }}>
        <Box sx={{ flex: 1, minHeight: 0 }}>
          <ResponsivePie
            data={pieData}
            margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
            innerRadius={0.55}
            padAngle={1}
            cornerRadius={4}
            activeOuterRadiusOffset={8}
            colors={({ datum }) => datum?.data?.color || datum?.color}
            borderWidth={1}
            borderColor={{ from: "color", modifiers: [["darker", 0.2]] }}
            arcLinkLabelsSkipAngle={12}
            arcLabelsSkipAngle={10}
          />
        </Box>
        <ChartLegend items={legendItems} />
      </Stack>
    );
  }

  return (
    <Stack sx={{ height: "100%" }}>
      <Box sx={{ flex: 1, minHeight: 0 }}>
        <ResponsiveBar
          data={barData}
          keys={["value"]}
          indexBy={firstPoint && Object.prototype.hasOwnProperty.call(firstPoint, "month") ? "month" : "label"}
          margin={{ top: 20, right: 20, bottom: 90, left: 50 }}
          padding={0.3}
          colors={({ data }) => data?.color || getChartColor(0)}
          axisBottom={{ tickRotation: -35 }}
          axisLeft={{ legend: "Count", legendOffset: -40 }}
          tooltip={renderBarTooltip}
        />
      </Box>
      <ChartLegend items={legendItems} />
    </Stack>
  );
}

function MessageBubble({ role, children }) {
  const isUser = role === "user";
  return (
    <Box
      sx={{
        alignSelf: isUser ? "flex-end" : "flex-start",
        maxWidth: "88%",
        px: 1.5,
        py: 1.2,
        borderRadius: 3,
        bgcolor: isUser ? "primary.main" : "background.paper",
        color: isUser ? "primary.contrastText" : "text.primary",
        border: isUser ? "none" : (theme) => `1px solid ${theme.palette.divider}`,
      }}
    >
      <Typography variant="body2" sx={{ whiteSpace: "pre-wrap" }}>
        {children}
      </Typography>
    </Box>
  );
}

export default function AssistantDashboard() {
  const location = useLocation();
  const [loadingData, setLoadingData] = React.useState(false);
  const [datasets, setDatasets] = React.useState({
    incidents: [],
    requests: [],
    changes: [],
  });
  const [input, setInput] = React.useState(location.state?.initialQuery || "");
  const [messages, setMessages] = React.useState([
    {
      id: 1,
      role: "assistant",
      content:
        "Describe the dashboard you want in English or French. I will try to build the closest matching result from incidents, requests, and changes.",
    },
  ]);
  const [result, setResult] = React.useState(null);
  const [error, setError] = React.useState("");
  const [resultMode, setResultMode] = React.useState("idle");

  const ensureDataLoaded = React.useCallback(async () => {
    if (datasets.incidents.length || datasets.requests.length || datasets.changes.length) {
      return datasets;
    }

    setLoadingData(true);
    setError("");

    try {
      const [incidents, requests, changes] = await Promise.all([
        apiFetch("/incidents/").then((res) => res.json()),
        apiFetch("/requests/").then((res) => res.json()),
        apiFetch("/changes/").then((res) => res.json()),
      ]);

      const next = {
        incidents: Array.isArray(incidents) ? incidents : [],
        requests: Array.isArray(requests) ? requests : [],
        changes: Array.isArray(changes) ? changes : [],
      };

      setDatasets(next);
      return next;
    } catch (fetchError) {
      const message = fetchError?.message || "Unable to load data for the assistant.";
      setError(message);
      throw fetchError;
    } finally {
      setLoadingData(false);
    }
  }, [datasets]);

  const runQuery = React.useCallback(
    async (rawQuery) => {
      const query = String(rawQuery || "").trim();
      if (!query) return;

      setMessages((prev) => [
        ...prev,
        { id: Date.now(), role: "user", content: query },
      ]);
      setInput("");

      try {
        const loaded = await ensureDataLoaded();
        let nextResult;

        try {
          const aiResponse = await apiFetchJson("/ai/dashboard-query/", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ prompt: query }),
          });
          nextResult = buildAssistantResultFromIntent(aiResponse.intent, loaded);
          setResultMode("ai");
        } catch (aiError) {
          nextResult = buildAssistantResult(query, loaded);
          nextResult.answer = `${nextResult.answer} (Local smart mode)`;
          setResultMode("fallback");
        }

        setResult(nextResult);
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now() + 1,
            role: "assistant",
            content: nextResult.answer,
          },
        ]);
      } catch {
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now() + 1,
            role: "assistant",
            content: "I couldn't load the ITSM data right now.",
          },
        ]);
      }
    },
    [ensureDataLoaded]
  );

  React.useEffect(() => {
    const initialQuery = location.state?.initialQuery;
    if (initialQuery) {
      runQuery(initialQuery);
    }
  }, [location.state, runQuery]);

  return (
    <Box>
      <Header
        title="AI DASHBOARD BUILDER"
        subTitle="Describe the dashboard you need in natural language and review the result here."
      />

      <Grid container spacing={2} alignItems="stretch">
        <Grid item xs={12} lg={4}>
          <Card sx={{ borderRadius: 4, position: { lg: "sticky" }, top: { lg: 96 } }}>
            <CardContent sx={{ display: "flex", flexDirection: "column", gap: 2, height: "100%" }}>
              <Stack direction="row" spacing={1} alignItems="center">
                <AutoAwesomeOutlinedIcon color="primary" />
                <Box>
                  <Typography variant="h6" fontWeight={800}>
                    Ask Anything
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Describe the dashboard you need in your own words
                  </Typography>
                </Box>
              </Stack>

              <Stack
                sx={{
                  minHeight: 180,
                  maxHeight: { xs: 220, lg: 260 },
                  overflowY: "auto",
                  gap: 1.2,
                  p: 1,
                  bgcolor: "background.default",
                  borderRadius: 3,
                }}
              >
                {messages.map((message) => (
                  <MessageBubble key={message.id} role={message.role}>
                    {message.content}
                  </MessageBubble>
                ))}

                {loadingData ? (
                  <Stack direction="row" spacing={1} alignItems="center">
                    <CircularProgress size={18} />
                    <Typography variant="body2" color="text.secondary">
                      Loading ITSM data...
                    </Typography>
                  </Stack>
                ) : null}
                {error ? <Typography variant="body2" color="error">{error}</Typography> : null}
              </Stack>

              <Stack direction="row" spacing={1} alignItems="flex-end">
                <TextField
                  fullWidth
                  multiline
                  minRows={2}
                  maxRows={3}
                  label="Describe your dashboard"
                  placeholder="Compare incidents and requests between 2022 and 2024 by month"
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" && !event.shiftKey) {
                      event.preventDefault();
                      runQuery(input);
                    }
                  }}
                />
                <Button
                  variant="contained"
                  size="large"
                  endIcon={<SendRoundedIcon />}
                  onClick={() => runQuery(input)}
                >
                  Run
                </Button>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} lg={8}>
          <Card className="print-dashboard-root" sx={{ borderRadius: 4, minHeight: 720 }}>
            <CardContent>
              {result ? (
                <Stack spacing={2}>
                  <Stack
                    direction={{ xs: "column", md: "row" }}
                    justifyContent="space-between"
                    alignItems={{ xs: "flex-start", md: "center" }}
                    spacing={2}
                  >
                    <Box>
                      <Typography variant="h5" fontWeight={800}>
                        {result.title}
                      </Typography>
                      <Typography variant="body1" color="text.secondary">
                        {result.answer}
                      </Typography>
                    </Box>
                    <ExportPdfButton
                      fileName={(result.title || "ai-dashboard").replaceAll(" ", "-").toLowerCase()}
                      label="Export PDF"
                    />
                  </Stack>

                  <PrintReportHeader
                    reportTitle={result.title || "AI Dashboard Result"}
                    reportSubtitle={result.answer}
                    scopeLabel={result.summary?.join(" • ") || "AI generated dashboard"}
                  />

                  <InterpretationCard interpretation={result.interpretation} />
                  <SpotlightCard spotlight={result.spotlight} />
                  <ExecutiveNotes notes={result.executiveNotes} />

                  {result.summary?.length ? (
                    <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7 }}>
                      {result.summary.join(" • ")}
                    </Typography>
                  ) : null}

                  {result.kpis?.length ? (
                    <Stack direction={{ xs: "column", md: "row" }} spacing={1.5} flexWrap="wrap" useFlexGap>
                      {result.kpis.map((item) => (
                        <KpiCard
                          key={`${item.label}-${item.value}`}
                          label={item.label}
                          value={item.value}
                          note={item.note}
                        />
                      ))}
                    </Stack>
                  ) : null}

                  {result.ok !== false && result.chart ? (
                    <Paper
                      variant="outlined"
                      sx={{
                        p: 2,
                        borderRadius: 4,
                        background: "linear-gradient(180deg, rgba(194,109,58,0.10), rgba(212,162,57,0.08))",
                      }}
                    >
                      <Typography variant="subtitle1" fontWeight={800} mb={0.4}>
                        Main Chart
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
                        Primary visual answer to your dashboard request.
                      </Typography>
                      <Divider sx={{ mb: 2 }} />
                      <Box sx={{ height: 430 }}>
                        <DashboardChart chart={result.chart} />
                      </Box>
                    </Paper>
                  ) : (
                    <Paper variant="outlined" sx={{ p: 2, borderRadius: 3 }}>
                      <Typography variant="body1">{result.answer}</Typography>
                    </Paper>
                  )}

                  {result.widgets?.length ? (
                    <Grid container spacing={2}>
                      {result.widgets.map((widget) => (
                        <Grid item xs={12} md={6} key={widget.title}>
                          <Paper
                            variant="outlined"
                            sx={{
                              p: 2,
                              height: "100%",
                              borderRadius: 4,
                              background: "linear-gradient(180deg, rgba(63,124,133,0.10), rgba(139,94,131,0.08))",
                            }}
                          >
                            <Typography variant="subtitle1" fontWeight={800}>
                              {widget.title}
                            </Typography>
                            {widget.summary ? (
                              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, mb: 1.5 }}>
                                {widget.summary}
                              </Typography>
                            ) : null}
                            <Box sx={{ height: 280 }}>
                              <DashboardChart chart={widget.chart} />
                            </Box>
                          </Paper>
                        </Grid>
                      ))}
                    </Grid>
                  ) : null}

                  {result.suggestions?.length ? (
                    <Paper variant="outlined" sx={{ p: 2, borderRadius: 3 }}>
                      <Typography variant="subtitle1" fontWeight={700} mb={1}>
                        Try Next
                      </Typography>
                      <Stack spacing={0.8}>
                        {result.suggestions.map((suggestion) => (
                          <Button
                            key={suggestion}
                            variant="text"
                            sx={{ justifyContent: "flex-start" }}
                            onClick={() => runQuery(suggestion)}
                          >
                            {suggestion}
                          </Button>
                        ))}
                      </Stack>
                    </Paper>
                  ) : null}

                  {result.followUps?.length ? (
                    <Paper variant="outlined" sx={{ p: 2, borderRadius: 3 }}>
                      <Typography variant="subtitle1" fontWeight={700} mb={1}>
                        Suggested Follow-ups
                      </Typography>
                      <Stack spacing={0.8}>
                        {result.followUps.map((suggestion) => (
                          <Button
                            key={suggestion}
                            variant="text"
                            sx={{ justifyContent: "flex-start" }}
                            onClick={() => runQuery(suggestion)}
                          >
                            {suggestion}
                          </Button>
                        ))}
                      </Stack>
                    </Paper>
                  ) : null}
                </Stack>
              ) : (
                <Stack
                  justifyContent="center"
                  alignItems="center"
                  spacing={2}
                  sx={{ minHeight: 620, textAlign: "center" }}
                >
                  <AutoAwesomeOutlinedIcon color="primary" sx={{ fontSize: 42 }} />
                  <Box>
                    <Typography variant="h6" fontWeight={800}>
                      Your dashboard will appear here
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Ask for a KPI view, trend, backlog, or grouped dashboard and I will build the closest matching result.
                    </Typography>
                  </Box>
                </Stack>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
