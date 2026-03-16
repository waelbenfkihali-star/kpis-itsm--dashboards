import React from "react";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import { Alert, Button, MenuItem, Snackbar, Stack } from "@mui/material";
import { useForm } from "react-hook-form";
import Header from "../../components/Header";
import { apiFetchJson } from "../../utils/api";
import { useOutletContext } from "react-router-dom";

const regEmail =
  /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

const data = [
  {
    value: "Admin",
    label: "Admin",
  },
  {
    value: "User",
    label: "User",
  },
];

const Form = () => {
  const { currentUser } = useOutletContext();
  const {
    register,
    handleSubmit,
    reset,
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

  const handleClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }

    setOpen(false);
  };

  const handleClick = () => {
    setOpen(true);
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
      handleClick();
    } catch (error) {
      setErrorMessage(error.message || "Unable to create account.");
    } finally {
      setSaving(false);
    }
  };

  return (
<Box>
      <Header title="PROFILE FORM" subTitle="Create a New User or Admin Account" />

      {!isAdmin && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          Only admins can create new accounts.
        </Alert>
      )}

      {errorMessage && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {errorMessage}
        </Alert>
      )}

      <Box
        onSubmit={handleSubmit(onSubmit)}
        component="form"
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: 3,
        }}
        aria-disabled={!isAdmin}
        noValidate
        autoComplete="off"
      >
        <Stack sx={{ gap: 2 }} direction={"row"}>
          <TextField
            error={Boolean(errors.username)}
            helperText={
              Boolean(errors.username)
                ? "Username is required and must be at least 3 characters"
                : null
            }
            {...register("username", { required: true, minLength: 3 })}
            sx={{ flex: 1 }}
            label="Username"
            variant="filled"
            disabled={!isAdmin || saving}
          />

          <TextField
            error={Boolean(errors.firstName)}
            helperText={
              Boolean(errors.firstName)
                ? "This field is required & min 3 character"
                : null
            }
            {...register("firstName", { required: true, minLength: 3 })}
            sx={{ flex: 1 }}
            label="First Name"
            variant="filled"
            disabled={!isAdmin || saving}
          />

          <TextField
            error={Boolean(errors.lastName)}
            helperText={
              Boolean(errors.lastName)
                ? "This field is required & min 3 character"
                : null
            }
            {...register("lastName", { required: true, minLength: 3 })}
            sx={{ flex: 1 }}
            label="Last Name"
            variant="filled"
            disabled={!isAdmin || saving}
          />
        </Stack>

        <TextField
          error={Boolean(errors.email)}
          helperText={
            Boolean(errors.email) ? "Please provide a valid email address" : null
          }
          {...register("email", { required: true, pattern: regEmail })}
          label="Email"
          variant="filled"
          disabled={!isAdmin || saving}
        />

        <TextField
          error={Boolean(errors.password)}
          helperText={
            Boolean(errors.password)
              ? "Password is required and must contain at least 8 characters"
              : null
          }
          {...register("password", { required: true, minLength: 8 })}
          label="Password"
          type="password"
          variant="filled"
          disabled={!isAdmin || saving}
        />

        <TextField
          variant="filled"
          select
          label="Role"
          {...register("role")}
          disabled={!isAdmin || saving}
        >
          {data.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </TextField>
  
        <Box sx={{ textAlign: "right" }}>
          <Button
            type="submit"
            sx={{ textTransform: "capitalize" }}
            variant="contained"
            disabled={!isAdmin || saving}
          >
            {saving ? "Creating..." : "Create New Account"}
          </Button>

          <Snackbar
            anchorOrigin={{ vertical: "top", horizontal: "right" }}
            open={open}
            autoHideDuration={3000}
            onClose={handleClose}
          >
            <Alert onClose={handleClose} severity="info" sx={{ width: "100%" }}>
              Account created successfully
            </Alert>
          </Snackbar>
        </Box>
      </Box>
</Box>
);
};

export default Form;
