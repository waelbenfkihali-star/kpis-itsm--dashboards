import React, { useEffect, useState, useMemo } from "react";
import { ResponsivePie } from "@nivo/pie";
import { Box, useTheme, Stack, TextField } from "@mui/material";
import dayjs from "dayjs";

import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";

const API_BASE = "http://localhost:8001/api";

const Pie = ({ isDashbord = false }) => {

  const theme = useTheme();

  const [incidents,setIncidents] = useState([])
  const [startDate,setStartDate] = useState(null)
  const [endDate,setEndDate] = useState(null)

  useEffect(()=>{

    fetch(`${API_BASE}/incidents/`)
      .then(res=>res.json())
      .then(json=>setIncidents(json))
      .catch(()=>setIncidents([]))

  },[])

  const filtered = useMemo(()=>{

    if(!startDate && !endDate) return incidents

    return incidents.filter(i=>{

      const m = dayjs(i.opened)

      if(startDate && m.isBefore(startDate)) return false
      if(endDate && m.isAfter(endDate)) return false

      return true

    })

  },[incidents,startDate,endDate])

  const pieData = useMemo(()=>{

    const counter = {}

    filtered.forEach(i=>{

      const p = i.priority || "Unknown"

      counter[p] = (counter[p] || 0) + 1

    })

    return Object.keys(counter).map(k=>({

      id:k,
      label:k,
      value:counter[k]

    }))

  },[filtered])

  const total = pieData.reduce((a,b)=>a+b.value,0)

  return(

    <Box>

      <LocalizationProvider dateAdapter={AdapterDayjs}>

        <Stack direction="row" spacing={2} sx={{mb:2}}>

          <DatePicker
            label="From"
            views={["year","month"]}
            value={startDate}
            onChange={(v)=>setStartDate(v)}
            renderInput={(params)=><TextField {...params} size="small"/>}
          />

          <DatePicker
            label="To"
            views={["year","month"]}
            value={endDate}
            onChange={(v)=>setEndDate(v)}
            renderInput={(params)=><TextField {...params} size="small"/>}
          />

        </Stack>

      </LocalizationProvider>


      <Box sx={{height:isDashbord ? "260px":"75vh"}}>

        <ResponsivePie

          data={pieData}

          margin={{top:40,right:80,bottom:80,left:80}}

          innerRadius={0.55}

          padAngle={0.7}

          cornerRadius={3}

          activeOuterRadiusOffset={8}

          colors={{scheme:"set2"}}

          theme={{
            textColor:theme.palette.text.primary
          }}

          tooltip={({datum})=>{

            const pct = total ? ((datum.value/total)*100).toFixed(1) : 0

            return(

              <div style={{
                background:theme.palette.background.default,
                padding:"8px 10px",
                borderRadius:6,
                border:`1px solid ${theme.palette.divider}`,
                fontSize:12
              }}>

                <b>{datum.label}</b><br/>

                {datum.value} incidents<br/>

                {pct} %

              </div>

            )

          }}

          legends={[

            {
              anchor:"bottom",
              direction:"row",
              translateY:60,
              itemWidth:120,
              itemHeight:18,
              symbolSize:14,
              itemOpacity:0.9
            }

          ]}

        />

      </Box>

    </Box>

  )

}

export default Pie