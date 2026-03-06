import React from "react";
import { Box, Typography, useTheme } from "@mui/material";

const services = [
  { name: "Network", incidents: 42, x: 180, y: 180, size: 90 },
  { name: "SAP", incidents: 28, x: 360, y: 150, size: 82 },
  { name: "Email", incidents: 19, x: 540, y: 185, size: 74 },
  { name: "VPN", incidents: 24, x: 715, y: 160, size: 78 },
  { name: "Wi-Fi", incidents: 16, x: 270, y: 330, size: 72 },
  { name: "Active Directory", incidents: 21, x: 455, y: 320, size: 80 },
  { name: "Service Desk", incidents: 31, x: 650, y: 330, size: 86 },
  { name: "ERP", incidents: 18, x: 185, y: 495, size: 72 },
  { name: "Printers", incidents: 14, x: 360, y: 500, size: 66 },
  { name: "Security", incidents: 26, x: 535, y: 485, size: 80 },
  { name: "Database", incidents: 12, x: 710, y: 485, size: 64 },
  { name: "Backup", incidents: 9, x: 850, y: 390, size: 58 },
];

const getHexPoints = (cx, cy, r) => {
  const points = [];
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 180) * (60 * i - 30);
    const x = cx + r * Math.cos(angle);
    const y = cy + r * Math.sin(angle);
    points.push(`${x},${y}`);
  }
  return points.join(" ");
};

const colorByIncidents = (incidents) => {
  if (incidents >= 30) {
    return {
      fill: "url(#gradHigh)",
      glow: "rgba(124, 58, 237, 0.35)",
      badge: "#7c3aed",
    };
  }
  if (incidents >= 20) {
    return {
      fill: "url(#gradMedium)",
      glow: "rgba(37, 99, 235, 0.30)",
      badge: "#2563eb",
    };
  }
  if (incidents >= 15) {
    return {
      fill: "url(#gradNormal)",
      glow: "rgba(16, 185, 129, 0.28)",
      badge: "#10b981",
    };
  }
  return {
    fill: "url(#gradLow)",
    glow: "rgba(249, 115, 22, 0.28)",
    badge: "#f97316",
  };
};

const HexNode = ({ service }) => {
  const theme = useTheme();
  const palette = colorByIncidents(service.incidents);

  return (
    <Box
      sx={{
        position: "absolute",
        left: service.x - service.size,
        top: service.y - service.size,
        width: service.size * 2,
        height: service.size * 2,
        transition: "transform 0.25s ease",
        "&:hover": {
          transform: "translateY(-8px) scale(1.04)",
          zIndex: 4,
        },
      }}
    >
      <svg
        width={service.size * 2}
        height={service.size * 2}
        viewBox={`0 0 ${service.size * 2} ${service.size * 2}`}
        style={{ overflow: "visible" }}
      >
        <defs>
          <filter id={`shadow-${service.name.replace(/\s/g, "")}`} x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow dx="0" dy="12" stdDeviation="12" floodColor={palette.glow} />
          </filter>
        </defs>

        <polygon
          points={getHexPoints(service.size, service.size, service.size - 6)}
          fill={palette.fill}
          stroke="rgba(255,255,255,0.26)"
          strokeWidth="2"
          filter={`url(#shadow-${service.name.replace(/\s/g, "")})`}
        />

        <polygon
          points={getHexPoints(service.size, service.size, service.size - 18)}
          fill="rgba(255,255,255,0.05)"
          stroke="rgba(255,255,255,0.08)"
          strokeWidth="1"
        />
      </svg>

      <Box
        sx={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          textAlign: "center",
          px: 2,
          color: "#fff",
          pointerEvents: "none",
        }}
      >
        <Typography
          sx={{
            fontSize: service.size > 80 ? "0.95rem" : "0.82rem",
            fontWeight: 800,
            lineHeight: 1.1,
            maxWidth: "90%",
            mb: 0.5,
          }}
        >
          {service.name}
        </Typography>

        <Typography
          sx={{
            fontSize: service.size > 80 ? "1.8rem" : "1.45rem",
            fontWeight: 900,
            lineHeight: 1,
          }}
        >
          {service.incidents}
        </Typography>

        <Typography
          sx={{
            fontSize: "0.7rem",
            fontWeight: 700,
            letterSpacing: "0.08em",
            opacity: 0.9,
            mt: 0.4,
          }}
        >
          INCIDENTS
        </Typography>
      </Box>

      <Box
        sx={{
          position: "absolute",
          top: 14,
          right: 18,
          width: 10,
          height: 10,
          borderRadius: "50%",
          background: "#fff",
          boxShadow: `0 0 0 4px ${palette.badge}`,
        }}
      />
    </Box>
  );
};

