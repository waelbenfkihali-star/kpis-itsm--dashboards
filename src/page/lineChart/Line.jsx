// @ts-nocheck
import React, { useEffect, useState, useMemo } from "react";
import { Box, useTheme, Stack, TextField } from "@mui/material";
import { ResponsiveLine } from "@nivo/line";
import dayjs from "dayjs";

import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { apiFetch } from "../../utils/api";

const Line = ({ isDashbord = false }) => {

  const theme = useTheme();

  const [rawData,setRawData] = useState([])
  const [startDate,setStartDate] = useState(null)
  const [endDate,setEndDate] = useState(null)

  useEffect(()=>{

    apiFetch("/monthly-stats/")
      .then(res=>res.json())
      .then(json=>setRawData(json))
      .catch(()=>setRawData([]))

  },[])

  const filtered = useMemo(()=>{

    if(!startDate && !endDate) return rawData

    return rawData.filter(r=>{

      const m = dayjs(r.month+"-01")

      if(startDate && m.isBefore(startDate,"month")) return false
      if(endDate && m.isAfter(endDate,"month")) return false

      return true

    })

  },[rawData,startDate,endDate])


  const chartData = useMemo(()=>{

    const incidents = []
    const requests = []
    const changes = []

    filtered.forEach(r=>{

      incidents.push({x:r.month,y:r.Incidents})
      requests.push({x:r.month,y:r.Requests})
      changes.push({x:r.month,y:r.Changes})

    })

    return [

      { id:"Incidents", data:incidents },

      { id:"Requests", data:requests },

      { id:"Changes", data:changes }

    ]

  },[filtered])


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


      <Box sx={{height:isDashbord ? "300px":"75vh"}}>

        <ResponsiveLine

          data={chartData}

          margin={{top:50,right:120,bottom:70,left:60}}

          xScale={{type:"point"}}

          yScale={{
            type:"linear",
            min:"auto",
            max:"auto",
            stacked:false
          }}

          curve="catmullRom"

          axisBottom={{
            tickRotation:-35,
            legend:"Month",
            legendOffset:55
          }}

          axisLeft={{
            legend:"Tickets",
            legendOffset:-45
          }}

          enableArea={true}

          areaOpacity={0.08}

          pointSize={8}

          pointBorderWidth={2}

          pointBorderColor={{from:"serieColor"}}

          useMesh={true}

          colors={{scheme:"set2"}}

          theme={{
            textColor:theme.palette.text.primary
          }}

          tooltip={({point})=>{

            const serie = point.serieId
            const month = point.data.x
            const value = point.data.y

            return(

              <div style={{
                background:theme.palette.background.default,
                padding:"8px 10px",
                borderRadius:6,
                border:`1px solid ${theme.palette.divider}`,
                fontSize:12
              }}>

                <b>{serie}</b><br/>

                {month}<br/>

                <b>{value}</b>

              </div>

            )

          }}

          legends={[

            {
              anchor:"bottom-right",
              direction:"column",
              translateX:100,
              itemWidth:90,
              itemHeight:20,
              symbolSize:12,
              itemOpacity:0.9
            }

          ]}

        />

      </Box>

    </Box>

  )

}

export default Line
