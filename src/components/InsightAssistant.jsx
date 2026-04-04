import React from "react";
import { Box, Button } from "@mui/material";
import ForumOutlinedIcon from "@mui/icons-material/ForumOutlined";
import { useLocation, useNavigate } from "react-router-dom";

export default function InsightAssistant() {
  const navigate = useNavigate();
  const location = useLocation();

  if (location.pathname === "/profile") {
    return null;
  }

  return (
    <Box
      sx={{
        position: "fixed",
        right: 18,
        bottom: 18,
        zIndex: 1400,
      }}
    >
      <Button
        variant="contained"
        size="large"
        startIcon={<ForumOutlinedIcon />}
        onClick={() => navigate("/ai-dashboard")}
        sx={{
          borderRadius: 999,
          px: 2.2,
          py: 1.1,
          boxShadow: 6,
        }}
      >
        AI Dashboards
      </Button>
    </Box>
  );
}
