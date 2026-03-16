import React from "react";
import { Button } from "@mui/material";
import PictureAsPdfOutlinedIcon from "@mui/icons-material/PictureAsPdfOutlined";

export default function ExportPdfButton({ fileName = "dashboard-export", label = "Export PDF" }) {
  function buildSmartFileName(value) {
    const today = new Date().toISOString().slice(0, 10);
    const safeName = String(value || "dashboard-export")
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

    return `${safeName || "dashboard-export"}-${today}`;
  }

  function handleExport() {
    const previousTitle = document.title;
    document.title = buildSmartFileName(fileName);
    window.print();
    setTimeout(() => {
      document.title = previousTitle;
    }, 300);
  }

  return (
    <Button
      variant="contained"
      color="error"
      startIcon={<PictureAsPdfOutlinedIcon />}
      onClick={handleExport}
      className="print-export-hidden"
    >
      {label}
    </Button>
  );
}