const Geo = ({ isDashboard = false }) => {
  const theme = useTheme();

  const totalIncidents = services.reduce((sum, s) => sum + s.incidents, 0);
  const topService = [...services].sort((a, b) => b.incidents - a.incidents)[0];

  return (
    <Box
      sx={{
        position: "relative",
        height: isDashboard ? "350px" : "75vh",
        minHeight: "620px",
        borderRadius: "30px",
        overflow: "hidden",
        border: `1px solid ${theme.palette.divider}`,
        background:
          theme.palette.mode === "dark"
            ? "radial-gradient(circle at top left, #172033 0%, #0b1220 45%, #030712 100%)"
            : "radial-gradient(circle at top left, #ffffff 0%, #eff6ff 42%, #dbeafe 100%)",
      }}
    >
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 1000 700"
        preserveAspectRatio="none"
        style={{ position: "absolute", inset: 0, pointerEvents: "none" }}
      >
        <defs>
          <linearGradient id="gradHigh" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#8b5cf6" />
            <stop offset="100%" stopColor="#4f46e5" />
          </linearGradient>
          <linearGradient id="gradMedium" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3b82f6" />
            <stop offset="100%" stopColor="#06b6d4" />
          </linearGradient>
          <linearGradient id="gradNormal" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#14b8a6" />
            <stop offset="100%" stopColor="#22c55e" />
          </linearGradient>
          <linearGradient id="gradLow" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f59e0b" />
            <stop offset="100%" stopColor="#f97316" />
          </linearGradient>
        </defs>
      </svg>

      <Box
        sx={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "linear-gradient(rgba(148,163,184,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(148,163,184,0.08) 1px, transparent 1px)",
          backgroundSize: "34px 34px",
          pointerEvents: "none",
        }}
      />

      <Box
        sx={{
          position: "absolute",
          top: 18,
          left: 18,
          right: 18,
          zIndex: 5,
          display: "flex",
          justifyContent: "space-between",
          gap: 2,
          flexWrap: "wrap",
        }}
      >
        <Box
          sx={{
            px: 2.2,
            py: 1.4,
            borderRadius: "18px",
            backdropFilter: "blur(10px)",
            background:
              theme.palette.mode === "dark"
                ? "rgba(15, 23, 42, 0.55)"
                : "rgba(255,255,255,0.72)",
            border: `1px solid ${theme.palette.divider}`,
            boxShadow: "0 10px 30px rgba(15,23,42,0.08)",
          }}
        >
          <Typography sx={{ fontSize: "0.75rem", fontWeight: 700, opacity: 0.8 }}>
            TOTAL INCIDENTS
          </Typography>
          <Typography sx={{ fontSize: "1.7rem", fontWeight: 900 }}>
            {totalIncidents}
          </Typography>
        </Box>

        <Box
          sx={{
            px: 2.2,
            py: 1.4,
            borderRadius: "18px",
            backdropFilter: "blur(10px)",
            background:
              theme.palette.mode === "dark"
                ? "rgba(15, 23, 42, 0.55)"
                : "rgba(255,255,255,0.72)",
            border: `1px solid ${theme.palette.divider}`,
            boxShadow: "0 10px 30px rgba(15,23,42,0.08)",
          }}
        >
          <Typography sx={{ fontSize: "0.75rem", fontWeight: 700, opacity: 0.8 }}>
            TOP SERVICE
          </Typography>
          <Typography sx={{ fontSize: "1.2rem", fontWeight: 900 }}>
            {topService.name}
          </Typography>
        </Box>
      </Box>

      {services.map((service) => (
        <HexNode key={service.name} service={service} />
      ))}

      <Box
        sx={{
          position: "absolute",
          bottom: 16,
          left: 16,
          display: "flex",
          gap: 1,
          flexWrap: "wrap",
          zIndex: 5,
        }}
      >
        {[
          { label: "High", color: "linear-gradient(135deg, #8b5cf6 0%, #4f46e5 100%)" },
          { label: "Medium", color: "linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%)" },
          { label: "Normal", color: "linear-gradient(135deg, #14b8a6 0%, #22c55e 100%)" },
          { label: "Low", color: "linear-gradient(135deg, #f59e0b 0%, #f97316 100%)" },
        ].map((item) => (
          <Box
            key={item.label}
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              px: 1.2,
              py: 0.8,
              borderRadius: "999px",
              background:
                theme.palette.mode === "dark"
                  ? "rgba(15, 23, 42, 0.45)"
                  : "rgba(255,255,255,0.75)",
              border: `1px solid ${theme.palette.divider}`,
            }}
          >
            <Box
              sx={{
                width: 14,
                height: 14,
                borderRadius: "50%",
                background: item.color,
              }}
            />
            <Typography sx={{ fontSize: "0.78rem", fontWeight: 700 }}>
              {item.label}
            </Typography>
          </Box>
        ))}
      </Box>
    </Box>
  );
};

export default Geo;