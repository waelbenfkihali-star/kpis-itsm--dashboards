import React, { useEffect, useState, useMemo } from "react";
import { ResponsiveBar } from "@nivo/bar";
import { Box, useTheme, Stack, TextField } from "@mui/material";

import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";

import dayjs from "dayjs";

const API_BASE = "http://localhost:8001/api";

const Bar = ({ isDashbord = false }) => {

  const theme = useTheme();

  const [allData, setAllData] = useState([]);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  useEffect(() => {

    fetch(`${API_BASE}/monthly-stats/`)
      .then((res) => res.json())
      .then((json) => setAllData(json))
      .catch(() => setAllData([]));

  }, []);

  const filteredData = useMemo(() => {

    if (!startDate && !endDate) return allData;

    return allData.filter((item) => {

      const month = dayjs(item.month + "-01");

      if (startDate && month.isBefore(startDate, "month")) return false;
      if (endDate && month.isAfter(endDate, "month")) return false;

      return true;

    });

  }, [allData, startDate, endDate]);

  return (

    <Box>

      <LocalizationProvider dateAdapter={AdapterDayjs}>

        <Stack direction="row" spacing={2} sx={{ mb: 2 }}>

          <DatePicker
            label="From"
            views={["year", "month"]}
            value={startDate}
            onChange={(newValue) => setStartDate(newValue)}
            renderInput={(params) => (
              <TextField {...params} size="small" />
            )}
          />

          <DatePicker
            label="To"
            views={["year", "month"]}
            value={endDate}
            onChange={(newValue) => setEndDate(newValue)}
            renderInput={(params) => (
              <TextField {...params} size="small" />
            )}
          />

        </Stack>

      </LocalizationProvider>

      <Box sx={{ height: isDashbord ? "300px" : "75vh" }}>

        <ResponsiveBar
          data={filteredData}
          keys={["Incidents", "Requests", "Changes"]}
          indexBy="month"
          groupMode="grouped"
          margin={{ top: 40, right: 120, bottom: 80, left: 60 }}
          padding={0.25}
          valueScale={{ type: "linear" }}
          indexScale={{ type: "band", round: true }}
          colors={{ scheme: "paired" }}

          theme={{
            textColor: theme.palette.text.primary,
          }}

          axisBottom={{
            tickRotation: -45,
            legend: "Month",
            legendOffset: 60,
          }}

          axisLeft={{
            legend: "Tickets",
            legendOffset: -40,
          }}
        />

      </Box>

    </Box>
  );
};

export default Bar;