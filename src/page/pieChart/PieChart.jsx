import React from "react";
import { Box } from "@mui/material";
import Header from "../../components/Header";
import Pie from "./pie";

const PieChart = () => {
  return (
    <Box>
      <Header
        title="ITSM Pie Chart"
        subTitle="Incidents distribution by priority"
      />
      <Pie />
    </Box>
  );
};

export default PieChart;