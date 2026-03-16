import React from "react";
import { DataGrid } from "@mui/x-data-grid";
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Paper,
  Stack,
  TextField,
  Tooltip,
  Typography,
  useTheme,
} from "@mui/material";
import {
  AdminPanelSettingsOutlined,
  DeleteOutline,
  LockOpenOutlined,
  LockResetOutlined,
  PersonOffOutlined,
  PublishedWithChangesOutlined,
} from "@mui/icons-material";
import { useOutletContext } from "react-router-dom";

import Header from "../../components/Header";
import PageFilters from "../../components/PageFilters";
import { apiFetchJson } from "../../utils/api";

export default function Team() {
  const theme = useTheme();
  const { currentUser, reloadCurrentUser } = useOutletContext();
  const [rows, setRows] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState("");
  const [success, setSuccess] = React.useState("");
  const [filters, setFilters] = React.useState({
    search: "",
    access: [],
    statuses: [],
  });
  const [passwordDialog, setPasswordDialog] = React.useState({ open: false, user: null });
  const [deleteDialog, setDeleteDialog] = React.useState({ open: false, user: null });
  const [newPassword, setNewPassword] = React.useState("");

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

  const accessOptions = React.useMemo(
    () => [...new Set(rows.map((row) => row.access).filter(Boolean))],
    [rows]
  );
  const statusOptions = ["Active", "Disabled"];

  const filteredRows = React.useMemo(() => {
    return rows.filter((row) => {
      if (
        filters.search &&
        !Object.values(row).some((value) =>
          String(value || "").toLowerCase().includes(filters.search.toLowerCase())
        )
      ) {
        return false;
      }

      if (filters.access.length && !filters.access.includes(row.access)) {
        return false;
      }

      const statusLabel = row.is_active ? "Active" : "Disabled";
      if (filters.statuses.length && !filters.statuses.includes(statusLabel)) {
        return false;
      }

      return true;
    });
  }, [rows, filters]);

  const activeFilterCount = React.useMemo(
    () => [filters.search, filters.access.length, filters.statuses.length].filter(Boolean).length,
    [filters]
  );

  function resetFilters() {
    setFilters({
      search: "",
      access: [],
      statuses: [],
    });
  }

  async function updateMember(userId, payload, message) {
    setError("");
    setSuccess("");

    try {
      await apiFetchJson(`/team/${userId}/`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
      setSuccess(message);
      await loadTeam();
      await reloadCurrentUser?.();
    } catch (err) {
      setError(err.message || "Unable to update account.");
    }
  }

  async function resetPassword() {
    if (!passwordDialog.user || !newPassword.trim()) return;

    setError("");
    setSuccess("");

    try {
      await apiFetchJson(`/team/${passwordDialog.user.id}/password/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          new_password: newPassword,
        }),
      });
      setPasswordDialog({ open: false, user: null });
      setNewPassword("");
      setSuccess(`Password reset successfully for ${passwordDialog.user.username}.`);
    } catch (err) {
      setError(err.message || "Unable to reset password.");
    }
  }

  async function deleteMember() {
    if (!deleteDialog.user) return;

    setError("");
    setSuccess("");

    try {
      await apiFetchJson(`/team/${deleteDialog.user.id}/`, {
        method: "DELETE",
      });
      setDeleteDialog({ open: false, user: null });
      setSuccess(`Account ${deleteDialog.user.username} deleted successfully.`);
      await loadTeam();
    } catch (err) {
      setError(err.message || "Unable to delete account.");
    }
  }

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
      minWidth: 140,
    },
    {
      field: "name",
      headerName: "Full Name",
      flex: 1.1,
      minWidth: 170,
    },
    {
      field: "email",
      headerName: "Email",
      flex: 1.1,
      minWidth: 200,
    },
    {
      field: "is_active",
      headerName: "Status",
      width: 120,
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
      renderCell: ({ row: { access } }) => (
        <Box
          sx={{
            p: "5px",
            width: "99px",
            borderRadius: "3px",
            textAlign: "center",
            display: "flex",
            justifyContent: "space-evenly",
            backgroundColor: access === "Admin" ? theme.palette.primary.dark : "#3da58a",
          }}
        >
          {access === "Admin" ? (
            <AdminPanelSettingsOutlined sx={{ color: "#fff" }} fontSize="small" />
          ) : (
            <LockOpenOutlined sx={{ color: "#fff" }} fontSize="small" />
          )}

          <Typography sx={{ fontSize: "13px", color: "#fff" }}>
            {access}
          </Typography>
        </Box>
      ),
    },
    {
      field: "actions",
      headerName: "Actions",
      minWidth: 180,
      sortable: false,
      filterable: false,
      renderCell: ({ row }) => {
        if (!isAdmin) {
          return <Typography variant="body2" color="text.secondary">View only</Typography>;
        }

        const isSelf = row.id === currentUser?.id;

        return (
          <Stack direction="row" spacing={0.5}>
            <Tooltip title={row.is_active ? "Deactivate account" : "Activate account"}>
              <span>
                <IconButton
                  size="small"
                  color={row.is_active ? "warning" : "success"}
                  disabled={isSelf && row.is_active}
                  onClick={() =>
                    updateMember(
                      row.id,
                      { is_active: !row.is_active },
                      `${row.username} is now ${row.is_active ? "disabled" : "active"}.`
                    )
                  }
                >
                  {row.is_active ? <PersonOffOutlined fontSize="small" /> : <PublishedWithChangesOutlined fontSize="small" />}
                </IconButton>
              </span>
            </Tooltip>

            <Tooltip title="Reset password">
              <IconButton
                size="small"
                color="secondary"
                onClick={() => setPasswordDialog({ open: true, user: row })}
              >
                <LockResetOutlined fontSize="small" />
              </IconButton>
            </Tooltip>

            <Tooltip title="Delete account">
              <span>
                <IconButton
                  size="small"
                  color="error"
                  disabled={isSelf}
                  onClick={() => setDeleteDialog({ open: true, user: row })}
                >
                  <DeleteOutline fontSize="small" />
                </IconButton>
              </span>
            </Tooltip>
          </Stack>
        );
      },
    },
  ];

  return (
    <Box>
      <Header title="TEAM" subTitle="Manage application accounts, access, and account status" />

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}

      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2, gap: 2 }}>
        <Chip
          label={`${filteredRows.length} account${filteredRows.length !== 1 ? "s" : ""}`}
          color="primary"
          variant="outlined"
        />
        <Button variant="outlined" onClick={loadTeam} disabled={loading}>
          Refresh
        </Button>
      </Box>

      <PageFilters title="Team Filters" activeCount={activeFilterCount} onReset={resetFilters}>
        <TextField
          size="small"
          label="Global Search"
          value={filters.search}
          onChange={(event) => setFilters((prev) => ({ ...prev, search: event.target.value }))}
          sx={{ width: 240 }}
        />

        <Autocomplete
          multiple
          options={accessOptions}
          value={filters.access}
          onChange={(event, value) => setFilters((prev) => ({ ...prev, access: value }))}
          renderInput={(params) => <TextField {...params} label="Access" size="small" />}
          sx={{ width: 220 }}
        />

        <Autocomplete
          multiple
          options={statusOptions}
          value={filters.statuses}
          onChange={(event, value) => setFilters((prev) => ({ ...prev, statuses: value }))}
          renderInput={(params) => <TextField {...params} label="Status" size="small" />}
          sx={{ width: 220 }}
        />
      </PageFilters>

      <Paper sx={{ height: 620 }}>
        <DataGrid
          rows={filteredRows}
          columns={columns}
          loading={loading}
          disableRowSelectionOnClick
          pageSizeOptions={[10, 25, 50]}
        />
      </Paper>

      {!isAdmin && currentUser && (
        <Alert severity="info" sx={{ mt: 3 }}>
          You can view team access here. Only admins can create, activate, deactivate, reset passwords, or delete accounts.
        </Alert>
      )}

      <Dialog open={passwordDialog.open} onClose={() => setPasswordDialog({ open: false, user: null })}>
        <DialogTitle>Reset Password</DialogTitle>
        <DialogContent>
          <Typography sx={{ mb: 2 }}>
            Set a new password for <strong>{passwordDialog.user?.username}</strong>.
          </Typography>
          <TextField
            autoFocus
            fullWidth
            label="New Password"
            type="password"
            value={newPassword}
            onChange={(event) => setNewPassword(event.target.value)}
            helperText="Minimum 8 characters."
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPasswordDialog({ open: false, user: null })}>Cancel</Button>
          <Button variant="contained" onClick={resetPassword}>Reset Password</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={deleteDialog.open} onClose={() => setDeleteDialog({ open: false, user: null })}>
        <DialogTitle>Delete Account</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete <strong>{deleteDialog.user?.username}</strong>?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog({ open: false, user: null })}>Cancel</Button>
          <Button variant="contained" color="error" onClick={deleteMember}>Delete</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
