// hna page bar chart example
import React from "react";
import { Box } from "@mui/material";
import Header from "../../components/Header";
import Bar from "./bar";

// hna component BarChart li trender page/component section
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
