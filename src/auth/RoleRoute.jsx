// hne route guard hasb role: yet2aked elli l user 3andou access mnasba 9bal ma y7ell page mo3ayna.
import React from "react";
import { Alert, Box } from "@mui/material";
import { Navigate, useOutletContext } from "react-router-dom";
import { getUserAccess } from "./roleUtils";

// hne component RoleRoute: mas2oul 3la affichage joz2 men l interface wala page kamla men l app.
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
