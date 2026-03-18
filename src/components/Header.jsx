import React from 'react';
import { Box, Typography, useTheme } from "@mui/material";





const Header = ({title, subTitle, isDashboard=false}) => {
  const theme = useTheme();
  return (
    <Box mb={ isDashboard? 2 :        4}>
    <Typography
      className="print-main-title"
      sx={{
        color:
          theme.palette.mode === "dark"
            ? theme.palette.info.light
            : theme.palette.primary.main,
        fontWeight: "bold",
      }}
      variant="h5"
    >
      {title}
    </Typography>
    <Typography className="print-main-subtitle" variant="body1">{subTitle}</Typography>
  </Box>

  
  );
}

export default Header;
