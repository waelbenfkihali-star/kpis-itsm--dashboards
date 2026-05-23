// hna page not found message
import React from "react";
import Typography from "@mui/material/Typography";
import { Box, useTheme } from "@mui/material";

// hna component NotFound li trender page/component section
const NotFound = () => {
  // page not found: ta3mel render message minimal ida route ma famahech
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
