import React, { useState } from "react";
import { Paper, Stack, Button, Typography, Collapse, Chip } from "@mui/material";

export default function PageFilters({
  title = "Filters",
  activeCount = 0,
  onReset,
  children,
  defaultOpen = false,
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <Paper sx={{ mb: 2, p: 2 }}>
      <Stack
        direction={{ xs: "column", md: "row" }}
        spacing={1.5}
        justifyContent="space-between"
        alignItems={{ xs: "flex-start", md: "center" }}
      >
        <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
          <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
            {title}
          </Typography>
          <Chip
            label={`${activeCount} active`}
            color={activeCount ? "primary" : "default"}
            size="small"
            variant={activeCount ? "filled" : "outlined"}
          />
        </Stack>

        <Stack direction="row" spacing={1}>
          <Button
            variant={open ? "outlined" : "text"}
            onClick={() => setOpen((prev) => !prev)}
            sx={{ textTransform: "capitalize" }}
          >
            {open ? "Hide Filters" : "Show Filters"}
          </Button>

          <Button
            variant="outlined"
            onClick={onReset}
            sx={{ textTransform: "capitalize" }}
          >
            Reset Filters
          </Button>
        </Stack>
      </Stack>

      <Collapse in={open}>
        <Stack
          direction="row"
          spacing={2}
          sx={{ mt: 2, flexWrap: "wrap", rowGap: 2 }}
        >
          {children}
        </Stack>
      </Collapse>
    </Paper>
  );
}
