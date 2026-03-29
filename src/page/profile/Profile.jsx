import React from "react";
import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  Slider,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useOutletContext } from "react-router-dom";

import Header from "../../components/Header";
import { apiFetchJson } from "../../utils/api";

const AVATAR_PREVIEW_SIZE = 320;

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function getImageBounds(imageSize, zoom) {
  const baseScale = Math.max(
    AVATAR_PREVIEW_SIZE / imageSize.width,
    AVATAR_PREVIEW_SIZE / imageSize.height
  );
  const scale = baseScale * zoom;
  const scaledWidth = imageSize.width * scale;
  const scaledHeight = imageSize.height * scale;

  return {
    scale,
    maxOffsetX: Math.max(0, (scaledWidth - AVATAR_PREVIEW_SIZE) / 2),
    maxOffsetY: Math.max(0, (scaledHeight - AVATAR_PREVIEW_SIZE) / 2),
  };
}

async function cropAvatarImage(src, cropState) {
  const image = await new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });

  const { scale } = getImageBounds(
    { width: image.naturalWidth, height: image.naturalHeight },
    cropState.zoom
  );

  const sourceSize = AVATAR_PREVIEW_SIZE / scale;
  const sourceX = clamp(
    (image.naturalWidth - sourceSize) / 2 - cropState.offsetX / scale,
    0,
    image.naturalWidth - sourceSize
  );
  const sourceY = clamp(
    (image.naturalHeight - sourceSize) / 2 - cropState.offsetY / scale,
    0,
    image.naturalHeight - sourceSize
  );

  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 512;
  const context = canvas.getContext("2d");

  context.drawImage(
    image,
    sourceX,
    sourceY,
    sourceSize,
    sourceSize,
    0,
    0,
    canvas.width,
    canvas.height
  );

  return canvas.toDataURL("image/png");
}

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
  const [avatarEditor, setAvatarEditor] = React.useState({
    open: false,
    src: "",
    zoom: 1,
    offsetX: 0,
    offsetY: 0,
    imageSize: { width: 1, height: 1 },
  });
  const [dragState, setDragState] = React.useState(null);
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

  const avatarBounds = React.useMemo(
    () => getImageBounds(avatarEditor.imageSize, avatarEditor.zoom),
    [avatarEditor.imageSize, avatarEditor.zoom]
  );

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

  function updateAvatarEditor(patch) {
    setAvatarEditor((prev) => {
      const next = { ...prev, ...patch };
      const bounds = getImageBounds(next.imageSize, next.zoom);

      return {
        ...next,
        offsetX: clamp(next.offsetX, -bounds.maxOffsetX, bounds.maxOffsetX),
        offsetY: clamp(next.offsetY, -bounds.maxOffsetY, bounds.maxOffsetY),
      };
    });
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

    const imageSize = await new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () =>
        resolve({ width: img.naturalWidth || 1, height: img.naturalHeight || 1 });
      img.onerror = reject;
      img.src = dataUrl;
    });

    setAvatarEditor({
      open: true,
      src: dataUrl,
      zoom: 1,
      offsetX: 0,
      offsetY: 0,
      imageSize,
    });

    event.target.value = "";
  }

  function closeAvatarEditor() {
    setAvatarEditor((prev) => ({ ...prev, open: false }));
    setDragState(null);
  }

  function startAvatarDrag(event) {
    event.preventDefault();
    setDragState({
      startX: event.clientX,
      startY: event.clientY,
      originX: avatarEditor.offsetX,
      originY: avatarEditor.offsetY,
    });
  }

  function moveAvatarDrag(event) {
    if (!dragState) return;

    updateAvatarEditor({
      offsetX: dragState.originX + (event.clientX - dragState.startX),
      offsetY: dragState.originY + (event.clientY - dragState.startY),
    });
  }

  async function applyAvatarCrop() {
    const croppedAvatar = await cropAvatarImage(avatarEditor.src, avatarEditor);

    setProfileForm((prev) => ({
      ...prev,
      avatar: croppedAvatar,
    }));

    setCurrentUser?.((prev) =>
      prev
        ? {
            ...prev,
            avatar: croppedAvatar,
          }
        : prev
    );

    closeAvatarEditor();
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
                    After choosing the image, you can move and zoom it before saving.
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

      <Dialog
        open={avatarEditor.open}
        onClose={closeAvatarEditor}
        fullScreen
        PaperProps={{
          sx: {
            background: "rgba(10, 15, 25, 0.96)",
            color: "#fff",
          },
        }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          Position Your Profile Picture
        </DialogTitle>
        <DialogContent>
          <Stack spacing={3} alignItems="center" sx={{ pt: 1 }}>
            <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.72)" }}>
              Drag the image to choose the exact area you want to appear in the avatar.
            </Typography>

            <Box
              onPointerDown={startAvatarDrag}
              onPointerMove={moveAvatarDrag}
              onPointerUp={() => setDragState(null)}
              onPointerLeave={() => setDragState(null)}
              sx={{
                width: AVATAR_PREVIEW_SIZE,
                height: AVATAR_PREVIEW_SIZE,
                overflow: "hidden",
                borderRadius: "50%",
                border: "4px solid rgba(255,255,255,0.92)",
                position: "relative",
                cursor: dragState ? "grabbing" : "grab",
                background:
                  "radial-gradient(circle at 30% 30%, rgba(255,255,255,0.2), rgba(255,255,255,0.04))",
                touchAction: "none",
                userSelect: "none",
              }}
            >
              {avatarEditor.src ? (
                <Box
                  component="img"
                  src={avatarEditor.src}
                  alt="Avatar crop preview"
                  draggable={false}
                  sx={{
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    width: avatarEditor.imageSize.width,
                    height: avatarEditor.imageSize.height,
                    transform: `translate(calc(-50% + ${avatarEditor.offsetX}px), calc(-50% + ${avatarEditor.offsetY}px)) scale(${avatarBounds.scale})`,
                    transformOrigin: "center center",
                    pointerEvents: "none",
                  }}
                />
              ) : null}

              <Box
                sx={{
                  position: "absolute",
                  inset: 0,
                  pointerEvents: "none",
                  "&::before": {
                    content: '""',
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    width: 34,
                    height: 34,
                    transform: "translate(-50%, -50%)",
                    borderRadius: "50%",
                    border: "2px solid rgba(255,255,255,0.95)",
                    boxShadow: "0 0 0 999px rgba(0,0,0,0.12)",
                  },
                  "&::after": {
                    content: '""',
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    width: 12,
                    height: 12,
                    transform: "translate(-50%, -50%)",
                    borderRadius: "50%",
                    backgroundColor: "rgba(255,255,255,0.98)",
                    boxShadow: "0 0 12px rgba(255,255,255,0.55)",
                  },
                }}
              />
            </Box>

            <Stack spacing={2} sx={{ width: "100%", maxWidth: 520 }}>
              <Box>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  Zoom
                </Typography>
                <Slider
                  min={1}
                  max={3}
                  step={0.05}
                  value={avatarEditor.zoom}
                  onChange={(_, value) => updateAvatarEditor({ zoom: value })}
                />
              </Box>

              <Box>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  Move Left / Right
                </Typography>
                <Slider
                  min={-avatarBounds.maxOffsetX}
                  max={avatarBounds.maxOffsetX}
                  step={1}
                  value={avatarEditor.offsetX}
                  onChange={(_, value) => updateAvatarEditor({ offsetX: value })}
                />
              </Box>

              <Box>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  Move Up / Down
                </Typography>
                <Slider
                  min={-avatarBounds.maxOffsetY}
                  max={avatarBounds.maxOffsetY}
                  step={1}
                  value={avatarEditor.offsetY}
                  onChange={(_, value) => updateAvatarEditor({ offsetY: value })}
                />
              </Box>
            </Stack>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button variant="outlined" color="inherit" onClick={closeAvatarEditor}>
            Cancel
          </Button>
          <Button variant="contained" onClick={applyAvatarCrop}>
            Use This Picture
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
