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

  function setField(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  const isValid = useMemo(() => {
    return (
      form.name.trim() !== "" &&
      form.owner.trim() !== "" &&
      form.module.trim() !== ""
    );
  }, [form]);

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
