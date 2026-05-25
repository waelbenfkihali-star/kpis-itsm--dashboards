// hne page demo sghira bech twarek line chart component.
import React from "react";
import { Box } from "@mui/material";
import Header from "../../components/Header";
import Line from "./Line";

// hne component LineChart: mas2oul 3la affichage joz2 men l interface wala page kamla men l app.
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
