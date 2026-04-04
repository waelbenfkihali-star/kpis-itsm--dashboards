import React from "react";
import {
  Alert,
  alpha,
  Avatar,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  IconButton,
  LinearProgress,
  Paper,
  Slider,
  Stack,
  TextField,
  Typography,
  useTheme,
} from "@mui/material";
import PhotoCameraOutlinedIcon from "@mui/icons-material/PhotoCameraOutlined";
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";
import SecurityOutlinedIcon from "@mui/icons-material/SecurityOutlined";
import TuneOutlinedIcon from "@mui/icons-material/TuneOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import { useOutletContext } from "react-router-dom";

import Header from "../../components/Header";
import { apiFetchJson } from "../../utils/api";

const AVATAR_PREVIEW_SIZE = 360;
const AVATAR_FRAME_SIZE = 272;
const AVATAR_OUTPUT_SIZE = 512;

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
  canvas.width = AVATAR_OUTPUT_SIZE;
  canvas.height = AVATAR_OUTPUT_SIZE;
  const context = canvas.getContext("2d");

  context.clearRect(0, 0, canvas.width, canvas.height);
  context.save();
  context.beginPath();
  context.arc(
    canvas.width / 2,
    canvas.height / 2,
    canvas.width / 2,
    0,
    Math.PI * 2
  );
  context.closePath();
  context.clip();
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
  context.restore();

  return canvas.toDataURL("image/png");
}

function InfoStat({ title, value, note }) {
  return (
    <Paper sx={{ p: 2.25, flex: 1, minWidth: 180, borderRadius: 4 }}>
      <Typography variant="body2" color="text.secondary">
        {title}
      </Typography>
      <Typography variant="h6" fontWeight={800} sx={{ mt: 0.5 }}>
        {value}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mt: 0.8 }}>
        {note}
      </Typography>
    </Paper>
  );
}

