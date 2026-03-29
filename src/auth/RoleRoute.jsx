import React from "react";
import { Alert, Box } from "@mui/material";
import { Navigate, useOutletContext } from "react-router-dom";
import { getUserAccess } from "./roleUtils";

export default function RoleRoute({
  allow = ["Admin"],
  redirectTo = "/",
  children,
}) {
  const { currentUser, currentUserLoading } = useOutletContext();

  if (currentUserLoading) {
    return (
      <Box sx={{ mt: 2 }}>
        <Alert severity="info">Loading your access...</Alert>
      </Box>
    );
  }

  const access = getUserAccess(currentUser);

  if (!allow.includes(access)) {
    return <Navigate to={redirectTo} replace />;
  }

  return children;
}
