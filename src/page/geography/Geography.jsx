// hna page geography li tben map w service regions
import React from "react";
import { Box } from "@mui/material";
import Geo from "./geo";
import Header from "../../components/Header";

// hna component Geography li trender page/component section
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
