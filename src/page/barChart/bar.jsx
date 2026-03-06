import React from "react";
import { ResponsiveBar } from "@nivo/bar";
import { Box, useTheme } from "@mui/material";

// ✅ Dummy ITSM monthly data (replace later with API)
const data = [
  { month: "2025-10", Incidents: 120, Requests: 80, Changes: 35 },
  { month: "2025-11", Incidents: 140, Requests: 95, Changes: 42 },
  { month: "2025-12", Incidents: 110, Requests: 75, Changes: 30 },
  { month: "2026-01", Incidents: 160, Requests: 105, Changes: 55 },
  { month: "2026-02", Incidents: 150, Requests: 98, Changes: 49 },
  { month: "2026-03", Incidents: 170, Requests: 115, Changes: 60 },
];

const Bar = ({ isDashbord = false }) => {
  const theme = useTheme();

  return (
    <Box sx={{ height: isDashbord ? "300px" : "75vh" }}>
      <ResponsiveBar
        data={data}
        keys={["Incidents", "Requests", "Changes"]}   // ✅ 3 series
        indexBy="month"                               // ✅ x axis
        groupMode="grouped"                           // ✅ THIS = جنب بعضهم (مش stacked)
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
          grid: { line: { stroke: theme.palette.divider, strokeWidth: 1 } },
          legends: {
            text: { fontSize: 11, fill: theme.palette.text.primary },
          },
          tooltip: {
            container: {
              background: theme.palette.background.default,
              color: theme.palette.text.primary,
              fontSize: 12,
            },
          },
        }}
        margin={{ top: 40, right: 120, bottom: 60, left: 60 }}
        padding={0.25}
        valueScale={{ type: "linear" }}
        indexScale={{ type: "band", round: true }}
        colors={{ scheme: "paired" }}
        borderColor={{ from: "color", modifiers: [["darker", 1.2]] }}
        axisTop={null}
        axisRight={null}
        axisBottom={{
          tickSize: 5,
          tickPadding: 5,
          tickRotation: isDashbord ? 0 : -30,
          legend: isDashbord ? null : "Month",
          legendPosition: "middle",
          legendOffset: 45,
        }}
        axisLeft={{
          tickSize: 5,
          tickPadding: 5,
          tickRotation: 0,
          legend: isDashbord ? null : "Count",
          legendPosition: "middle",
          legendOffset: -45,
        }}
        labelSkipWidth={12}
        labelSkipHeight={12}
        legends={[
          {
            dataFrom: "keys",
            anchor: "bottom-right",
            direction: "column",
            translateX: 120,
            itemWidth: 110,
            itemHeight: 18,
            symbolSize: 14,
            itemOpacity: 0.9,
            effects: [{ on: "hover", style: { itemOpacity: 1 } }],
          },
        ]}
        role="application"
        ariaLabel="ITSM grouped bar chart"
      />
    </Box>
  );
};

export default Bar;