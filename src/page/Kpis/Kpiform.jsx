// hne page creation KPI jdid w save mta3ou fil localStorage.
import React, { useState, useMemo } from "react";
import {
  Box,
  Button,
  Alert,
  Stack,
  Paper,
} from "@mui/material";

import { useNavigate } from "react-router-dom";
import Header from "../../components/Header";
import KpiFieldsForm from "./KpiFieldsForm";
import { KPI_INITIAL_FORM } from "./kpiFormConfig";
import { upsertKpi, validateKpi } from "./kpiStorage";

// hne component KpiForm: mas2oul 3la affichage joz2 men l interface wala page kamla men l app.
const KpiForm = () => {

  const navigate = useNavigate();

  const [form, setForm] = useState(KPI_INITIAL_FORM);
  const [error, setError] = useState("");

  // hne function setField: t3awen ba9i l code fil fichier hedha b logic sghira.
  function setField(key, value) {
    setError("");
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  // hne function isValid: true wala false hasb condition mo3ayna fil logic.
  const isValid = useMemo(() => {
    return (
      form.kpi_id.trim() !== "" &&
      form.name.trim() !== "" &&
      form.owner.trim() !== "" &&
      form.module.trim() !== ""
    );
  }, [form]);

  // hne function resetForm: l form wala l filters l 7ala l aslaya.
  function resetForm() {
    setForm(KPI_INITIAL_FORM);
  }

  // hne function submit: form wala request lel backend w teta3amel m3a success wala error.
  function submit() {

    if (!isValid) return;

    const validationMessage = validateKpi(form);
    if (validationMessage) {
      setError(validationMessage);
      return;
    }

    const newKpi = {
      id: Date.now(),
      ...form,
    };

    upsertKpi(newKpi);

    navigate("/MyKpis");

  }

  return (

    <Box>

      <Header
        title="DEFINE KPI"
        subTitle="Create a KPI definition"
      />

      {error ? (
        <Alert severity="error" sx={{ mt: 2, mb: 2 }}>
          {error}
        </Alert>
      ) : null}

      <Paper sx={{ mt: 3, p: 3, width: "100%" }}>

        <KpiFieldsForm form={form} setField={setField} />

        <Stack direction="row" spacing={2} sx={{ mt: 3 }}>

          <Button
            variant="contained"
            onClick={submit}
            disabled={!isValid}
          >
            Save KPI
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

    </Box>

  );
};

export default KpiForm;
