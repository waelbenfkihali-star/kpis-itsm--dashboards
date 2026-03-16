import React from "react";
import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useOutletContext } from "react-router-dom";

import Header from "../../components/Header";
import { apiFetchJson } from "../../utils/api";

export default function Profile() {
  const { currentUser, setCurrentUser, reloadCurrentUser } = useOutletContext();
  const [profileForm, setProfileForm] = React.useState({
    username: "",
    first_name: "",
    last_name: "",
    email: "",
    avatar: "",
  });
  const [passwordForm, setPasswordForm] = React.useState({
    current_password: "",
    new_password: "",
    confirm_password: "",
  });
  const [savingProfile, setSavingProfile] = React.useState(false);
  const [savingPassword, setSavingPassword] = React.useState(false);
  const [profileMessage, setProfileMessage] = React.useState({ type: "", text: "" });
  const [passwordMessage, setPasswordMessage] = React.useState({ type: "", text: "" });

  React.useEffect(() => {
    if (!currentUser) return;

    setProfileForm({
      username: currentUser.username || "",
      first_name: currentUser.first_name || "",
      last_name: currentUser.last_name || "",
      email: currentUser.email || "",
      avatar: currentUser.avatar || "",
    });
  }, [currentUser]);

  function updateProfileField(field) {
    return (event) => {
      setProfileForm((prev) => ({
        ...prev,
        [field]: event.target.value,
      }));
    };
  }

  function updatePasswordField(field) {
    return (event) => {
      setPasswordForm((prev) => ({
        ...prev,
        [field]: event.target.value,
      }));
    };
  }

  async function handleAvatarUpload(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    const dataUrl = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result || ""));
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

    setProfileForm((prev) => ({
      ...prev,
      avatar: dataUrl,
    }));

    setCurrentUser?.((prev) =>
      prev
        ? {
            ...prev,
            avatar: dataUrl,
          }
        : prev
    );
  }

  async function saveProfile() {
    setSavingProfile(true);
    setProfileMessage({ type: "", text: "" });

    try {
      const updatedUser = await apiFetchJson("/auth/me/update/", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(profileForm),
      });

      localStorage.setItem("saved_user", updatedUser.username);
      setCurrentUser?.(updatedUser);
      setProfileMessage({ type: "success", text: "Profile updated successfully." });
      await reloadCurrentUser?.();
    } catch (error) {
      setProfileMessage({ type: "error", text: error.message || "Unable to update profile." });
    } finally {
      setSavingProfile(false);
    }
  }

  async function savePassword() {
    if (passwordForm.new_password !== passwordForm.confirm_password) {
      setPasswordMessage({ type: "error", text: "New password and confirmation do not match." });
      return;
    }

    setSavingPassword(true);
    setPasswordMessage({ type: "", text: "" });

    try {
      await apiFetchJson("/auth/me/password/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          current_password: passwordForm.current_password,
          new_password: passwordForm.new_password,
        }),
      });
      setPasswordForm({
        current_password: "",
        new_password: "",
        confirm_password: "",
      });
      setPasswordMessage({ type: "success", text: "Password updated successfully." });
    } catch (error) {
      setPasswordMessage({ type: "error", text: error.message || "Unable to update password." });
    } finally {
      setSavingPassword(false);
    }
  }

  return (
    <Box>
      <Header title="USER PROFILE" subTitle="Manage your account, password, and picture" />

      {!currentUser && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          Loading your profile...
        </Alert>
      )}

      <Grid container spacing={3}>
        <Grid item xs={12} lg={7}>
          <Card sx={{ borderRadius: 4 }}>
            <CardContent>
              <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
                Account Information
              </Typography>

              {profileMessage.text && (
                <Alert severity={profileMessage.type || "info"} sx={{ mb: 2 }}>
                  {profileMessage.text}
                </Alert>
              )}

              <Stack direction={{ xs: "column", md: "row" }} spacing={3} sx={{ mb: 3 }} alignItems={{ xs: "flex-start", md: "center" }}>
                <Avatar
                  src={profileForm.avatar}
                  alt={currentUser?.full_name || currentUser?.username || "Profile"}
                  sx={{ width: 96, height: 96 }}
                />
                <Box>
                  <Button variant="outlined" component="label">
                    Change Picture
                    <input hidden type="file" accept="image/*" onChange={handleAvatarUpload} />
                  </Button>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    Supported: any image file from your device.
                  </Typography>
                </Box>
              </Stack>

              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <TextField fullWidth label="Username" value={profileForm.username} onChange={updateProfileField("username")} />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField fullWidth label="Email" type="email" value={profileForm.email} onChange={updateProfileField("email")} />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField fullWidth label="First Name" value={profileForm.first_name} onChange={updateProfileField("first_name")} />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField fullWidth label="Last Name" value={profileForm.last_name} onChange={updateProfileField("last_name")} />
                </Grid>
              </Grid>

              <Box sx={{ mt: 3, display: "flex", justifyContent: "flex-end" }}>
                <Button variant="contained" onClick={saveProfile} disabled={savingProfile || !currentUser}>
                  {savingProfile ? "Saving..." : "Save Profile"}
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} lg={5}>
          <Card sx={{ borderRadius: 4 }}>
            <CardContent>
              <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
                Change Password
              </Typography>

              {passwordMessage.text && (
                <Alert severity={passwordMessage.type || "info"} sx={{ mb: 2 }}>
                  {passwordMessage.text}
                </Alert>
              )}

              <Stack spacing={2}>
                <TextField
                  fullWidth
                  label="Current Password"
                  type="password"
                  value={passwordForm.current_password}
                  onChange={updatePasswordField("current_password")}
                />
                <TextField
                  fullWidth
                  label="New Password"
                  type="password"
                  helperText="Minimum 8 characters."
                  value={passwordForm.new_password}
                  onChange={updatePasswordField("new_password")}
                />
                <TextField
                  fullWidth
                  label="Confirm New Password"
                  type="password"
                  value={passwordForm.confirm_password}
                  onChange={updatePasswordField("confirm_password")}
                />
              </Stack>

              <Box sx={{ mt: 3, display: "flex", justifyContent: "flex-end" }}>
                <Button variant="contained" color="secondary" onClick={savePassword} disabled={savingPassword || !currentUser}>
                  {savingPassword ? "Updating..." : "Update Password"}
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
