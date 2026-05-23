// hna component legend ta3 charts fi analysis pages
import React from "react";
import { Box, Stack, Typography } from "@mui/material";

// Component li ya3ti legend ta3 l chart: color swatch w label l kol item
// items howa array, kol item fih label w color
export default function ChartLegend({ items = [] }) {
  // ida ma fama items, ma nraj3ouch 7aja: ne5fou legend kolou
  if (!items.length) return null;

  return (
    <Stack
      className="chart-legend"
      direction="row"
      useFlexGap
      flexWrap="wrap"
      spacing={1.5}
      sx={{ mt: 1.5, rowGap: 1 }}
    >
      {items.map((item) => (
        // hna na3mlou item wahdou fi legend: color bullet + text
        <Stack
          key={item.label}
          className="chart-legend-item"
          direction="row"
          spacing={0.8}
          alignItems="center"
          sx={{ minWidth: 0, maxWidth: "100%" }}
        >
          <Box
            className="chart-legend-swatch"
            sx={{
              width: 12,
              height: 12,
              borderRadius: "999px",
              flexShrink: 0,
              backgroundColor: item.color,
              border: "1px solid rgba(17, 24, 39, 0.35)",
              boxShadow: "inset 0 0 0 1px rgba(255, 255, 255, 0.15)",
              printColorAdjust: "exact",
              WebkitPrintColorAdjust: "exact",
            }}
          />
          <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.3 }}>
            {item.label}
          </Typography>
        </Stack>
      ))}
    </Stack>
  );
}
