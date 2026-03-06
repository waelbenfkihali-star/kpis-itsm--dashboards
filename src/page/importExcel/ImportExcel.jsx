import React, { useMemo, useState } from "react";
import { Box, Button, Stack, TextField, Paper, Typography, Alert, Divider } from "@mui/material";
import Header from "../../components/Header";

function fileExtOk(file) {
  if (!file) return false;
  const name = String(file.name || "").toLowerCase();
  return name.endsWith(".xlsx");
}

async function readMagicPK(file) {
  // xlsx هو zip => يبدأ بـ PK
  if (!file) return null;
  const slice = file.slice(0, 2);
  const buf = await slice.arrayBuffer();
  const bytes = new Uint8Array(buf);
  if (bytes.length < 2) return null;
  return String.fromCharCode(bytes[0], bytes[1]); // غالبًا "PK"
}

function fileInfo(file) {
  if (!file) return null;
  return {
    name: file.name,
    size_bytes: file.size,
    type: file.type || "",
    last_modified: file.lastModified ? new Date(file.lastModified).toISOString() : null,
  };
}

export default function ImportExcel() {
  const [mode, setMode] = useState("all"); // all | incidents | requests | changes
  const [inc, setInc] = useState(null);
  const [req, setReq] = useState(null);
  const [chg, setChg] = useState(null);

  const [sheet, setSheet] = useState("Data");
  const [res, setRes] = useState(null);
  const [loading, setLoading] = useState(false);

  const needInc = mode === "all" || mode === "incidents";
  const needReq = mode === "all" || mode === "requests";
  const needChg = mode === "all" || mode === "changes";

  const disabled =
    loading ||
    (needInc && !inc) ||
    (needReq && !req) ||
    (needChg && !chg);

  const badExt = useMemo(() => {
    const issues = [];
    if (needInc && inc && !fileExtOk(inc)) issues.push("Incidents file must be .xlsx");
    if (needReq && req && !fileExtOk(req)) issues.push("Requests file must be .xlsx");
    if (needChg && chg && !fileExtOk(chg)) issues.push("Changes file must be .xlsx");
    return issues;
  }, [needInc, needReq, needChg, inc, req, chg]);

  async function submit() {
    setLoading(true);
    setRes(null);

    try {
      // Basic validation
      if (badExt.length) {
        setRes({ ok: false, error: "Invalid file extension", details: badExt });
        return;
      }

      // Read PK signature (optional check)
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

      // Front-only result preview
      const payloadPreview = {
        mode,
        sheet: sheet || "Data",
        files: {
          incidents: needInc ? fileInfo(inc) : null,
          requests: needReq ? fileInfo(req) : null,
          changes: needChg ? fileInfo(chg) : null,
        },
        quick_checks: pkResults,
        note:
          "Front-only preview: no upload yet. Later we'll replace this with a real POST to backend.",
        imported_at: new Date().toISOString(),
      };

      setRes({ ok: true, preview: payloadPreview });
    } catch (e) {
      setRes({ ok: false, error: String(e?.message || e) });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Box sx={{ p: 2 }}>
      <Header
        title="IMPORT EXCEL"
        subTitle="Front-only import (preview). Later we connect it to the backend."
      />

      <Paper sx={{ mt: 2, p: 2 }}>
        {/* Mode selector */}
        <Typography variant="subtitle2" sx={{ mb: 1 }}>
          Mode
        </Typography>

        <Stack direction={{ xs: "column", md: "row" }} spacing={1} sx={{ mb: 2 }}>
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

        {/* Sheet */}
        <TextField
          label="Sheet name"
          value={sheet}
          onChange={(e) => setSheet(e.target.value)}
          fullWidth
          placeholder="Data"
        />

        <Divider sx={{ my: 2 }} />

        {/* File pickers */}
        <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
          {needInc && (
            <Box sx={{ flex: 1 }}>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                Incidents (.xlsx)
              </Typography>

              <Button variant="outlined" component="label" fullWidth sx={{ textTransform: "capitalize" }}>
                Choose file
                <input
                  type="file"
                  hidden
                  accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                  onChange={(e) => setInc(e.target.files?.[0] || null)}
                />
              </Button>

              {inc ? (
                <Typography variant="caption" sx={{ display: "block", mt: 1 }}>
                  Selected: {inc.name}
                </Typography>
              ) : (
                <Typography variant="caption" sx={{ display: "block", mt: 1, opacity: 0.7 }}>
                  No file selected
                </Typography>
              )}
            </Box>
          )}

          {needReq && (
            <Box sx={{ flex: 1 }}>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                Requests (.xlsx)
              </Typography>

              <Button variant="outlined" component="label" fullWidth sx={{ textTransform: "capitalize" }}>
                Choose file
                <input
                  type="file"
                  hidden
                  accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                  onChange={(e) => setReq(e.target.files?.[0] || null)}
                />
              </Button>

              {req ? (
                <Typography variant="caption" sx={{ display: "block", mt: 1 }}>
                  Selected: {req.name}
                </Typography>
              ) : (
                <Typography variant="caption" sx={{ display: "block", mt: 1, opacity: 0.7 }}>
                  No file selected
                </Typography>
              )}
            </Box>
          )}

          {needChg && (
            <Box sx={{ flex: 1 }}>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                Changes (.xlsx)
              </Typography>

              <Button variant="outlined" component="label" fullWidth sx={{ textTransform: "capitalize" }}>
                Choose file
                <input
                  type="file"
                  hidden
                  accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                  onChange={(e) => setChg(e.target.files?.[0] || null)}
                />
              </Button>

              {chg ? (
                <Typography variant="caption" sx={{ display: "block", mt: 1 }}>
                  Selected: {chg.name}
                </Typography>
              ) : (
                <Typography variant="caption" sx={{ display: "block", mt: 1, opacity: 0.7 }}>
                  No file selected
                </Typography>
              )}
            </Box>
          )}
        </Stack>

        {badExt.length ? (
          <Alert severity="warning" sx={{ mt: 2 }}>
            {badExt.join(" • ")}
          </Alert>
        ) : null}

        <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
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
              setSheet("Data");
              setMode("all");
            }}
            sx={{ textTransform: "capitalize" }}
          >
            Reset
          </Button>
        </Stack>

        {res ? (
          <Paper
            variant="outlined"
            sx={{ mt: 2, p: 2, bgcolor: "background.default", overflow: "auto" }}
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