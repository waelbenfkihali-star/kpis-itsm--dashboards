// hne  bidayet l frontend: na3mlou theme, n7adrou routes lkol, w nmountiw React app.
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
import RoleRoute from "./auth/RoleRoute";

import Dashboard from "./page/dashboard/Dashboard";
import Team from "./page/team/Team";
import Form from "./page/form/Form";
import FAQ from "./page/faq/FAQ";
import Profile from "./page/profile/Profile";
import NotFound from "./page/notFound/NotFound";
import AssistantDashboard from "./page/ai/AssistantDashboard";

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

// hne RootRouter: fih theme mta3 l app w routes lkol mta3 frontend.
function RootRouter() {
  // hne n5aznou mode mta3 theme: ken mawjoud fi localStorage nesta3mlou, sinon n7ottou light par défaut.
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


            <Route path="/login" element={<Login setMode={setMode} />} />

            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <App mode={mode} setMode={setMode} />
                </ProtectedRoute>
              }
            >

              <Route index element={<Dashboard />} />
              

              <Route path="incidents" element={<Incidents />} />
              <Route path="requests" element={<Requests />} />
              <Route path="changes" element={<Changes />} />

              <Route path="incidents/:number" element={<IncidentDetails />} />
              <Route path="incidents-analysis" element={<IncidentsAnalysis />} />
              <Route path="requests/:number" element={<RequestDetails />} />
              <Route path="requests-analysis" element={<RequestsAnalysis />} />
              <Route path="changes/:number" element={<ChangeDetails />} />
              <Route path="changes-analysis" element={<ChangesAnalysis />} />

              <Route path="mykpis" element={<MyKpis />} />
              <Route path="mykpis/:id" element={<KpiDetails />} />
              <Route path="team" element={<RoleRoute><Team /></RoleRoute>} />
              <Route path="kpiform" element={<RoleRoute><KpiForm /></RoleRoute>} />
              <Route path="editkpi/:id" element={<RoleRoute><EditKpi /></RoleRoute>} />
              <Route path="importexcel" element={<RoleRoute><ImportExcel /></RoleRoute>} />
              <Route path="profile" element={<Profile />} />
              <Route path="ai-dashboard" element={<AssistantDashboard />} />
              <Route path="form" element={<RoleRoute><Form /></RoleRoute>} />
              <Route path="faq" element={<FAQ />} />

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

// @ts-ignore
ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <RootRouter />
  </React.StrictMode>
);
