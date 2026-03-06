import React from "react";
import { Box, useTheme } from "@mui/material";
import { ResponsiveLine } from "@nivo/line";

// ✅ Dummy ITSM monthly trend (replace later with API)
const data = [
  {
    id: "Incidents",
    color: "hsl(205, 70%, 50%)",
    data: [
      { x: "2025-10", y: 120 },
      { x: "2025-11", y: 140 },
      { x: "2025-12", y: 110 },
      { x: "2026-01", y: 160 },
      { x: "2026-02", y: 150 },
      { x: "2026-03", y: 170 },
    ],
  },
  {
    id: "Requests",
    color: "hsl(64, 70%, 50%)",
    data: [
      { x: "2025-10", y: 80 },
      { x: "2025-11", y: 95 },
      { x: "2025-12", y: 75 },
      { x: "2026-01", y: 105 },
      { x: "2026-02", y: 98 },
      { x: "2026-03", y: 115 },
    ],
  },
  {
    id: "Changes",
    color: "hsl(172, 70%, 50%)",
    data: [
      { x: "2025-10", y: 35 },
      { x: "2025-11", y: 42 },
      { x: "2025-12", y: 30 },
      { x: "2026-01", y: 55 },
      { x: "2026-02", y: 49 },
      { x: "2026-03", y: 60 },
    ],
  },
];

// ✅ helper: get % change vs previous point for same serie
function changeVsPrev(serieId, x) {
  const serie = data.find((s) => String(s.id) === String(serieId));
  if (!serie) return { prev: null, pct: null };

  const idx = serie.data.findIndex((p) => String(p.x) === String(x));
  if (idx <= 0) return { prev: null, pct: null };

  const prev = Number(serie.data[idx - 1].y ?? 0);
  const cur = Number(serie.data[idx].y ?? 0);

  if (prev === 0) return { prev, pct: null }; // avoid division by zero
  const pct = ((cur - prev) / prev) * 100;

  return { prev, pct };
}

const Line = ({ isDahboard = false }) => {
  const theme = useTheme();

  return (
    <Box sx={{ height: isDahboard ? "280px" : "75vh" }}>
      <ResponsiveLine
        data={data}
        // ✅ Tooltip: show change vs previous month (same serie)
        tooltip={({ point }) => {
          const serieId = point.serieId;
          const x = point.data.xFormatted ?? point.data.x;
          const y = Number(point.data.yFormatted ?? point.data.y ?? 0);

          const { prev, pct } = changeVsPrev(serieId, x);

          let changeText = "No previous month";
          if (pct !== null) {
            const sign = pct >= 0 ? "+" : "";
            changeText = `${sign}${pct.toFixed(1)}% vs previous month`;
          } else if (prev !== null) {
            // prev exists but pct is null (prev=0)
            changeText = `vs previous month: ${prev} (base=0)`;
          }

          return (
            <div
              style={{
                background: theme.palette.background.default,
                color: theme.palette.text.primary,
                padding: "8px 10px",
                borderRadius: 8,
                border: `1px solid ${theme.palette.divider}`,
                fontSize: 12,
                minWidth: 190,
              }}
            >
              <div style={{ fontWeight: 700 }}>{serieId}</div>
              <div style={{ opacity: 0.85 }}>{x}</div>

              <div style={{ marginTop: 6, fontWeight: 600 }}>{y}</div>

              <div style={{ marginTop: 4, opacity: 0.9 }}>
                {changeText}
              </div>
            </div>
          );
        }}
        theme={{
          textColor: theme.palette.text.primary,
          fontSize: 11,
          axis: {
            domain: { line: { stroke: theme.palette.divider, strokeWidth: 1 } },
            legend: { text: { fontSize: 12, fill: theme.palette.text.primary } },
            ticks: {
              line: { stroke: theme.palette.divider, strokeWidth: 1 },
              text: { fontSize: 11, fill: theme.palette.text.secondary },
            },
          },
          grid: { line: { stroke: theme.palette.divider, strokeWidth: 0 } },
          legends: { text: { fontSize: 11, fill: theme.palette.text.primary } },
          tooltip: {
            container: {
              background: theme.palette.background.default,
              color: theme.palette.text.primary,
              fontSize: 12,
            },
          },
        }}
        curve="catmullRom"
        margin={{ top: 50, right: 110, bottom: 60, left: 60 }}
        xScale={{ type: "point" }}
        yScale={{
          type: "linear",
          min: "auto",
          max: "auto",
          stacked: false,
          reverse: false,
        }}
        axisTop={null}
        axisRight={null}
        axisBottom={{
          tickSize: 5,
          tickPadding: 5,
          tickRotation: isDahboard ? 0 : -30,
          legend: isDahboard ? null : "Month",
          legendOffset: 45,
          legendPosition: "middle",
        }}
        axisLeft={{
          tickSize: 5,
          tickPadding: 5,
          tickRotation: 0,
          legend: isDahboard ? null : "Count",
          legendOffset: -45,
          legendPosition: "middle",
        }}
        pointSize={8}
        pointColor={{ theme: "background" }}
        pointBorderWidth={2}
        pointBorderColor={{ from: "serieColor" }}
        useMesh={true}
        legends={[
          {
            anchor: "bottom-right",
            direction: "column",
            justify: false,
            translateX: 100,
            translateY: 0,
            itemsSpacing: 4,
            itemDirection: "left-to-right",
            itemWidth: 90,
            itemHeight: 18,
            itemOpacity: 0.85,
            symbolSize: 12,
            symbolShape: "circle",
            effects: [{ on: "hover", style: { itemOpacity: 1 } }],
          },
        ]}
      />
    </Box>
  );
};

export default Line;