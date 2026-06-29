// hedha l bar elli fou9: menou l user ynajem y7el sidebar, ybadel theme, w yodkhel lel profile.
import { Avatar, Box, IconButton, Stack, Toolbar, Typography, styled, useTheme } from "@mui/material";
import React from "react";
import MenuIcon from "@mui/icons-material/Menu";
import MuiAppBar from "@mui/material/AppBar";
import Person2OutlinedIcon from "@mui/icons-material/Person2Outlined";
import LightModeOutlinedIcon from "@mui/icons-material/LightModeOutlined";
import DarkModeOutlinedIcon from "@mui/icons-material/DarkModeOutlined";
import { useNavigate } from "react-router-dom";

const drawerWidth = 240;

const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== "open",
  // @ts-ignore
})(({ theme, open }) => ({
  ...(function () {
    const isLight = theme.palette.mode === "light";
    const appBarBg = isLight ? "#ffffff" : "#0f172a";
    const appBarText = isLight ? "#0f172a" : "#f8fafc";
    const appBarBorder = isLight
      ? "1px solid rgba(15, 23, 42, 0.08)"
      : "1px solid rgba(148, 163, 184, 0.18)";

    return {
  zIndex: theme.zIndex.drawer + 1,
  backgroundColor: appBarBg,
  color: appBarText,
  boxShadow: "none",
  borderBottom: appBarBorder,
  transition: theme.transitions.create(["width", "margin"], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  ...(open && {
    marginLeft: drawerWidth,
    width: `calc(100% - ${drawerWidth}px)`,
    transition: theme.transitions.create(["width", "margin"], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  }),
    };
  })(),
}));

// hedhi function sghira t7adher style mta3 les boutons elli fel top bar.
const actionButtonSx = (theme) => {
  const isLight = theme.palette.mode === "light";
  const shellBorder = isLight
    ? "1px solid rgba(15, 23, 42, 0.08)"
    : "1px solid rgba(148, 163, 184, 0.18)";
  const shellText = isLight ? "#0f172a" : "#f8fafc";
  const shellHover = isLight ? "rgba(37, 99, 235, 0.08)" : "rgba(59, 130, 246, 0.16)";

  return ({
  border: shellBorder,
  borderRadius: 2,
  color: shellText,
  "&:hover": {
    backgroundColor: shellHover,
  },
});
};

// hedha component TopBar: houwa l partie elli todhher fou9 fel app.
const TopBar = ({ open, handleDrawerOpen, setMode, currentUser }) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const displayName =
    currentUser?.full_name || currentUser?.username || "Workspace user";
  const isLight = theme.palette.mode === "light";
  const subTextColor = isLight ? "rgba(15, 23, 42, 0.68)" : "rgba(248, 250, 252, 0.72)";
  const profileHoverBg = isLight ? "rgba(37, 99, 235, 0.08)" : "rgba(59, 130, 246, 0.16)";
  const profileBorder = isLight
    ? "1px solid rgba(15, 23, 42, 0.08)"
    : "1px solid rgba(148, 163, 184, 0.18)";

  return (
    <AppBar
      position="fixed"
      // @ts-ignore
      open={open}
    >
      <Toolbar sx={{ minHeight: 72, px: { xs: 2, md: 3 } }}>
        <IconButton
          color="inherit"
          aria-label="open drawer"
          onClick={handleDrawerOpen}
          edge="start"
          sx={{
            ...actionButtonSx(theme),
            mr: 2,
            ...(open && { display: "none" }),
          }}
        >
          <MenuIcon />
        </IconButton>

        <Box>
          <Typography variant="h6" fontWeight={700} lineHeight={1.1}>
            ITSM KPI Dashboard
          </Typography>
          <Typography variant="body2" sx={{ color: subTextColor }}>
            Incidents, requests, changes and KPI tracking
          </Typography>
        </Box>

        <Box flexGrow={1} />

        <Stack direction="row" spacing={1} alignItems="center">
          {theme.palette.mode === "light" ? (
            <IconButton
              onClick={() => {
                localStorage.setItem(
                  "currentMode",
                  theme.palette.mode === "dark" ? "light" : "dark"
                );
                setMode((prevMode) =>
                  prevMode === "light" ? "dark" : "light"
                );
              }}
              color="inherit"
              sx={{
                ...actionButtonSx(theme),
                color: "#d97706",
                "&:hover": {
                  backgroundColor: "#fef3c7",
                },
              }}
            >
              <LightModeOutlinedIcon />
            </IconButton>
          ) : (
            <IconButton
              onClick={() => {
                localStorage.setItem(
                  "currentMode",
                  theme.palette.mode === "dark" ? "light" : "dark"
                );
                setMode((prevMode) =>
                  prevMode === "light" ? "dark" : "light"
                );
              }}
              color="inherit"
              sx={{
                ...actionButtonSx(theme),
                color: "#d97706",
                "&:hover": {
                  backgroundColor: "#fef3c7",
                },
              }}
            >
              <DarkModeOutlinedIcon />
            </IconButton>
          )}

          <Box
            onClick={() => navigate("/profile")}
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              px: 1,
              py: 0.5,
              border: profileBorder,
              borderRadius: 2,
              cursor: "pointer",
              "&:hover": {
                backgroundColor: profileHoverBg,
              },
            }}
          >
            {currentUser?.avatar ? (
              <Avatar
                src={currentUser.avatar}
                alt={displayName}
                sx={{ width: 34, height: 34 }}
              />
            ) : (
              <Avatar sx={{ width: 34, height: 34 }}>
                <Person2OutlinedIcon fontSize="small" />
              </Avatar>
            )}
            <Box sx={{ display: { xs: "none", sm: "block" } }}>
              <Typography variant="body2" fontWeight={700} lineHeight={1.1}>
                {displayName}
              </Typography>
              <Typography variant="caption" sx={{ color: subTextColor }}>
                View profile
              </Typography>
            </Box>
          </Box>
        </Stack>
      </Toolbar>
    </AppBar>
  );
};

export default TopBar;
