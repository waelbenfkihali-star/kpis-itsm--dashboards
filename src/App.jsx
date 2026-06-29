// hne l interface principale mta3 l app ba3d login: tjib infos mta3 current user, taffichi TopBar w SideBar, w tbadal page dakhil Outlet حسب route.
import * as React from "react";
import { styled } from "@mui/material/styles";
import Box from "@mui/material/Box";

import InsightAssistant from "./components/InsightAssistant";
import TopBar from "./components/TopBar";
import SideBar from "./components/SideBar";
import { Outlet } from "react-router-dom";
import { fetchCurrentUser } from "./utils/api";

// hne spacer sghir bech contenu mta3 page mayjich ta7t TopBar.
const DrawerHeader = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-end",
  padding: theme.spacing(0, 1),
  ...theme.mixins.toolbar,
}));

// hne App component: ylam layout lkol ba3d login w y3addi current user lel pages dakhlin.
export default function App({ mode, setMode }) {
  // hne net7akmou ken sidebar ma7loula walla msakkra.
  const [open, setOpen] = React.useState(false);

  // hne n5aznou infos mta3 l user connecté.
  const [currentUser, setCurrentUser] = React.useState(null);

  // hne n3arfou ken infos mta3 l user mazelt tetcharga walla .
  const [currentUserLoading, setCurrentUserLoading] = React.useState(true);

  // hne n7ellou sidebar ki l user yclicki 3al menu.
  const handleDrawerOpen = () => setOpen(true);

  const handleDrawerClose = () => setOpen(false);

  // hne njibou infos mta3 current user men backend w n7otouhom fi state.
  const loadCurrentUser = React.useCallback(() => {
    let active = true;
    setCurrentUserLoading(true);

    fetchCurrentUser()
      .then((user) => {
        if (active) {
          setCurrentUser(user);
        }
      })
      .catch(() => {
        if (active) {
          setCurrentUser(null);
        }
      })
      .finally(() => {
        if (active) {
          setCurrentUserLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, []);

  // hne ki App tet7al awel mara, nchargiw infos mta3 current user automatiquement.
  React.useEffect(() => loadCurrentUser(), [loadCurrentUser]);

  return (
    <>
      {/* hne layout principal: sidebar w contenu yjiw fi flex. */}
      <Box sx={{ display: "flex" }}>

        {/* hne TopBar: fih bouton mta3 sidebar, theme switch, w infos mta3 user. */}
        <TopBar
          open={open}
          handleDrawerOpen={handleDrawerOpen}
          setMode={setMode}
          currentUser={currentUser}
        />

        {/* hne SideBar: menu 3al isar lel navigation bin pages. */}
        <SideBar
          open={open}
          handleDrawerClose={handleDrawerClose}
          currentUser={currentUser}
        />

        {/* hne zone principale win pages tetbadel 7aseb route. */}
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: 3,
            backgroundColor: mode === "light" ? "#f6f6f6" : "#0b1220",
            minHeight: "100vh",
          }}
        >

          {/* hne espace ykhalli contenu aligned m3a TopBar. */}
          <DrawerHeader />

          {/* hne Outlet taffichi page actuelle w t3addi context mta3 user lel pages dakhlin. */}
          <Outlet
            context={{
              currentUser,
              currentUserLoading,
              setCurrentUser,
              reloadCurrentUser: loadCurrentUser,
            }}
          />

        </Box>

      </Box>

      {/* hne AI assistant button yodhher fou9 pages bech l user yousel lel assistant rapidement. */}
      <InsightAssistant />
    </>
  );
}
