import React from "react";
import { Box } from "@mui/material";
import Header from "../../components/Header";
import Bar from "./bar";

const BarChart = () => {
  return (
    <Box>
      <Header
        title="ITSM Bar Chart"
        subTitle="Monthly volume: Incidents vs Requests vs Changes"
      />
      <Bar />
    </Box>
  );
};

export default BarChart;