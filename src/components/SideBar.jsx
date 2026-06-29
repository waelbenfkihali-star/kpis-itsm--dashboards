// hne menu elli 3al isar: menha l user yitnavigui bin pages mta3 l app w ya3mel logout.
import React from "react";
import List from "@mui/material/List";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import { Avatar, styled, useTheme, Typography, Tooltip } from "@mui/material";
import MuiDrawer from "@mui/material/Drawer";
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import PeopleOutlinedIcon from "@mui/icons-material/PeopleOutlined";
import PersonOutlinedIcon from "@mui/icons-material/PersonOutlined";
import HelpOutlineOutlinedIcon from "@mui/icons-material/HelpOutlineOutlined";
import QueryStatsOutlinedIcon from "@mui/icons-material/QueryStatsOutlined";
import PlaylistAddCircleOutlinedIcon from "@mui/icons-material/PlaylistAddCircleOutlined";
import UploadFileOutlinedIcon from "@mui/icons-material/UploadFileOutlined";
import { useLocation, useNavigate } from "react-router-dom";
import WarningAmberOutlinedIcon from "@mui/icons-material/WarningAmberOutlined";
import AssignmentTurnedInOutlinedIcon from "@mui/icons-material/AssignmentTurnedInOutlined";
import BuildCircleOutlinedIcon from "@mui/icons-material/BuildCircleOutlined";
import LogoutOutlinedIcon from "@mui/icons-material/LogoutOutlined";
import { isAdminUser } from "../auth/roleUtils";
// @ts-ignore
import myPhoto from "../assets/wael.jpg";

const drawerWidth = 240;
// hne function openedMixin: t3awen ba9i l code fil fichier hedha b logic sghira.
const openedMixin = (theme) => ({
  width: drawerWidth,
  transition: theme.transitions.create("width", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.enteringScreen,
  }),
  overflowX: "hidden",
});

// hne function closedMixin: t3awen ba9i l code fil fichier hedha b logic sghira.
const closedMixin = (theme) => ({
  transition: theme.transitions.create("width", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  overflowX: "hidden",
  width: `calc(${theme.spacing(7)} + 1px)`,
  [theme.breakpoints.up("sm")]: {
    width: `calc(${theme.spacing(8)} + 1px)`,
  },
});

const Drawer = styled(MuiDrawer, {
  shouldForwardProp: (prop) => prop !== "open",
  // @ts-ignore
})(({ theme, open }) => {
  const isLight = theme.palette.mode === "light";
  const drawerBg = isLight ? "#ffffff" : "#0f172a";
  const drawerText = isLight ? "#0f172a" : "#f8fafc";
  const drawerBorder = isLight
    ? "1px solid rgba(15, 23, 42, 0.08)"
    : "1px solid rgba(148, 163, 184, 0.18)";

  return {
    width: drawerWidth,
    flexShrink: 0,
    whiteSpace: "nowrap",
    boxSizing: "border-box",
    ...(open && {
      ...openedMixin(theme),
      "& .MuiDrawer-paper": {
        ...openedMixin(theme),
        backgroundColor: drawerBg,
        color: drawerText,
        borderRight: drawerBorder,
      },
    }),
    ...(!open && {
      ...closedMixin(theme),
      "& .MuiDrawer-paper": {
        ...closedMixin(theme),
        backgroundColor: drawerBg,
        color: drawerText,
        borderRight: drawerBorder,
      },
    }),
  };
});

// hne component DrawerHeader: mas2oul 3la affichage joz2 men l interface wala page kamla men l app.
const DrawerHeader = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-end",
  padding: theme.spacing(0, 1),
  ...theme.mixins.toolbar,
}));

const operationsItems = [
  { text: "Dashboard", icon: <HomeOutlinedIcon />, path: "/" },
  {
    text: "Incidents",
    icon: <WarningAmberOutlinedIcon />,
    path: "/incidents",
  },
  {
    text: "Requests",
    icon: <AssignmentTurnedInOutlinedIcon />,
    path: "/Requests",
  },
  {
    text: "Changes",
    icon: <BuildCircleOutlinedIcon />,
    path: "/Changes",
  },
  {
    text: "Import Excel",
    icon: <UploadFileOutlinedIcon />,
    path: "/importexcel",
  },
];

