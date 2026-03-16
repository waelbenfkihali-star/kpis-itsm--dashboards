import React from "react";
import { DataGrid } from "@mui/x-data-grid";
import { useTheme } from "@mui/material";
import { Alert, Box, Button, Typography } from "@mui/material";
import {
  AdminPanelSettingsOutlined,
  LockOpenOutlined,
} from "@mui/icons-material";
import Header from "../../components/Header";
import { apiFetchJson } from "../../utils/api";
import { useOutletContext } from "react-router-dom";

const Team = () => {
  const theme = useTheme();
  const { currentUser } = useOutletContext();
  const [rows, setRows] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState("");

  const isAdmin = currentUser?.access === "Admin";

  const loadTeam = React.useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const data = await apiFetchJson("/team/");
      setRows(
        data.map((member) => ({
          ...member,
          name: member.full_name || member.username,
        }))
      );
    } catch (err) {
      setError(err.message || "Unable to load team members.");
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadTeam();
  }, [loadTeam]);

  const columns = [
    {
      field: "id",
      headerName: "ID",
      width: 80,
      align: "center",
      headerAlign: "center",
    },
    {
      field: "username",
      headerName: "Username",
      flex: 0.9,
      align: "center",
      headerAlign: "center",
    },
    {
      field: "name",
      headerName: "Full Name",
      flex: 1,
      align: "center",
      headerAlign: "center",
    },
    {
      field: "email",
      headerName: "Email",
      flex: 1,
      align: "center",
      headerAlign: "center",
    },
    {
      field: "is_active",
      headerName: "Status",
      width: 120,
      align: "center",
      headerAlign: "center",
      renderCell: ({ value }) => (
        <Typography
          sx={{
            fontSize: "13px",
            fontWeight: 700,
            color: value ? theme.palette.success.main : theme.palette.error.main,
          }}
        >
          {value ? "Active" : "Disabled"}
        </Typography>
      ),
    },
    {
      field: "access",
      headerName: "Access",
      width: 150,
      align: "center",
      headerAlign: "center",
      renderCell: ({ row: { access } }) => {
        return (
          <Box
            sx={{
              p: "5px",
              width: "99px",
              borderRadius: "3px",
              textAlign: "center",
              display: "flex",
              justifyContent: "space-evenly",

              backgroundColor:
                access === "Admin"
                  ? theme.palette.primary.dark
                  : "#3da58a",
            }}
          >
            {access === "Admin" && (
              <AdminPanelSettingsOutlined
                sx={{ color: "#fff" }}
                fontSize="small"
              />
            )}

            {access === "User" && (
              <LockOpenOutlined sx={{ color: "#fff" }} fontSize="small" />
            )}

            <Typography sx={{ fontSize: "13px", color: "#fff" }}>
              {access}
            </Typography>
          </Box>
        );
      },
    },
  ];

  return (
    <Box>
      <Header title={"TEAM"} subTitle={"Managing the Team Members"} />

      <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 2 }}>
        <Button variant="outlined" onClick={loadTeam} disabled={loading}>
          Refresh
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Box sx={{ height: 600, mx: "auto" }}>
        <DataGrid rows={rows} columns={columns} loading={loading} disableRowSelectionOnClick />
      </Box>

      {!isAdmin && currentUser && (
        <Alert severity="info" sx={{ mt: 3 }}>
          You can view team access here. Only admins can create accounts from Profile Form.
        </Alert>
      )}

      {!currentUser && (
        <Alert severity="warning" sx={{ mt: 3 }}>
          Loading your session permissions...
        </Alert>
      )}
    </Box>
  );
};

export default Team;
