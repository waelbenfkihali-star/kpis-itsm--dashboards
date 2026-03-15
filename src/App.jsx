import * as React from "react";
import { styled } from "@mui/material/styles";
import Box from "@mui/material/Box";

import TopBar from "./components/TopBar";
import SideBar from "./components/SideBar";
import { Outlet } from "react-router-dom";

const DrawerHeader = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-end",
  padding: theme.spacing(0, 1),
  ...theme.mixins.toolbar,
}));

export default function App({ mode, setMode }) {

  const [open, setOpen] = React.useState(false);

  const handleDrawerOpen = () => setOpen(true);
  const handleDrawerClose = () => setOpen(false);

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
        />

        <Box component="main" sx={{ flexGrow: 1, p: 3 }}>

          <DrawerHeader />

          <Outlet />

        </Box>

      </Box>
  );
}
