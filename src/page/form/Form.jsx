import React from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  Divider,
  Grid,
  MenuItem,
  Paper,
  Snackbar,
  Stack,
  TextField,
  Typography,
  alpha,
  useTheme,
} from "@mui/material";
import PersonAddAlt1OutlinedIcon from "@mui/icons-material/PersonAddAlt1Outlined";
import AdminPanelSettingsOutlinedIcon from "@mui/icons-material/AdminPanelSettingsOutlined";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import BadgeOutlinedIcon from "@mui/icons-material/BadgeOutlined";
import AlternateEmailOutlinedIcon from "@mui/icons-material/AlternateEmailOutlined";
import HowToRegOutlinedIcon from "@mui/icons-material/HowToRegOutlined";
import { useForm } from "react-hook-form";
import Header from "../../components/Header";
import { apiFetchJson } from "../../utils/api";
import { useOutletContext } from "react-router-dom";

const regEmail =
  /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

const roleOptions = [
  { value: "Admin", label: "Admin" },
  { value: "User", label: "User" },
];

function InfoCard({ icon, title, text }) {
  return (
    <Paper
      variant="outlined"
      sx={{
        p: 2,
        borderRadius: 4,
        minWidth: 180,
        flex: 1,
      }}
    >
      <Stack direction="row" spacing={1.2} alignItems="center" mb={1}>
        {icon}
        <Typography fontWeight={700}>{title}</Typography>
      </Stack>
      <Typography variant="body2" color="text.secondary">
        {text}
      </Typography>
    </Paper>
  );
}

function SectionTitle({ icon, title, subtitle }) {
  return (
    <Box>
      <Stack direction="row" spacing={1.2} alignItems="center">
        {icon}
        <Typography variant="h6" fontWeight={800}>
          {title}
        </Typography>
      </Stack>
      <Typography variant="body2" color="text.secondary" sx={{ mt: 0.6 }}>
        {subtitle}
      </Typography>
    </Box>
  );
}

