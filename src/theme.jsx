export const APP_CHART_COLORS = [
  "#c26d3a",
  "#7a8f46",
  "#a44a3f",
  "#3f7c85",
  "#8b5e83",
  "#d4a239",
  "#5b6c8f",
  "#b86f7a",
];

function buildAppColors(mode) {
  const isLight = mode === "light";

  return {
    layout: {
      appBg: isLight ? "#f6f6f6" : "#0f172a",
      surface: isLight ? "#ffffff" : "#111827",
      shellBg: isLight ? "#ffffff" : "#0f172a",
      shellText: isLight ? "#0f172a" : "#f8fafc",
      shellBorder: isLight
        ? "1px solid rgba(15, 23, 42, 0.08)"
        : "1px solid rgba(148, 163, 184, 0.18)",
      shellHover: isLight ? "rgba(37, 99, 235, 0.08)" : "rgba(59, 130, 246, 0.16)",
      navActive: isLight ? "rgba(37, 99, 235, 0.12)" : "rgba(59, 130, 246, 0.22)",
      navHover: isLight ? "rgba(37, 99, 235, 0.08)" : "rgba(59, 130, 246, 0.16)",
      mutedText: isLight ? "rgba(15, 23, 42, 0.68)" : "rgba(248, 250, 252, 0.72)",
      heading: isLight ? "#2563eb" : "#7dd3fc",
    },
    status: {
      primary: {
        filledBg: "#2563eb",
        filledText: "#ffffff",
        outlinedBg: isLight ? "#eff6ff" : "rgba(37, 99, 235, 0.14)",
        outlinedText: isLight ? "#1d4ed8" : "#93c5fd",
        outlinedBorder: isLight ? "#bfdbfe" : "rgba(147, 197, 253, 0.28)",
      },
      success: {
        filledBg: "#2f855a",
        filledText: "#ffffff",
        outlinedBg: isLight ? "#f0fdf4" : "rgba(34, 197, 94, 0.14)",
        outlinedText: isLight ? "#166534" : "#86efac",
        outlinedBorder: isLight ? "#bbf7d0" : "rgba(134, 239, 172, 0.28)",
      },
      danger: {
        filledBg: "#dc2626",
        filledText: "#ffffff",
        outlinedBg: isLight ? "#fef2f2" : "rgba(220, 38, 38, 0.14)",
        outlinedText: isLight ? "#b91c1c" : "#fca5a5",
        outlinedBorder: isLight ? "#fecaca" : "rgba(252, 165, 165, 0.28)",
      },
      warning: {
        filledBg: "#d97706",
        filledText: "#ffffff",
        outlinedBg: isLight ? "#fff7ed" : "rgba(217, 119, 6, 0.14)",
        outlinedText: isLight ? "#b45309" : "#fdba74",
        outlinedBorder: isLight ? "#fed7aa" : "rgba(253, 186, 116, 0.28)",
      },
      info: {
        filledBg: "#0284c7",
        filledText: "#ffffff",
        outlinedBg: isLight ? "#f0f9ff" : "rgba(2, 132, 199, 0.14)",
        outlinedText: isLight ? "#0369a1" : "#7dd3fc",
        outlinedBorder: isLight ? "#bae6fd" : "rgba(125, 211, 252, 0.28)",
      },
      neutral: {
        filledBg: isLight ? "#64748b" : "#475569",
        filledText: "#ffffff",
        outlinedBg: isLight ? "#f8fafc" : "rgba(148, 163, 184, 0.14)",
        outlinedText: isLight ? "#475569" : "#cbd5e1",
        outlinedBorder: isLight ? "#cbd5e1" : "rgba(203, 213, 225, 0.24)",
      },
    },
    charts: APP_CHART_COLORS,
  };
}

export function getChipSx(theme, tone = "neutral", variant = "filled") {
  const colors = theme.appColors?.status?.[tone] || theme.appColors?.status?.neutral;

  if (!colors) return {};

  if (variant === "outlined") {
    return {
      backgroundColor: colors.outlinedBg,
      color: colors.outlinedText,
      border: `1px solid ${colors.outlinedBorder}`,
    };
  }

  return {
    backgroundColor: colors.filledBg,
    color: colors.filledText,
  };
}

export const getDesignTokens = (mode) => {
  const appColors = buildAppColors(mode);

  return {
    palette: {
      mode,
      primary: {
        main: "#2563eb",
      },
      secondary: {
        main: "#0284c7",
      },
      success: {
        main: "#2f855a",
      },
      error: {
        main: "#dc2626",
      },
      warning: {
        main: "#d97706",
      },
      info: {
        main: "#0284c7",
        light: "#7dd3fc",
      },
      text: {
        primary: mode === "light" ? "#0f172a" : "#f8fafc",
        secondary: mode === "light" ? "#475569" : "#cbd5e1",
      },
      divider: mode === "light" ? "rgba(15, 23, 42, 0.08)" : "rgba(148, 163, 184, 0.18)",
      background: {
        default: appColors.layout.appBg,
        paper: appColors.layout.surface,
      },
    },
    appColors,
  };
};
