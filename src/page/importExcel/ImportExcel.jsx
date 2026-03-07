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
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import Header from "../../components/Header";

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
    size_bytes: file.size,
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
    if (needInc && inc && !fileExtOk(inc)) {
      issues.push("Incidents file must be .xlsx");
    }
    if (needReq && req && !fileExtOk(req)) {
      issues.push("Requests file must be .xlsx");
    }
    if (needChg && chg && !fileExtOk(chg)) {
      issues.push("Changes file must be .xlsx");
    }
    return issues;
  }, [needInc, needReq, needChg, inc, req, chg]);

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
          note: "Files uploaded successfully to backend.",
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

  return (
    <Box sx={{ p: 2 }}>
      <Header
        title="IMPORT EXCEL"
        subTitle="Upload Excel files to backend and populate incidents, requests and changes"
      />

      <Paper sx={{ mt: 2, p: 2 }}>
        <Typography variant="subtitle2" sx={{ mb: 1 }}>
          Mode
        </Typography>

        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={1}
          sx={{ mb: 2 }}
        >
          {[
            { v: "all", t: "All" },
            { v: "incidents", t: "Incidents" },
            { v: "requests", t: "Requests" },
            { v: "changes", t: "Changes" },
          ].map((x) => (
            <Button
              key={x.v}
              variant={mode === x.v ? "contained" : "outlined"}
              onClick={() => setMode(x.v)}
              sx={{ textTransform: "capitalize" }}
            >
              {x.t}
            </Button>
          ))}
        </Stack>

        <Divider sx={{ my: 2 }} />

        <TextField
          label="Sheet name"
          value={sheet}
          onChange={(e) => setSheet(e.target.value)}
          fullWidth
          placeholder="Sheet1"
          helperText='Example: Sheet1 or Data, depending on your file.'
        />

        <Divider sx={{ my: 2 }} />

        <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
          {needInc && (
            <Box sx={{ flex: 1 }}>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                Incidents (.xlsx)
              </Typography>

              <Button
                variant="outlined"
                component="label"
                fullWidth
                sx={{ textTransform: "capitalize" }}
              >
                Choose file
                <input
                  type="file"
                  hidden
                  accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                  onChange={(e) => setInc(e.target.files?.[0] || null)}
                />
              </Button>

              <Typography variant="caption" sx={{ display: "block", mt: 1 }}>
                {inc ? `Selected: ${inc.name}` : "No file selected"}
              </Typography>
            </Box>
          )}

          {needReq && (
            <Box sx={{ flex: 1 }}>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                Requests (.xlsx)
              </Typography>

              <Button
                variant="outlined"
                component="label"
                fullWidth
                sx={{ textTransform: "capitalize" }}
              >
                Choose file
                <input
                  type="file"
                  hidden
                  accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                  onChange={(e) => setReq(e.target.files?.[0] || null)}
                />
              </Button>

              <Typography variant="caption" sx={{ display: "block", mt: 1 }}>
                {req ? `Selected: ${req.name}` : "No file selected"}
              </Typography>
            </Box>
          )}

          {needChg && (
            <Box sx={{ flex: 1 }}>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                Changes (.xlsx)
              </Typography>

              <Button
                variant="outlined"
                component="label"
                fullWidth
                sx={{ textTransform: "capitalize" }}
              >
                Choose file
                <input
                  type="file"
                  hidden
                  accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                  onChange={(e) => setChg(e.target.files?.[0] || null)}
                />
              </Button>

              <Typography variant="caption" sx={{ display: "block", mt: 1 }}>
                {chg ? `Selected: ${chg.name}` : "No file selected"}
              </Typography>
            </Box>
          )}
        </Stack>

        {badExt.length ? (
          <Alert severity="warning" sx={{ mt: 2 }}>
            {badExt.join(" • ")}
          </Alert>
        ) : null}

        <Stack direction="row" spacing={2} sx={{ mt: 2, flexWrap: "wrap" }}>
          <Button
            variant="contained"
            onClick={submit}
            disabled={disabled}
            sx={{ textTransform: "capitalize" }}
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
              setSheet("Sheet1");
              setMode("all");
            }}
            sx={{ textTransform: "capitalize" }}
          >
            Reset
          </Button>

          {res?.ok ? (
            <Button
              variant="contained"
              color="success"
              onClick={handleGoToModule}
              sx={{ textTransform: "capitalize" }}
            >
              Open table
            </Button>
          ) : null}
        </Stack>

        {res ? (
          <Paper
            variant="outlined"
            sx={{
              mt: 2,
              p: 2,
              bgcolor: "background.default",
              overflow: "auto",
            }}
          >
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Result
            </Typography>
            <pre style={{ margin: 0, fontSize: 12 }}>
              {JSON.stringify(res, null, 2)}
            </pre>
          </Paper>
        ) : null}
      </Paper>
    </Box>
  );
}