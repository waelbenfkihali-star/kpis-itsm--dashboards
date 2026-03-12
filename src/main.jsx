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
import Login from "./page/Login/Login";
import ProtectedRoute from "./auth/ProtectedRoute";

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
import Changes from "./page/changes/Changes";

import KpiForm from "./page/Kpis/Kpiform";
import MyKpis from "./page/Kpis/MyKpis";
import EditKpi from "./page/Kpis/EditKpi";

import ImportExcel from "./page/importExcel/ImportExcel";

import IncidentDetails from "./page/incidents/IncidentDetails";
import RequestDetails from "./page/requests/RequestDetails";
import ChangeDetails from "./page/changes/ChangeDetails";

const router = createBrowserRouter(
  createRoutesFromElements(
    <>

      {/* LOGIN */}

      <Route path="/login" element={<Login />} />

      {/* APP */}

      <Route
        path="/"
        element={
          <ProtectedRoute>
            <App />
          </ProtectedRoute>
        }
      >

        <Route index element={<Dashboard />} />

        <Route path="team" element={<Team />} />
        <Route path="incidents" element={<Incidents />} />
        <Route path="requests" element={<Requests />} />
        <Route path="changes" element={<Changes />} />

        <Route path="incidents/:number" element={<IncidentDetails />} />
        <Route path="requests/:number" element={<RequestDetails />} />
        <Route path="changes/:number" element={<ChangeDetails />} />

        <Route path="kpiform" element={<KpiForm />} />
        <Route path="mykpis" element={<MyKpis />} />
        <Route path="editkpi/:id" element={<EditKpi />} />

        <Route path="importexcel" element={<ImportExcel />} />

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

    </>
  )
);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);