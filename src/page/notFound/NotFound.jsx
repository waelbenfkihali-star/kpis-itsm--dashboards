// hne page elli tban ki route mahouche mawjoud.
import React from "react";
import Typography from "@mui/material/Typography";
import { Box, useTheme } from "@mui/material";

// hne component NotFound: mas2oul 3la affichage joz2 men l interface wala page kamla men l app.
const NotFound = () => {
  const theme = useTheme();
  return (
    <Box>
      <Typography align="center" color={theme.palette.error.main} variant="h5">
        There is no design yet
        <br />
        <br />
        Please try again later..
      </Typography>
    </Box>
  );
};

export default NotFound;