const Form = () => {
  const theme = useTheme();
  const { currentUser } = useOutletContext();
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      role: "User",
    },
  });

  const [open, setOpen] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState("");
  const [saving, setSaving] = React.useState(false);

  const isAdmin = currentUser?.access === "Admin";
  const selectedRole = watch("role");

  const heroBackground =
    theme.palette.mode === "dark"
      ? "linear-gradient(145deg, rgba(22,28,36,0.96), rgba(31,41,55,0.94))"
      : "linear-gradient(145deg, #fffaf3, #f4f8ff)";
  const accentBackground =
    theme.palette.mode === "dark"
      ? "linear-gradient(145deg, rgba(133,77,14,0.34), rgba(30,64,175,0.24))"
      : "linear-gradient(145deg, rgba(245,158,11,0.12), rgba(59,130,246,0.10))";

  const handleClose = (_, reason) => {
    if (reason === "clickaway") return;
    setOpen(false);
  };

  const onSubmit = async (values) => {
    setSaving(true);
    setErrorMessage("");

    try {
      await apiFetchJson("/team/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: values.username,
          first_name: values.firstName,
          last_name: values.lastName,
          email: values.email,
          password: values.password,
          access: values.role,
        }),
      });

      reset({
        username: "",
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        role: "User",
      });
      setOpen(true);
    } catch (error) {
      setErrorMessage(error.message || "Unable to create account.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box>
      <Header title="PROFILE FORM" subTitle="Create new application accounts with cleaner access control and onboarding details" />

      <Paper
        sx={{
          p: { xs: 2.5, md: 3.5 },
          borderRadius: 6,
          mb: 3,
          background: heroBackground,
          border: `1px solid ${alpha(theme.palette.divider, 0.8)}`,
          boxShadow:
            theme.palette.mode === "dark"
              ? "0 24px 64px rgba(0,0,0,0.28)"
              : "0 24px 64px rgba(15,23,42,0.08)",
        }}
      >
        <Grid container spacing={2.5} alignItems="stretch">
          <Grid item xs={12} lg={7}>
            <Box
              sx={{
                p: { xs: 2.2, md: 2.8 },
                borderRadius: 5,
                background: accentBackground,
                border: `1px solid ${alpha(theme.palette.divider, 0.6)}`,
                height: "100%",
              }}
            >
              <Stack direction="row" spacing={1.2} alignItems="center" mb={1.2}>
                <PersonAddAlt1OutlinedIcon color="primary" />
                <Typography variant="h5" fontWeight={900}>
                  Account Creation Workspace
                </Typography>
              </Stack>

              <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 680, lineHeight: 1.75 }}>
                This page is dedicated to onboarding new users into the platform. Create a standard user for daily access,
                or grant admin rights when someone needs to manage the team, create accounts, and control workspace access.
              </Typography>

              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mt: 2 }}>
                <Chip label={isAdmin ? "Admin Access Confirmed" : "View Only"} color={isAdmin ? "success" : "warning"} />
                <Chip label={`Selected Role: ${selectedRole || "User"}`} variant="outlined" />
                <Chip label="Minimum password: 8 characters" variant="outlined" />
              </Stack>
            </Box>
          </Grid>

          <Grid item xs={12} lg={5}>
            <Stack spacing={1.5} sx={{ height: "100%" }}>
              <InfoCard
                icon={<AdminPanelSettingsOutlinedIcon color="primary" />}
                title="Admin Accounts"
                text="Admins can create new accounts, manage team access, reset passwords, and control account status."
              />
              <InfoCard
                icon={<HowToRegOutlinedIcon color="success" />}
                title="User Accounts"
                text="Users can sign in, browse dashboards, review records, and work with operational data safely."
              />
            </Stack>
          </Grid>
        </Grid>
      </Paper>

      {!isAdmin && (
        <Alert severity="warning" sx={{ mb: 3, borderRadius: 3 }}>
          Only admins can create new accounts. You can review this form, but submission is disabled for your access level.
        </Alert>
      )}

      {errorMessage && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 3 }}>
          {errorMessage}
        </Alert>
      )}

      <Paper
        component="form"
        onSubmit={handleSubmit(onSubmit)}
        sx={{
          p: { xs: 2.5, md: 3.5 },
          borderRadius: 6,
          border: `1px solid ${alpha(theme.palette.divider, 0.85)}`,
        }}
        aria-disabled={!isAdmin}
        noValidate
        autoComplete="off"
      >
        <Stack spacing={3}>
          <SectionTitle
            icon={<BadgeOutlinedIcon color="primary" />}
            title="Identity Details"
            subtitle="Define the visible identity of the account across the workspace."
          />

          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Username"
                variant="filled"
                disabled={!isAdmin || saving}
                error={Boolean(errors.username)}
                helperText={errors.username ? "Username is required and must contain at least 3 characters." : "Unique sign-in name used for login."}
                {...register("username", { required: true, minLength: 3 })}
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="First Name"
                variant="filled"
                disabled={!isAdmin || saving}
                error={Boolean(errors.firstName)}
                helperText={errors.firstName ? "First name is required and must contain at least 3 characters." : "Displayed in profile and top bar."}
                {...register("firstName", { required: true, minLength: 3 })}
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Last Name"
                variant="filled"
                disabled={!isAdmin || saving}
                error={Boolean(errors.lastName)}
                helperText={errors.lastName ? "Last name is required and must contain at least 3 characters." : "Used for team visibility and profile identity."}
                {...register("lastName", { required: true, minLength: 3 })}
              />
            </Grid>
          </Grid>

          <Divider />

          <SectionTitle
            icon={<AlternateEmailOutlinedIcon color="secondary" />}
            title="Access Contact"
            subtitle="Use a valid email so the account has a clean contact point in the team workspace."
          />

          <Grid container spacing={2}>
            <Grid item xs={12} md={7}>
              <TextField
                fullWidth
                label="Email"
                variant="filled"
                disabled={!isAdmin || saving}
                error={Boolean(errors.email)}
                helperText={errors.email ? "Please provide a valid email address." : "The email is displayed in team management and profile views."}
                {...register("email", { required: true, pattern: regEmail })}
              />
            </Grid>

            <Grid item xs={12} md={5}>
              <TextField
                fullWidth
                variant="filled"
                select
                label="Role"
                disabled={!isAdmin || saving}
                helperText={selectedRole === "Admin" ? "This account will receive administrative access." : "This account will receive standard user access."}
                {...register("role")}
              >
                {roleOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
          </Grid>

          <Divider />

          <SectionTitle
            icon={<LockOutlinedIcon color="warning" />}
            title="Security Setup"
            subtitle="Create a strong initial password so the new account is ready to sign in safely."
          />

          <Grid container spacing={2}>
            <Grid item xs={12} md={8}>
              <TextField
                fullWidth
                label="Password"
                type="password"
                variant="filled"
                disabled={!isAdmin || saving}
                error={Boolean(errors.password)}
                helperText={errors.password ? "Password is required and must contain at least 8 characters." : "Use a strong initial password with at least 8 characters."}
                {...register("password", { required: true, minLength: 8 })}
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <Paper
                variant="outlined"
                sx={{
                  p: 2,
                  height: "100%",
                  borderRadius: 4,
                  bgcolor: alpha(theme.palette.warning.main, theme.palette.mode === "dark" ? 0.12 : 0.06),
                }}
              >
                <Typography variant="subtitle2" fontWeight={800}>
                  Role Preview
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  {selectedRole === "Admin"
                    ? "This new account will appear as an admin across the app."
                    : "This new account will appear as a standard user with operational access."}
                </Typography>
              </Paper>
            </Grid>
          </Grid>

          <Stack
            direction={{ xs: "column", sm: "row" }}
            justifyContent="space-between"
            alignItems={{ xs: "flex-start", sm: "center" }}
            spacing={2}
            sx={{ pt: 1 }}
          >
            <Typography variant="body2" color="text.secondary">
              The account will be created immediately and will become available in the team workspace.
            </Typography>

            <Stack direction="row" spacing={1.2}>
              <Button
                variant="outlined"
                disabled={!isAdmin || saving}
                onClick={() =>
                  reset({
                    username: "",
                    firstName: "",
                    lastName: "",
                    email: "",
                    password: "",
                    role: "User",
                  })
                }
              >
                Reset
              </Button>
              <Button
                type="submit"
                variant="contained"
                disabled={!isAdmin || saving}
                sx={{ minWidth: 190 }}
              >
                {saving ? "Creating..." : "Create New Account"}
              </Button>
            </Stack>
          </Stack>
        </Stack>
      </Paper>

      <Snackbar
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
        open={open}
        autoHideDuration={3000}
        onClose={handleClose}
      >
        <Alert onClose={handleClose} severity="success" sx={{ width: "100%" }}>
          Account created successfully.
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Form;
