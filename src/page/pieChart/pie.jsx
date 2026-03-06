import React from "react";
import { ResponsivePie } from "@nivo/pie";
import { Box, useTheme } from "@mui/material";

// ✅ Dummy data (replace later with API)
const data = [
  { id: "P1", label: "P1 - Critical", value: 18 },
  { id: "P2", label: "P2 - High", value: 42 },
  { id: "P3", label: "P3 - Medium", value: 65 },
  { id: "P4", label: "P4 - Low", value: 30 },
];

const Pie = ({ isDashbord = false }) => {
  const theme = useTheme();

  // ✅ total for percentage tooltip
  const total = data.reduce((sum, d) => sum + d.value, 0);

  return (
    <Box sx={{ height: isDashbord ? "200px" : "75vh" }}>
      <ResponsivePie
        data={data}
        // ✅ tooltip: show percentage only (value already visible in chart)
        tooltip={({ datum }) => {
          const pct = total ? ((datum.value / total) * 100).toFixed(1) : "0.0";
          return (
            <div
              style={{
                background: theme.palette.background.default,
                color: theme.palette.text.primary,
                padding: "8px 10px",
                borderRadius: 8,
                border: `1px solid ${theme.palette.divider}`,
                fontSize: 12,
              }}
            >
              <div style={{ fontWeight: 600 }}>{datum.label}</div>
              <div>{pct}%</div>
            </div>
          );
        }}
        theme={{
          textColor: theme.palette.text.primary,
          fontSize: 11,
          axis: {
            domain: {
              line: {
                stroke: theme.palette.divider,
                strokeWidth: 1,
              },
            },
            legend: {
              text: {
                fontSize: 12,
                fill: theme.palette.text.primary,
              },
            },
            ticks: {
              line: {
                stroke: theme.palette.divider,
                strokeWidth: 1,
              },
              text: {
                fontSize: 11,
                fill: theme.palette.text.secondary,
              },
            },
          },
          grid: {
            line: {
              stroke: theme.palette.divider,
              strokeWidth: 1,
            },
          },
          legends: {
            title: {
              text: {
                fontSize: 11,
                fill: theme.palette.text.primary,
              },
            },
            text: {
              fontSize: 11,
              fill: theme.palette.text.primary,
            },
            ticks: {
              line: {},
              text: {
                fontSize: 10,
                fill: theme.palette.text.primary,
              },
            },
          },
          tooltip: {
            container: {
              background: theme.palette.background.default,
              color: theme.palette.text.primary,
              fontSize: 12,
            },
          },
        }}
        margin={
          isDashbord
            ? { top: 10, right: 0, bottom: 10, left: 0 }
            : { top: 40, right: 80, bottom: 80, left: 80 }
        }
        innerRadius={isDashbord ? 0.8 : 0.5}
        padAngle={0.7}
        cornerRadius={3}
        activeOuterRadiusOffset={8}
        colors={{ scheme: "nivo" }}
        borderWidth={1}
        borderColor={{
          from: "color",
          modifiers: [["darker", 0.2]],
        }}
        arcLinkLabelsSkipAngle={10}
        arcLinkLabelsTextColor={theme.palette.text.primary}
        arcLinkLabelsThickness={2}
        arcLinkLabelsColor={{ from: "color" }}
        arcLabelsSkipAngle={10}
        enableArcLabels={isDashbord ? false : true}
        enableArcLinkLabels={isDashbord ? false : true}
        arcLabelsTextColor={{
          from: "color",
          modifiers: [["darker", 2]],
        }}
        defs={[
          {
            id: "dots",
            type: "patternDots",
            background: "inherit",
            color: theme.palette.text.primary,
            size: 4,
            padding: 1,
            stagger: true,
          },
          {
            id: "lines",
            type: "patternLines",
            background: "inherit",
            color: theme.palette.text.primary,
            rotation: -45,
            lineWidth: 6,
            spacing: 10,
          },
        ]}
        fill={[
          {
            match: { id: "P1" },
            id: "dots",
          },
          {
            match: { id: "P3" },
            id: "lines",
          },
        ]}
        legends={
          isDashbord
            ? []
            : [
                {
                  anchor: "bottom",
                  direction: "row",
                  justify: false,
                  translateX: 0,
                  translateY: 56,
                  itemsSpacing: 0,
                  itemWidth: 120,
                  itemHeight: 18,
                  itemTextColor: theme.palette.text.primary,
                  itemDirection: "left-to-right",
                  itemOpacity: 1,
                  symbolSize: 18,
                  symbolShape: "circle",
                  effects: [
                    {
                      on: "hover",
                      style: {
                        itemTextColor: theme.palette.text.primary,
                      },
                    },
                  ],
                },
              ]
        }
      />
    </Box>
  );
};

export default Pie;