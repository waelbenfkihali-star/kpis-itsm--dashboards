// hne page modification KPI mawjouda 9bal w update mta3ha fil stockage local.
import React, { useEffect, useState, useMemo } from "react";
import {
  Box,
  Button,
  Stack,
  Alert,
  Paper,
} from "@mui/material";

import { useNavigate, useParams } from "react-router-dom";
import Header from "../../components/Header";
import KpiFieldsForm from "./KpiFieldsForm";
import { KPI_INITIAL_FORM } from "./kpiFormConfig";

import { getKpiById, loadKpis, upsertKpi } from "./kpiStorage";

// hne component EditKpi: mas2oul 3la affichage joz2 men l interface wala page kamla men l app.
const EditKpi = () => {

  const navigate = useNavigate();
  const { id } = useParams();

  const [notFound, setNotFound] = useState(false);

  const [form, setForm] = useState(KPI_INITIAL_FORM);

  useEffect(() => {
    let kpi = getKpiById(id);

    if (!kpi) {
      const list = loadKpis();
      kpi = list.find((x) => String(x.id) === String(id)) || null;
    }

    if (!kpi) {
      setNotFound(true);
      return;
    }

    setNotFound(false);

    setForm({
      ...KPI_INITIAL_FORM,
      id: kpi.id,
      kpi_id: kpi.kpi_id || "",
      name: kpi.name || "",
      owner: kpi.owner || "",
      module: kpi.module || "",
      dimension: kpi.dimension || "",
      target: kpi.target || "",
      frequency: kpi.frequency || "",
      unit: kpi.unit || "",
      formula: kpi.formula || "",
      source: kpi.source || "",
      status: kpi.status || "Active",
      description: kpi.description || "",
    });

  }, [id]);

  // hne function setField: t3awen ba9i l code fil fichier hedha b logic sghira.
  function setField(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  // hne function isValid: true wala false hasb condition mo3ayna fil logic.
  const isValid = useMemo(() => {
    return (
      form.name.trim() !== "" &&
      form.owner.trim() !== "" &&
      form.module.trim() !== ""
    );
  }, [form]);

  // hne function resetForm: l form wala l filters l 7ala l aslaya.
  function resetForm() {
    setForm((prev) => ({
      ...prev,
      name: "",
      owner: "",
      module: "",
      dimension: "",
      target: "",
      frequency: "",
      unit: "",
      formula: "",
      source: "",
      description: "",
    }));
  }

  // hne function submit: form wala request lel backend w teta3amel m3a success wala error.
  function submit() {

    if (!isValid) return;

    upsertKpi(form);

    navigate("/MyKpis");

  }

  return (

    <Box>

      <Header
        title="EDIT KPI"
        subTitle={`Editing KPI: ${form.kpi_id || id}`}
      />

      {notFound ? (

        <Box sx={{ mt: 2,  width: "100%" }}>

          <Alert severity="warning">
            KPI not found (id: {id})
          </Alert>

          <Stack direction="row" spacing={2} sx={{ mt: 2 }}>

            <Button
              variant="contained"
              onClick={() => navigate("/MyKpis")}
            >
              Back to My KPIs
            </Button>

            <Button
              variant="outlined"
              onClick={() => navigate("/Kpiform")}
            >
              Define KPI
            </Button>

          </Stack>

        </Box>

      ) : (

        <Paper sx={{ mt: 3, p: 3,  width: "100%" }}>

          <KpiFieldsForm
            form={form}
            setField={setField}
            disableKpiId
          />

          <Stack direction="row" spacing={2} sx={{ mt: 3 }}>

            <Button
              variant="contained"
              onClick={submit}
              disabled={!isValid}
            >
              Save Changes
            </Button>

            <Button
              variant="outlined"
              onClick={resetForm}
            >
              Reset
            </Button>

            <Button
              variant="text"
              onClick={() => navigate("/MyKpis")}
            >
              Cancel
            </Button>

          </Stack>

        </Paper>

      )}

    </Box>
  );
};

export default EditKpi;
