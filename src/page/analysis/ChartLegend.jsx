import React from "react";
import { Box, Stack, Typography } from "@mui/material";

export default function ChartLegend({ items = [] }) {
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