export default function Profile() {
  const theme = useTheme();
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

  const fullName =
    `${profileForm.first_name || ""} ${profileForm.last_name || ""}`.trim() ||
    currentUser?.full_name ||
    currentUser?.username ||
    "Workspace User";
  const initialLetter = fullName.charAt(0).toUpperCase() || "U";
  const sectionBorder = `1px solid ${alpha(theme.palette.divider, 0.9)}`;
  const profileCardBg =
    theme.palette.mode === "dark"
      ? "linear-gradient(145deg, rgba(15,23,42,0.96), rgba(30,41,59,0.92))"
      : "linear-gradient(145deg, #ffffff, #f8fbff)";
  const accentBg =
    theme.palette.mode === "dark"
      ? "linear-gradient(145deg, rgba(8,47,73,0.9), rgba(30,64,175,0.85))"
      : "linear-gradient(145deg, #dbeafe, #eff6ff)";
  const cardShadow =
    theme.palette.mode === "dark"
      ? "0 24px 64px rgba(2, 6, 23, 0.45)"
      : "0 24px 64px rgba(15, 23, 42, 0.08)";

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
        <Grid item xs={12} xl={8}>
          <Paper
            sx={{
              borderRadius: 6,
              overflow: "hidden",
              border: sectionBorder,
              background: profileCardBg,
              boxShadow: cardShadow,
            }}
          >
            <Box
              sx={{
                px: { xs: 2.5, md: 4 },
                py: { xs: 3, md: 4 },
                background: accentBg,
                borderBottom: sectionBorder,
              }}
            >
              <Stack
                direction={{ xs: "column", md: "row" }}
                spacing={3}
                alignItems={{ xs: "flex-start", md: "center" }}
                justifyContent="space-between"
              >
                <Stack direction={{ xs: "column", sm: "row" }} spacing={2.5} alignItems={{ xs: "flex-start", sm: "center" }}>
                  <Box sx={{ position: "relative" }}>
                    <Avatar
                      src={profileForm.avatar}
                      alt={fullName}
                      sx={{
                        width: 118,
                        height: 118,
                        fontSize: 42,
                        fontWeight: 700,
                        border: `4px solid ${alpha(theme.palette.common.white, theme.palette.mode === "dark" ? 0.24 : 0.95)}`,
                        boxShadow: "0 18px 38px rgba(15, 23, 42, 0.18)",
                        bgcolor: theme.palette.primary.main,
                      }}
                    >
                      {initialLetter}
                    </Avatar>
                    <IconButton
                      component="label"
                      sx={{
                        position: "absolute",
                        right: -8,
                        bottom: -8,
                        bgcolor: theme.palette.background.paper,
                        border: sectionBorder,
                        boxShadow: "0 10px 24px rgba(15,23,42,0.14)",
                        "&:hover": { bgcolor: theme.palette.background.paper },
                      }}
                    >
                      <PhotoCameraOutlinedIcon fontSize="small" />
                      <input hidden type="file" accept="image/*" onChange={handleAvatarUpload} />
                    </IconButton>
                  </Box>

                  <Box>
                    <Typography variant="h4" fontWeight={800} sx={{ letterSpacing: "-0.02em" }}>
                      {fullName}
                    </Typography>
                    <Typography variant="body1" color="text.secondary" sx={{ mt: 0.5 }}>
                      @{profileForm.username || "username"}
                    </Typography>
                    <Stack direction="row" spacing={1} sx={{ mt: 1.5, flexWrap: "wrap" }}>
                      <Chip
                        label={currentUser?.access || "User"}
                        color="primary"
                        variant="outlined"
                      />
                      <Chip
                        label={profileForm.email || "No email yet"}
                        sx={{
                          bgcolor: alpha(theme.palette.background.paper, theme.palette.mode === "dark" ? 0.32 : 0.78),
                        }}
                      />
                    </Stack>
                  </Box>
                </Stack>

                <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
                  <Button variant="outlined" startIcon={<EditOutlinedIcon />} component="label">
                    Change Picture
                    <input hidden type="file" accept="image/*" onChange={handleAvatarUpload} />
                  </Button>
                  <Button
                    variant="contained"
                    startIcon={<SaveOutlinedIcon />}
                    onClick={saveProfile}
                    disabled={savingProfile || !currentUser}
                  >
                    {savingProfile ? "Saving..." : "Save Profile"}
                  </Button>
                </Stack>
              </Stack>
            </Box>

            {savingProfile ? <LinearProgress /> : null}

            <Box sx={{ p: { xs: 2.5, md: 4 } }}>
              <Stack direction={{ xs: "column", md: "row" }} spacing={2} sx={{ mb: 3 }}>
                <InfoStat
                  title="Profile Status"
                  value="Ready"
                  note="Your account details are available and editable from one place."
                />
                <InfoStat
                  title="Avatar"
                  value={profileForm.avatar ? "Custom" : "Default"}
                  note="Upload, zoom, and crop your picture before saving it."
                />
                <InfoStat
                  title="Security"
                  value="Managed"
                  note="Password changes stay separate for a cleaner and safer workflow."
                />
              </Stack>

              <Typography variant="h6" fontWeight={700} sx={{ mb: 0.5 }}>
                Account Information
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>
                Keep your personal details accurate so your profile, top bar, and workspace identity stay polished.
              </Typography>

              {profileMessage.text && (
                <Alert severity={profileMessage.type || "info"} sx={{ mb: 2 }}>
                  {profileMessage.text}
                </Alert>
              )}

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

              <Divider sx={{ my: 3 }} />

              <Stack direction={{ xs: "column", md: "row" }} spacing={2} alignItems={{ xs: "flex-start", md: "center" }}>
                <TuneOutlinedIcon color="primary" />
                <Typography variant="body2" color="text.secondary">
                  The avatar editor now saves the exact visible circular area inside the crop frame, so the final picture matches what you position on screen.
                </Typography>
              </Stack>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} xl={4}>
          <Paper
            sx={{
              borderRadius: 6,
              overflow: "hidden",
              border: sectionBorder,
              background: profileCardBg,
              boxShadow: cardShadow,
            }}
          >
            <Box
              sx={{
                px: { xs: 2.5, md: 3 },
                py: 2.5,
                borderBottom: sectionBorder,
                background:
                  theme.palette.mode === "dark"
                    ? "linear-gradient(145deg, rgba(51,65,85,0.78), rgba(15,23,42,0.92))"
                    : "linear-gradient(145deg, #f8fafc, #eef4ff)",
              }}
            >
              <Stack direction="row" spacing={1.5} alignItems="center">
                <SecurityOutlinedIcon color="primary" />
                <Box>
                  <Typography variant="h6" fontWeight={700}>
                    Change Password
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Update your credentials whenever you need to secure your workspace.
                  </Typography>
                </Box>
              </Stack>
            </Box>

            {savingPassword ? <LinearProgress color="secondary" /> : null}

            <Box sx={{ p: { xs: 2.5, md: 3 } }}>
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
            </Box>
          </Paper>
        </Grid>
      </Grid>

      <Dialog
        open={avatarEditor.open}
        onClose={closeAvatarEditor}
        fullScreen
        PaperProps={{
          sx: {
            background: "rgba(10, 15, 25, 0.97)",
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
              Drag and zoom the image until the visible circular frame matches exactly the avatar you want to save.
            </Typography>

            <Stack direction={{ xs: "column", lg: "row" }} spacing={4} alignItems="center">
              <Box
                onPointerDown={startAvatarDrag}
                onPointerMove={moveAvatarDrag}
                onPointerUp={() => setDragState(null)}
                onPointerLeave={() => setDragState(null)}
                sx={{
                  width: AVATAR_PREVIEW_SIZE,
                  height: AVATAR_PREVIEW_SIZE,
                  overflow: "hidden",
                  borderRadius: 8,
                  border: "1px solid rgba(255,255,255,0.1)",
                  position: "relative",
                  cursor: dragState ? "grabbing" : "grab",
                  background:
                    "linear-gradient(145deg, rgba(148,163,184,0.16), rgba(15,23,42,0.34))",
                  touchAction: "none",
                  userSelect: "none",
                  boxShadow: "0 28px 70px rgba(0,0,0,0.4)",
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
                      inset: 0,
                      background: `radial-gradient(circle at center, transparent 0 ${AVATAR_FRAME_SIZE / 2 - 2}px, rgba(5,10,20,0.66) ${AVATAR_FRAME_SIZE / 2}px 100%)`,
                    },
                    "&::after": {
                      content: '""',
                      position: "absolute",
                      top: "50%",
                      left: "50%",
                      width: AVATAR_FRAME_SIZE,
                      height: AVATAR_FRAME_SIZE,
                      transform: "translate(-50%, -50%)",
                      borderRadius: "50%",
                      border: "3px solid rgba(255,255,255,0.96)",
                      boxShadow: "0 0 0 1px rgba(255,255,255,0.15), 0 0 30px rgba(255,255,255,0.16)",
                    },
                  }}
                />
              </Box>

              <Stack spacing={2} sx={{ width: "100%", maxWidth: 520 }}>
                <Paper sx={{ p: 2.5, width: "100%", bgcolor: "rgba(255,255,255,0.04)", color: "#fff", border: "1px solid rgba(255,255,255,0.08)" }}>
                  <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 2 }}>
                    Crop Controls
                  </Typography>

                  <Box sx={{ mb: 2 }}>
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

                  <Box sx={{ mb: 2 }}>
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
                </Paper>

                <Stack direction="row" spacing={2} alignItems="center">
                  <Avatar
                    src={profileForm.avatar}
                    alt="Live avatar"
                    sx={{
                      width: 74,
                      height: 74,
                      border: "2px solid rgba(255,255,255,0.82)",
                      bgcolor: "#1d4ed8",
                    }}
                  >
                    {initialLetter}
                  </Avatar>
                  <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.72)" }}>
                    The final saved avatar follows the exact circular frame shown in the editor.
                  </Typography>
                </Stack>
              </Stack>
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
