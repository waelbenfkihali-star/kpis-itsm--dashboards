import React, { useMemo, useState } from "react";
import {
  Box,
  Button,
  Stack,
  TextField,
  Paper,
  Typography,
  Alert,
  Divider,
  LinearProgress,
} from "@mui/material";

import UploadFileIcon from "@mui/icons-material/UploadFile";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";

import { useNavigate } from "react-router-dom";
import Header from "../../components/Header";

import * as XLSX from "xlsx";

const API_URL = "http://localhost:8001/api/import/";

function fileExtOk(file) {
  if (!file) return false;
  const name = String(file.name || "").toLowerCase();
  return name.endsWith(".xlsx");
}

async function readMagicPK(file) {
  if (!file) return null;
  const slice = file.slice(0, 2);
  const buf = await slice.arrayBuffer();
  const bytes = new Uint8Array(buf);
  if (bytes.length < 2) return null;
  return String.fromCharCode(bytes[0], bytes[1]);
}

function fileInfo(file) {
  if (!file) return null;
  return {
    name: file.name,
    size_kb: Math.round(file.size / 1024),
    type: file.type || "",
    last_modified: file.lastModified
      ? new Date(file.lastModified).toISOString()
      : null,
  };
}

export default function ImportExcel() {

  const navigate = useNavigate();

  const [mode, setMode] = useState("all");

  const [inc, setInc] = useState(null);
  const [req, setReq] = useState(null);
  const [chg, setChg] = useState(null);

  const [preview, setPreview] = useState([]);

  const [sheet, setSheet] = useState("Sheet1");
  const [res, setRes] = useState(null);
  const [loading, setLoading] = useState(false);

  const needInc = mode === "all" || mode === "incidents";
  const needReq = mode === "all" || mode === "requests";
  const needChg = mode === "all" || mode === "changes";

  const disabled =
    loading || (needInc && !inc) || (needReq && !req) || (needChg && !chg);

  const badExt = useMemo(() => {

    const issues = [];

    if (needInc && inc && !fileExtOk(inc))
      issues.push("Incidents file must be .xlsx");

    if (needReq && req && !fileExtOk(req))
      issues.push("Requests file must be .xlsx");

    if (needChg && chg && !fileExtOk(chg))
      issues.push("Changes file must be .xlsx");

    return issues;

  }, [needInc, needReq, needChg, inc, req, chg]);

  function previewExcel(file) {

    if (!file) return;

    const reader = new FileReader();

    reader.onload = (e) => {

      // @ts-ignore
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: "array" });

      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];

      const json = XLSX.utils.sheet_to_json(worksheet);

      setPreview(json.slice(0, 5));

    };

    reader.readAsArrayBuffer(file);
  }

  async function submit() {

    setLoading(true);
    setRes(null);

    try {

      if (badExt.length) {

        setRes({
          ok: false,
          error: "Invalid file extension",
          details: badExt,
        });

        return;

      }

      const checks = [];

      if (needInc && inc) checks.push({ kind: "incidents", file: inc });
      if (needReq && req) checks.push({ kind: "requests", file: req });
      if (needChg && chg) checks.push({ kind: "changes", file: chg });

      const pkResults = {};

      for (const c of checks) {

        const magic = await readMagicPK(c.file);

        pkResults[c.kind] = {
          magic2: magic,
          looks_like_xlsx_zip: magic === "PK",
        };

      }

      const formData = new FormData();

      formData.append("mode", mode);
      formData.append("sheet", sheet || "Sheet1");

      if (needInc && inc) formData.append("incidents", inc);
      if (needReq && req) formData.append("requests", req);
      if (needChg && chg) formData.append("changes", chg);

      const response = await fetch(API_URL, {
        method: "POST",
        body: formData,
      });

      const json = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(json?.error || json?.detail || `HTTP ${response.status}`);
      }

      setRes({
        ok: true,
        preview: {
          mode,
          requested_sheet: sheet || "Sheet1",
          files: {
            incidents: needInc ? fileInfo(inc) : null,
            requests: needReq ? fileInfo(req) : null,
            changes: needChg ? fileInfo(chg) : null,
          },
          quick_checks: pkResults,
          backend_response: json,
          imported_at: new Date().toISOString(),
        },
      });

    } catch (e) {

      setRes({
        ok: false,
        error: String(e?.message || e),
      });

    } finally {

      setLoading(false);

    }
  }

  function handleGoToModule() {

    if (mode === "incidents") navigate("/incidents");
    else if (mode === "requests") navigate("/requests");
    else if (mode === "changes") navigate("/changes");
    else navigate("/incidents");

  }

  function dropFile(e, setFile) {

    e.preventDefault();

    const f = e.dataTransfer.files[0];

    setFile(f);
    previewExcel(f);

  }

  return (

    <Box sx={{ p: 2 }}>

      <Header
        title="IMPORT EXCEL"
        subTitle="Upload Excel files and preview data before importing"
      />

      <Paper sx={{ mt: 2, p: 3 }}>

        <Typography variant="subtitle1" mb={2}>
          Mode
        </Typography>

        <Stack direction="row" spacing={1} mb={3}>

          {["all", "incidents", "requests", "changes"].map((v) => (
            <Button
              key={v}
              variant={mode === v ? "contained" : "outlined"}
              onClick={() => setMode(v)}
            >
              {v}
            </Button>
          ))}

        </Stack>

        <TextField
          label="Sheet name"
          value={sheet}
          onChange={(e) => setSheet(e.target.value)}
          fullWidth
        />

        <Divider sx={{ my: 3 }} />

        <Stack direction={{ xs: "column", md: "row" }} spacing={2}>

          {needInc && (
            <FileCard
              title="Incidents"
              file={inc}
              setFile={setInc}
              drop={dropFile}
              preview={previewExcel}
            />
          )}

          {needReq && (
            <FileCard
              title="Requests"
              file={req}
              setFile={setReq}
              drop={dropFile}
              preview={previewExcel}
            />
          )}

          {needChg && (
            <FileCard
              title="Changes"
              file={chg}
              setFile={setChg}
              drop={dropFile}
              preview={previewExcel}
            />
          )}

        </Stack>

        {badExt.length > 0 && (
          <Alert severity="warning" sx={{ mt: 2 }}>
            {badExt.join(" • ")}
          </Alert>
        )}

        {loading && <LinearProgress sx={{ mt: 2 }} />}

        <Stack direction="row" spacing={2} sx={{ mt: 3 }}>

          <Button
            startIcon={<CloudUploadIcon />}
            variant="contained"
            onClick={submit}
            disabled={disabled || badExt.length > 0}
          >
            {loading ? "Importing..." : "Import now"}
          </Button>

          <Button
            variant="outlined"
            onClick={() => {
              setInc(null);
              setReq(null);
              setChg(null);
              setRes(null);
              setPreview([]);
              setMode("all");
            }}
          >
            Reset
          </Button>

          {res?.ok && (
            <Button
              variant="contained"
              color="success"
              onClick={handleGoToModule}
            >
              Open table
            </Button>
          )}

        </Stack>

        {preview.length > 0 && (

          <Paper sx={{ mt: 3, p: 2 }}>

            <Typography variant="subtitle2">
              Excel Preview
            </Typography>

            <pre style={{ fontSize: 12 }}>
              {JSON.stringify(preview, null, 2)}
            </pre>

          </Paper>

        )}

        {res && (

          <Paper sx={{ mt: 3, p: 2 }}>

            <Typography variant="subtitle2">
              Result
            </Typography>

            <pre style={{ fontSize: 12 }}>
              {JSON.stringify(res, null, 2)}
            </pre>

          </Paper>

        )}

      </Paper>

    </Box>

  );
}

function FileCard({ title, file, setFile, drop, preview }) {

  return (

    <Paper
      sx={{
        p: 3,
        flex: 1,
        textAlign: "center",
        border: "2px dashed #ccc",
      }}
      onDrop={(e) => drop(e, setFile)}
      onDragOver={(e) => e.preventDefault()}
    >

      <UploadFileIcon sx={{ fontSize: 40 }} />

      <Typography mt={1}>{title} file</Typography>

      <Button
        component="label"
        variant="outlined"
        sx={{ mt: 2 }}
      >

        Choose file

        <input
          hidden
          type="file"
          accept=".xlsx"
          onChange={(e) => {
            const f = e.target.files[0];
            setFile(f);
            preview(f);
          }}
        />

      </Button>

      <Typography variant="caption" display="block" mt={1}>

        {file ? `${file.name} (${Math.round(file.size / 1024)} KB)` : "No file"}

      </Typography>

    </Paper>

  );
}