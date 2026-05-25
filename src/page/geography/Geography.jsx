// hne page geography view elli taffichi nadhra joughrafiya 3al services wala incidents.
import React from "react";
import { Box } from "@mui/material";
import Geo from "./geo";
import Header from "../../components/Header";

// hne component Geography: mas2oul 3la affichage joz2 men l interface wala page kamla men l app.
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
