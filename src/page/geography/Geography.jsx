import React from "react";
import { Box } from "@mui/material";
import Geo from "./geo";
import Header from "../../components/Header";

const Geography = () => {
  return (
    <Box>
      <Header
        title="IT Services Map"
        subTitle="Creative view of incidents by IT service"
      />

      <Geo />
    </Box>
  );
};

export default Geography;