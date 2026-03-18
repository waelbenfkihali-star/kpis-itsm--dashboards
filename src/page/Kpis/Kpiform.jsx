import React, { useState, useMemo } from "react";
import {
  Box,
  Button,
  Stack,
  Paper,
} from "@mui/material";

import { useNavigate } from "react-router-dom";
import Header from "../../components/Header";
import KpiFieldsForm from "./KpiFieldsForm";
import { KPI_INITIAL_FORM } from "./kpiFormConfig";
import { upsertKpi } from "./kpiStorage";

const KpiForm = () => {

  const navigate = useNavigate();

  const [form, setForm] = useState(KPI_INITIAL_FORM);

  function setField(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  const isValid = useMemo(() => {
    return (
      form.kpi_id.trim() !== "" &&
      form.name.trim() !== "" &&
      form.owner.trim() !== "" &&
      form.module.trim() !== ""
    );
  }, [form]);

  function resetForm() {
    setForm(KPI_INITIAL_FORM);
  }

  function submit() {

    if (!isValid) return;

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
