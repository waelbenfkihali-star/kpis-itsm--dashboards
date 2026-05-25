// hne l interface principale mta3 l app ba3d ma l user ya3mel login: tjib infos mta3 current user, taffichi TopBar w SideBar, w tbadel page dakhil l Outlet hasb route.
import * as React from "react";
import { styled } from "@mui/material/styles";
import Box from "@mui/material/Box";

import InsightAssistant from "./components/InsightAssistant";
import TopBar from "./components/TopBar";
import SideBar from "./components/SideBar";
import { Outlet } from "react-router-dom";
import { fetchCurrentUser } from "./utils/api";

// hne component DrawerHeader: mas2oul 3la affichage joz2 men l interface wala page kamla men l app.
const DrawerHeader = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-end",
  padding: theme.spacing(0, 1),
  ...theme.mixins.toolbar,
}));

// hne component App: mas2oul 3la affichage joz2 men l interface wala page kamla men l app.
export default function App({ mode, setMode }) {
  const [open, setOpen] = React.useState(false);
  const [currentUser, setCurrentUser] = React.useState(null);
  const [currentUserLoading, setCurrentUserLoading] = React.useState(true);

  // hne function handleDrawerOpen: tet9ad biha actions mta3 l user kif click, change, open, wala close, w ba3dha tbadel state wala navigation.
  const handleDrawerOpen = () => setOpen(true);
  // hne function handleDrawerClose: tet9ad biha actions mta3 l user kif click, change, open, wala close, w ba3dha tbadel state wala navigation.
  const handleDrawerClose = () => setOpen(false);

  // hne function loadCurrentUser: tchargi data wala context l lazem 9bal ma page taffichi contenu s7i7.
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

  React.useEffect(() => loadCurrentUser(), [loadCurrentUser]);

  return (
    <>
      <Box sx={{ display: "flex" }}>

        <TopBar
          open={open}
          handleDrawerOpen={handleDrawerOpen}
          setMode={setMode}
          currentUser={currentUser}
        />

        <SideBar
          open={open}
          handleDrawerClose={handleDrawerClose}
          currentUser={currentUser}
        />

        <Box component="main" sx={{ flexGrow: 1, p: 3 }}>

          <DrawerHeader />

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
      <InsightAssistant />
    </>
  );
}
