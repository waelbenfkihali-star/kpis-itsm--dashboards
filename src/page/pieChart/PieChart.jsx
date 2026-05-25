// hne page demo sghira bech twarek pie chart component.
import React from "react";
import { Box } from "@mui/material";
import Header from "../../components/Header";
import Pie from "./pie";

// hne component PieChart: mas2oul 3la affichage joz2 men l interface wala page kamla men l app.
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
