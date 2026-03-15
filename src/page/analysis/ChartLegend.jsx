import React from "react";
import { Box, Stack, Typography } from "@mui/material";

export default function ChartLegend({ items = [] }) {
  if (!items.length) return null;

  return (
    <Stack
      direction="row"
      useFlexGap
      flexWrap="wrap"
      spacing={1.5}
      sx={{ mt: 1.5, rowGap: 1 }}
    >
      {items.map((item) => (
        <Stack
          key={item.label}
          direction="row"
          spacing={0.8}
          alignItems="center"
          sx={{ minWidth: 0, maxWidth: "100%" }}
        >
          <Box
            sx={{
              width: 12,
              height: 12,
              borderRadius: "999px",
              flexShrink: 0,
              backgroundColor: item.color,
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
