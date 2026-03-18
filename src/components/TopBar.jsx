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
  zIndex: theme.zIndex.drawer + 1,
  backgroundColor: theme.palette.background.paper,
  color: theme.palette.text.primary,
  boxShadow: "none",
  borderBottom: `1px solid ${theme.palette.divider}`,
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
}));

const actionButtonSx = (theme) => ({
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: 2,
});

const TopBar = ({ open, handleDrawerOpen, setMode, currentUser }) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const displayName =
    currentUser?.full_name || currentUser?.username || "Workspace user";

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
          <Typography variant="body2" color="text.secondary">
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
              sx={actionButtonSx(theme)}
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
              sx={actionButtonSx(theme)}
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
              border: `1px solid ${theme.palette.divider}`,
              borderRadius: 2,
              cursor: "pointer",
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
              <Typography variant="caption" color="text.secondary">
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
