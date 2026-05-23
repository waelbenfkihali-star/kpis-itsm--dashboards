// hna App shell ta3 frontend: yjma3 TopBar, SideBar, w pages fl Outlet
import * as React from "react";
import { styled } from "@mui/material/styles";
import Box from "@mui/material/Box";

import InsightAssistant from "./components/InsightAssistant";
import TopBar from "./components/TopBar";
import SideBar from "./components/SideBar";
import { Outlet } from "react-router-dom";
import { fetchCurrentUser } from "./utils/api";

// hna header spacer li ya3mel align ma3 top bar w drawer section
const DrawerHeader = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-end",
  padding: theme.spacing(0, 1),
  ...theme.mixins.toolbar,
}));

export default function App({ mode, setMode }) {
  // hna state ta3 sidebar w current user info
  const [open, setOpen] = React.useState(false);
  const [currentUser, setCurrentUser] = React.useState(null);
  const [currentUserLoading, setCurrentUserLoading] = React.useState(true);

  const handleDrawerOpen = () => setOpen(true);
  const handleDrawerClose = () => setOpen(false);

  // hna function li tjib data current user men backend w tahotha fl state
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

  // hna effect li ycalli loadCurrentUser marra wa7da ida App ybda
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
