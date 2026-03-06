import React from "react";
import { Box } from "@mui/material";
import Header from "../../components/Header";
import Line from "./Line";

const LineChart = () => {
  return (
    <Box>
      <Header
        title="ITSM Line Chart"
        subTitle="Monthly trend: Incidents vs Requests vs Changes"
      />
      <Line />
    </Box>
  );
};

export default LineChart;