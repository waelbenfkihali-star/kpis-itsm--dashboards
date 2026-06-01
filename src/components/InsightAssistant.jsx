// hne bouton floating mta3 AI Dashboards: yodher fou9 pages w ki l user yenzel 3lih yemchi lel page mta3 ai-dashboard.
import React from "react";
import { Box, Button } from "@mui/material";
import ForumOutlinedIcon from "@mui/icons-material/ForumOutlined";
import { useLocation, useNavigate } from "react-router-dom";

// hne InsightAssistant component: yaffichi bouton AI Dashboards fi coin louta 3al imin, ama maywarrihouch fel profile page.
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