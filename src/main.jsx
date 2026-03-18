import React from "react";
import ReactDOM from "react-dom/client";
import { CssBaseline } from "@mui/material";
import { ThemeProvider, createTheme } from "@mui/material/styles";

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
import FAQ from "./page/faq/FAQ";
import Profile from "./page/profile/Profile";
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
import KpiDetails from "./page/Kpis/KpiDetails";

import ImportExcel from "./page/importExcel/ImportExcel";

import IncidentDetails from "./page/incidents/IncidentDetails";
import RequestDetails from "./page/requests/RequestDetails";
import ChangeDetails from "./page/changes/ChangeDetails";
import IncidentsAnalysis from "./page/incidents/IncidentsAnalysis";
import RequestsAnalysis from "./page/requests/RequestsAnalysis";
import ChangesAnalysis from "./page/changes/ChangesAnalysis";
import { getDesignTokens } from "./theme";

function RootRouter() {
  const [mode, setMode] = React.useState(
    localStorage.getItem("currentMode") || "light"
  );

  const theme = React.useMemo(
    () => createTheme(getDesignTokens(mode)),
    [mode]
  );

  const router = React.useMemo(
    () =>
      createBrowserRouter(
        createRoutesFromElements(
          <>

            {/* LOGIN */}

            <Route path="/login" element={<Login setMode={setMode} />} />

            {/* APP */}

            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <App mode={mode} setMode={setMode} />
                </ProtectedRoute>
              }
            >

              <Route index element={<Dashboard />} />

              <Route path="team" element={<Team />} />
              <Route path="incidents" element={<Incidents />} />
              <Route path="requests" element={<Requests />} />
              <Route path="changes" element={<Changes />} />

              <Route path="incidents/:number" element={<IncidentDetails />} />
              <Route path="incidents-analysis" element={<IncidentsAnalysis />} />
              <Route path="requests/:number" element={<RequestDetails />} />
              <Route path="requests-analysis" element={<RequestsAnalysis />} />
              <Route path="changes/:number" element={<ChangeDetails />} />
              <Route path="changes-analysis" element={<ChangesAnalysis />} />

              <Route path="kpiform" element={<KpiForm />} />
              <Route path="mykpis" element={<MyKpis />} />
              <Route path="mykpis/:id" element={<KpiDetails />} />
              <Route path="editkpi/:id" element={<EditKpi />} />

              <Route path="importexcel" element={<ImportExcel />} />

              <Route path="contacts" element={<Contacts />} />
              <Route path="profile" element={<Profile />} />
              <Route path="form" element={<Form />} />
              <Route path="faq" element={<FAQ />} />

              <Route path="bar" element={<BarChart />} />
              <Route path="pie" element={<PieChart />} />
              <Route path="line" element={<LineChart />} />
              <Route path="geography" element={<Geography />} />

              <Route path="*" element={<NotFound />} />

            </Route>

          </>
        )
      ),
    [mode]
  );

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <RouterProvider router={router} />
    </ThemeProvider>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <RootRouter />
  </React.StrictMode>
);
