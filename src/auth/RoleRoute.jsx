// hne ProtectedRoute: nthabtou ali   role mta3 l user tasma7lou lpahe hadhy bi d5oul .
import React from "react";
import { Alert, Box } from "@mui/material";
import { Navigate, useOutletContext } from "react-router-dom";
import { getUserAccess } from "./roleUtils";

// hne component t9arrer: nwarri page ken role mnasba, sinon nraj3ou l user route okhra.
export default function RoleRoute({
  allow = ["Admin"],
  redirectTo = "/",
  children,
}) {
  // hne njibou current user w loading state men Outlet context ali jayin min App.jsx.
  const { currentUser, currentUserLoading } = useOutletContext();

  // hne ken infos mta3 user mazelt tetcharga, nestanaw chwaya 9bal access.
  if (currentUserLoading) {
    return (
      <Box sx={{ mt: 2 }}>
        <Alert severity="info">Loading your access...</Alert>
      </Box>
    );
  }

  // hne n5arjou access/role mta3 user .
  const access = getUserAccess(currentUser);

  // hne ken role mouch mawjouda fi liste mta3 allow, man5aliwich user yod5el.
  if (!allow.includes(access)) {
    return <Navigate to={redirectTo} replace />;
  }

  return children;
}
