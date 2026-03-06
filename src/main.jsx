import React from "react";
import ReactDOM from "react-dom/client";

import "./index.css";
import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
  RouterProvider,
} from "react-router-dom";
import App from "./App";
import Dashboard from "./page/dashboard/Dashboard";
import Team from "./page/team/Team";
import Contacts from "./page/contacts/Contacts";

import Form from "./page/form/Form";
import Calendar from "./page/calendar/Calendar";
import FAQ from "./page/faq/FAQ";
import BarChart from "./page/barChart/BarChart";
import PieChart from "./page/pieChart/PieChart";
import LineChart from "./page/lineChart/LineChart";
import Geography from "./page/geography/Geography";
import NotFound from "./page/notFound/NotFound";
import Incidents from "./page/incidents/Incidents";
import Requests from "./page/requests/Requests";
import Changes from "./page/chnages/Changes";
import KpiForm from "./page/Kpis/Kpiform";
import MyKpis from "./page/Kpis/MyKpis";
import EditKpi from "./page/Kpis/EditKpi";
import ImportExcel from "./page/importExcel/ImportExcel";

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<App />}>
      <Route index element={<Dashboard />} />
      <Route path="team" element={<Team />} />
      <Route path="Incidents" element={<Incidents />} />
      <Route path="Requests" element={<Requests />} />
      <Route path="Changes" element={<Changes />} />
      <Route path="Kpiform" element={<KpiForm />} />
      <Route path="MyKpis" element={<MyKpis />} />
      <Route path="EditKpi/:id" element={<EditKpi />} />
      <Route path="ImportExcel" element={<ImportExcel />} />





      <Route path="contacts" element={<Contacts />} />
      
      <Route path="form" element={<Form />} />
      <Route path="calendar" element={<Calendar />} />
      <Route path="faq" element={<FAQ />} />
      <Route path="bar" element={<BarChart />} />
      <Route path="pie" element={<PieChart />} />
      <Route path="line" element={<LineChart />} />
      <Route path="geography" element={<Geography />} />




      <Route path="*" element={<NotFound />} />
    </Route>
  )
);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);