import React from "react";
import { Box, Paper, Stack, Typography } from "@mui/material";
import InsightsOutlinedIcon from "@mui/icons-material/InsightsOutlined";
import WarningAmberOutlinedIcon from "@mui/icons-material/WarningAmberOutlined";
import TaskAltOutlinedIcon from "@mui/icons-material/TaskAltOutlined";

const sectionMeta = {
  highlights: {
    title: "What Happened",
    icon: <InsightsOutlinedIcon color="primary" fontSize="small" />,
  },
  risks: {
    title: "Watchouts",
    icon: <WarningAmberOutlinedIcon color="warning" fontSize="small" />,
  },
  actions: {
    title: "Recommended Actions",
    icon: <TaskAltOutlinedIcon color="success" fontSize="small" />,
  },
};

export default function ExecutiveSummary({ sections = {} }) {
  const ordered = ["highlights", "risks", "actions"]
    .map((key) => ({
      key,
      items: Array.isArray(sections[key]) ? sections[key].filter(Boolean) : [],
      ...sectionMeta[key],
    }))
    .filter((section) => section.items.length);

  if (!ordered.length) return null;

  return (
    <Paper
      className="pdf-avoid-break"
      sx={{
        p: 2.2,
        mb: 2,
        borderRadius: 3,
      }}
    >
      <Typography variant="h6" fontWeight={800} mb={1.5}>
        Executive Summary
      </Typography>
      <Stack direction={{ xs: "column", xl: "row" }} spacing={2}>
        {ordered.map((section) => (
          <Box key={section.key} sx={{ flex: 1, minWidth: 0 }}>
            <Stack direction="row" spacing={0.8} alignItems="center" mb={0.8}>
              {section.icon}
              <Typography variant="subtitle2" fontWeight={700}>
                {section.title}
              </Typography>
            </Stack>
            <Stack component="ul" spacing={0.8} sx={{ pl: 2.2, my: 0 }}>
              {section.items.map((item) => (
                <Typography component="li" key={item} variant="body2" sx={{ lineHeight: 1.5 }}>
                  {item}
                </Typography>
              ))}
            </Stack>
          </Box>
        ))}
      </Stack>
    </Paper>
  );
}
