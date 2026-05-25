// hne page demo sghira bech twarek bar chart component.
import React from "react";
import { Box } from "@mui/material";
import Header from "../../components/Header";
import Bar from "./bar";

// hne component BarChart: mas2oul 3la affichage joz2 men l interface wala page kamla men l app.
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