const kpiItems = [
  {
    text: "My KPIs",
    icon: <QueryStatsOutlinedIcon />,
    path: "/mykpis",
  },
  {
    text: "Define KPI",
    icon: <PlaylistAddCircleOutlinedIcon />,
    path: "/kpiform",
  },
];

const adminItems = [
  { text: "Manage Team", icon: <PeopleOutlinedIcon />, path: "/team" },
  { text: "Profile Form", icon: <PersonOutlinedIcon />, path: "/form" },
];

const supportItems = [
  {
    text: "FAQ & Help",
    icon: <HelpOutlineOutlinedIcon />,
    path: "/faq",
  },
];

// hne component SideBar: mas2oul 3la affichage joz2 men l interface wala page kamla men l app.
const SideBar = ({ open, handleDrawerClose, currentUser }) => {
  let location = useLocation();
  const navigate = useNavigate();
  const theme = useTheme();
  const isLight = theme.palette.mode === "light";
  const navTextColor = isLight ? "#0f172a" : "#f8fafc";
  const navActiveBg = isLight ? "rgba(37, 99, 235, 0.12)" : "rgba(59, 130, 246, 0.22)";
  const navHoverBg = isLight ? "rgba(37, 99, 235, 0.08)" : "rgba(59, 130, 246, 0.16)";
  // hne function logout: t3awen ba9i l code fil fichier hedha b logic sghira.
  const logout = () => {
  localStorage.removeItem("access");
  localStorage.removeItem("refresh");
  localStorage.removeItem("saved_user");
  navigate("/login", { replace: true });
};

  const displayName = currentUser?.full_name || currentUser?.username || "Workspace user";
  const displayRole = currentUser?.access || "Authenticated";
  const displayAvatar = currentUser?.avatar || myPhoto;
  const isAdmin = isAdminUser(currentUser);
  const visibleOperationsItems = isAdmin
    ? operationsItems
    : operationsItems.filter((item) => item.path !== "/importexcel");
  const visibleKpiItems = isAdmin
    ? kpiItems
    : kpiItems.filter((item) => item.path === "/mykpis");
  const visibleAdminItems = isAdmin ? adminItems : [];
  
  return (
    <Drawer variant="permanent" open={open}>
      <DrawerHeader>
        <IconButton onClick={handleDrawerClose}>
          {theme.direction === "rtl" ? (
            <ChevronRightIcon />
          ) : (
            <ChevronLeftIcon />
          )}
        </IconButton>
      </DrawerHeader>
      <Divider />
      <Avatar
        sx={{
          mx: "auto",
          width: open ? 88 : 44,
          height: open ? 88 : 44,
          my: 1,
          border: "2px solid grey",
          transition: "0.25s",
        }}
        alt={displayName}
        src={displayAvatar}
      />
      <Typography
        align="center"
        sx={{ fontSize: open ? 17 : 0, transition: "0.25s" }}
      > 
        {displayName}
      </Typography>
      <Typography
        align="center"
        sx={{
          fontSize: open ? 15 : 0,
          transition: "0.25s",
          color: theme.palette.info.main,
        }}
      >
        {displayRole}
      </Typography>

      <Divider />

      <List>
        {visibleOperationsItems.map((item) => (
          <ListItem key={item.path} disablePadding sx={{ display: "block" }}>
            <Tooltip title={open ? null : item.text} placement="left">
              <ListItemButton
                onClick={() => {
                  navigate(item.path);
                }}
                sx={{
                  minHeight: 48,
                  justifyContent: open ? "initial" : "center",
                  px: 2.5,
                  bgcolor:
                    location.pathname === item.path
                      ? navActiveBg
                      : null,
                  color: navTextColor,
                  "&:hover": {
                    bgcolor: navHoverBg,
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 0,
                    mr: open ? 3 : "auto",
                    justifyContent: "center",
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.text}
                  sx={{ opacity: open ? 1 : 0 }}
                />
              </ListItemButton>
            </Tooltip>
          </ListItem>
        ))}
      </List>

      <Divider />

      <List>
        {visibleKpiItems.map((item) => (
          <ListItem key={item.path} disablePadding sx={{ display: "block" }}>
            <Tooltip title={open ? null : item.text} placement="left">
              <ListItemButton
                onClick={() => {
                  navigate(item.path);
                }}
                sx={{
                  minHeight: 48,
                  justifyContent: open ? "initial" : "center",
                  px: 2.5,
                  bgcolor:
                    location.pathname === item.path
                      ? navActiveBg
                      : null,
                  color: navTextColor,
                  "&:hover": {
                    bgcolor: navHoverBg,
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 0,
                    mr: open ? 3 : "auto",
                    justifyContent: "center",
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.text}
                  sx={{ opacity: open ? 1 : 0 }}
                />
              </ListItemButton>
            </Tooltip>
          </ListItem>
        ))}
      </List>

      {visibleAdminItems.length ? (
        <>
          <Divider />

          <List>
            {visibleAdminItems.map((item) => (
              <ListItem key={item.path} disablePadding sx={{ display: "block" }}>
                <Tooltip title={open ? null : item.text} placement="left">
                  <ListItemButton
                    onClick={() => {
                      navigate(item.path);
                    }}
                    sx={{
                      minHeight: 48,
                      justifyContent: open ? "initial" : "center",
                      px: 2.5,
                      bgcolor:
                        location.pathname === item.path
                          ? navActiveBg
                          : null,
                      color: navTextColor,
                      "&:hover": {
                        bgcolor: navHoverBg,
                      },
                    }}
                  >
                    <ListItemIcon
                      sx={{
                        minWidth: 0,
                        mr: open ? 3 : "auto",
                        justifyContent: "center",
                      }}
                    >
                      {item.icon}
                    </ListItemIcon>
                    <ListItemText
                      primary={item.text}
                      sx={{ opacity: open ? 1 : 0 }}
                    />
                  </ListItemButton>
                </Tooltip>
              </ListItem>
            ))}
          </List>

          <Divider />
        </>
      ) : null}

      <List>
        {supportItems.map((item) => (
          <ListItem key={item.path} disablePadding sx={{ display: "block" }}>
            <Tooltip title={open ? null : item.text} placement="left">
              <ListItemButton
                onClick={() => {
                  navigate(item.path);
                }}
                sx={{
                  minHeight: 48,
                  justifyContent: open ? "initial" : "center",
                  px: 2.5,
                  bgcolor:
                    location.pathname === item.path
                      ? navActiveBg
                      : null,
                  color: navTextColor,
                  "&:hover": {
                    bgcolor: navHoverBg,
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 0,
                    mr: open ? 3 : "auto",
                    justifyContent: "center",
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.text}
                  sx={{ opacity: open ? 1 : 0 }}
                />
              </ListItemButton>
            </Tooltip>
          </ListItem>
        ))}
      </List>

      <Divider />

      <List>
        <ListItem disablePadding sx={{ display: "block" }}>
          <Tooltip title={open ? null : "Logout"} placement="left">
            <ListItemButton
              onClick={logout}
              sx={{
                minHeight: 48,
                justifyContent: open ? "initial" : "center",
                px: 2.5,
                color: "#dc2626",
                "&:hover": {
                  backgroundColor: "#fee2e2",
                },
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: 0,
                  mr: open ? 3 : "auto",
                  justifyContent: "center",
                  color: "error.main",
                }}
              >
                <LogoutOutlinedIcon />
              </ListItemIcon>

              <ListItemText
                primary="Logout"
                sx={{ opacity: open ? 1 : 0, color: "error.main" }}
              />
            </ListItemButton>
          </Tooltip>
        </ListItem>
      </List>
    </Drawer>
  );
};

export default SideBar;
