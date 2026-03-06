import React from "react";
import { Stack } from "@mui/material";
import WarningAmberOutlinedIcon from "@mui/icons-material/WarningAmberOutlined";
import ErrorOutlineOutlinedIcon from "@mui/icons-material/ErrorOutlineOutlined";
import AssignmentOutlinedIcon from "@mui/icons-material/AssignmentOutlined";
import AutorenewOutlinedIcon from "@mui/icons-material/AutorenewOutlined";
import Card from "./card";

const Row1 = () => {
  return (
    <Stack
      direction="row"
      flexWrap="wrap"
      gap={1.5}
      justifyContent="space-between"
      sx={{ mb: 2 }}
    >
      <Card
        icon={<WarningAmberOutlinedIcon color="warning" />}
        title="Major Incidents"
        subTitle="Total incidents"
        value="24"
        increase="5 critical"
        scheme="red_yellow_blue"
        data={[
          { id: "major", label: "Major", value: 5 },
          { id: "others", label: "Others", value: 19 },
        ]}
      />

      <Card
        icon={<ErrorOutlineOutlinedIcon color="error" />}
        title="Open Incidents (Backlog)"
        subTitle="Current backlog"
        value="42"
        increase="180 closed"
        scheme="nivo"
        data={[
          { id: "open", label: "Open", value: 42 },
          { id: "closed", label: "Closed", value: 180 },
        ]}
      />

      <Card
        icon={<AssignmentOutlinedIcon color="primary" />}
        title="Open Service Requests"
        subTitle="Pending requests"
        value="31"
        increase="96 total"
        scheme="category10"
        data={[
          { id: "open", label: "Open", value: 31 },
          { id: "done", label: "Done", value: 65 },
        ]}
      />

      <Card
        icon={<AutorenewOutlinedIcon color="success" />}
        title="Closed Changes"
        subTitle="Successfully completed"
        value="61"
        increase="73 total"
        scheme="set2"
        data={[
          { id: "closed", label: "Closed", value: 61 },
          { id: "pending", label: "Pending", value: 12 },
        ]}
      />
    </Stack>
  );
};

export default Row1;