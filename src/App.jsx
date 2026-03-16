import * as React from "react";
import { styled } from "@mui/material/styles";
import Box from "@mui/material/Box";

import TopBar from "./components/TopBar";
import SideBar from "./components/SideBar";
import { Outlet } from "react-router-dom";
import { fetchCurrentUser } from "./utils/api";

const DrawerHeader = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-end",
  padding: theme.spacing(0, 1),
  ...theme.mixins.toolbar,
}));

export default function App({ mode, setMode }) {
  const [open, setOpen] = React.useState(false);
  const [currentUser, setCurrentUser] = React.useState(null);

  const handleDrawerOpen = () => setOpen(true);
  const handleDrawerClose = () => setOpen(false);

  React.useEffect(() => {
    let active = true;

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
      });

    return () => {
      active = false;
    };
  }, []);

  return (

      <Box sx={{ display: "flex" }}>

        <TopBar
          open={open}
          handleDrawerOpen={handleDrawerOpen}
          setMode={setMode}
        />

        <SideBar
          open={open}
          handleDrawerClose={handleDrawerClose}
          currentUser={currentUser}
        />

        <Box component="main" sx={{ flexGrow: 1, p: 3 }}>

          <DrawerHeader />

          <Outlet context={{ currentUser }} />

        </Box>

      </Box>
  );
}
