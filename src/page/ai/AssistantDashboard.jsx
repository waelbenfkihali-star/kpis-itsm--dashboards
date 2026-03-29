import React from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
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
import PsychologyAltOutlinedIcon from "@mui/icons-material/PsychologyAltOutlined";
import { ResponsiveBar } from "@nivo/bar";
import { ResponsiveLine } from "@nivo/line";
import { ResponsivePie } from "@nivo/pie";
import { useLocation } from "react-router-dom";
import ExportPdfButton from "../../components/ExportPdfButton";
import Header from "../../components/Header";
import PrintReportHeader from "../../components/PrintReportHeader";
import { apiFetch, apiFetchJson } from "../../utils/api";
import { getChartColor, renderBarTooltip, renderLineTooltip } from "../analysis/analysisUtils";
import {
  assistantPromptExamples,
  buildAssistantResult,
  buildAssistantResultFromIntent,
} from "../../components/insightAssistantUtils";

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

        setResult(nextResult.ok ? nextResult : null);
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

  const chartNode = React.useMemo(() => {
    if (!result?.chart) return null;

    if (result.chart.type === "line") {
      return (
        <ResponsiveLine
          data={[
            {
              id: result.chart.label,
              data: result.chart.data.map((item) => ({ x: item.month, y: item.value })),
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
          colors={[getChartColor(0)]}
          enableArea
          areaOpacity={0.08}
          tooltip={renderLineTooltip}
        />
      );
    }

    if (result.chart.type === "multiLine") {
      return (
        <ResponsiveLine
          data={result.chart.data}
          margin={{ top: 20, right: 20, bottom: 60, left: 50 }}
          xScale={{ type: "point" }}
          yScale={{ type: "linear", min: 0, max: "auto", stacked: false }}
          axisBottom={{ tickRotation: -35 }}
          axisLeft={{ legend: "Count", legendOffset: -40 }}
          pointSize={8}
          pointBorderWidth={2}
          pointBorderColor={{ from: "serieColor" }}
          useMesh
          colors={({ id, index }) => getChartColor(index)}
          enableArea={false}
          tooltip={renderLineTooltip}
        />
      );
    }

    if (result.chart.type === "pie") {
      return (
        <ResponsivePie
          data={result.chart.data}
          margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
          innerRadius={0.55}
          padAngle={1}
          cornerRadius={4}
          activeOuterRadiusOffset={8}
          colors={({ index }) => getChartColor(index)}
          borderWidth={1}
          borderColor={{ from: "color", modifiers: [["darker", 0.2]] }}
          arcLinkLabelsSkipAngle={12}
          arcLabelsSkipAngle={10}
        />
      );
    }

    return (
      <ResponsiveBar
        data={result.chart.data}
        keys={["value"]}
        indexBy="label"
        margin={{ top: 20, right: 20, bottom: 90, left: 50 }}
        padding={0.3}
        colors={[getChartColor(0)]}
        axisBottom={{ tickRotation: -35 }}
        axisLeft={{ legend: "Count", legendOffset: -40 }}
        tooltip={renderBarTooltip}
      />
    );
  }, [result]);

  return (
    <Box>
      <Header
        title="AI DASHBOARD BUILDER"
        subTitle="Describe the dashboard you need in natural language and review the result here."
      />

      <Grid container spacing={2} alignItems="stretch">
        <Grid item xs={12} lg={4}>
          <Card sx={{ borderRadius: 4, height: "100%", position: { lg: "sticky" }, top: { lg: 96 } }}>
            <CardContent sx={{ display: "flex", flexDirection: "column", gap: 2, height: "100%" }}>
              <Stack direction="row" spacing={1} alignItems="center">
                <AutoAwesomeOutlinedIcon color="primary" />
                <Box>
                  <Typography variant="h6" fontWeight={800}>
                    Ask Anything
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    English, French, or mixed natural language
                  </Typography>
                </Box>
              </Stack>

              <Alert
                severity={resultMode === "ai" ? "success" : "info"}
                icon={<PsychologyAltOutlinedIcon />}
              >
                {resultMode === "ai"
                  ? "AI mode is active. Your request was interpreted by the backend AI service."
                  : "Fallback mode is active until OPENAI_API_KEY is configured on the backend."}
              </Alert>

              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                {assistantPromptExamples.map((example) => (
                  <Chip
                    key={example}
                    label={example}
                    variant="outlined"
                    onClick={() => runQuery(example)}
                  />
                ))}
              </Stack>

              <Stack
                sx={{
                  flex: 1,
                  minHeight: 320,
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

                {error ? <Alert severity="error">{error}</Alert> : null}
              </Stack>

              <Stack direction="row" spacing={1} alignItems="flex-end">
                <TextField
                  fullWidth
                  multiline
                  maxRows={5}
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
                    reportTitle={result.title}
                    reportSubtitle={result.answer}
                    scopeLabel={result.summary?.join(" • ") || "AI generated dashboard"}
                  />

                  <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                    {result.summary?.map((item) => (
                      <Chip key={item} label={item} />
                    ))}
                  </Stack>

                  <Paper variant="outlined" sx={{ p: 2 }}>
                    <Typography variant="subtitle1" fontWeight={700} mb={1}>
                      Generated Dashboard
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                    <Box sx={{ height: 430 }}>
                      {chartNode}
                    </Box>
                  </Paper>
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
