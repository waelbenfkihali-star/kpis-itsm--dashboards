// hne zerr AI elli yodhher fou9 pages bech y7ell assistant dashboard builder.
import React from "react";
import { Box, Button } from "@mui/material";
import ForumOutlinedIcon from "@mui/icons-material/ForumOutlined";
import { useLocation, useNavigate } from "react-router-dom";

// hne component InsightAssistant: mas2oul 3la affichage joz2 men l interface wala page kamla men l app.
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
