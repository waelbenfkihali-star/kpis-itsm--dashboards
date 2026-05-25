// hne zerr export PDF: y7awel l report wala dashboard l fichier PDF.
import React from "react";
import { Button } from "@mui/material";
import PictureAsPdfOutlinedIcon from "@mui/icons-material/PictureAsPdfOutlined";

// hne component ExportPdfButton: mas2oul 3la affichage joz2 men l interface wala page kamla men l app.
export default function ExportPdfButton({ fileName = "dashboard-export", label = "Export PDF" }) {
  // hne function buildSmartFileName: tebni structure jdida men data l raw bech chart wala widget yesta3melha.
  function buildSmartFileName(value) {
    const today = new Date().toISOString().slice(0, 10);
    const safeName = String(value || "dashboard-export")
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

    return `${safeName || "dashboard-export"}-${today}`;
  }

  // hne function handleExport: tet9ad biha actions mta3 l user kif click, change, open, wala close, w ba3dha tbadel state wala navigation.
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
