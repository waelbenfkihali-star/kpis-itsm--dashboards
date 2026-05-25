// hne header mta3 print/export bech report yodhher mnadhem.
import React from "react";
import { Box, Paper, Stack, Typography } from "@mui/material";

// hne function formatPrintDate: t3awen ba9i l code fil fichier hedha b logic sghira.
function formatPrintDate(value) {
  return new Intl.DateTimeFormat("en-GB", {
    dateStyle: "long",
    timeStyle: "short",
  }).format(value);
}

// hne component PrintReportHeader: mas2oul 3la affichage joz2 men l interface wala page kamla men l app.
export default function PrintReportHeader({
  reportTitle,
  reportSubtitle,
  scopeLabel,
  generatedAt = new Date(),
}) {
  return (
    <Paper
      className="print-report-header"
      sx={{
        p: 2.2,
        mb: 2,
        borderRadius: 3,
        border: (theme) => `1px solid ${theme.palette.divider}`,
      }}
    >
      <Stack
        direction={{ xs: "column", md: "row" }}
        justifyContent="space-between"
        spacing={2}
      >
        <Box>
          <Typography variant="overline" color="text.secondary" sx={{ letterSpacing: 1.2 }}>
            Report Summary
          </Typography>
          <Typography variant="h6" fontWeight={800} className="print-report-title">
            {reportTitle}
          </Typography>
          <Typography variant="body2" color="text.secondary" className="print-report-subtitle">
            {reportSubtitle}
          </Typography>
        </Box>

        <Box sx={{ minWidth: { md: 260 } }}>
          <Typography variant="body2" color="text.secondary">
            Scope
          </Typography>
          <Typography variant="body1" fontWeight={700} sx={{ mb: 1 }}>
            {scopeLabel}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Generated on
          </Typography>
          <Typography variant="body1" fontWeight={700}>
            {formatPrintDate(generatedAt)}
          </Typography>
        </Box>
      </Stack>
    </Paper>
  );
}
