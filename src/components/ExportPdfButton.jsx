// hne bouton mta3 export PDF: ki l user yenzel 3lih, ya7awel l dashboard wala report l PDF.
import React from "react";
import { Button } from "@mui/material";
import PictureAsPdfOutlinedIcon from "@mui/icons-material/PictureAsPdfOutlined";

// hne ExportPdfButton component: yaffichi bouton export PDF w ykhalle l user yprinti l page k PDF.
export default function ExportPdfButton({ fileName = "dashboard-export", label = "Export PDF" }) {
  // hne buildSmartFileName: tsayeb esm fichier mnadhem w safe, w tzid fih date mta3 lyom.
  function buildSmartFileName(value) {
    const today = new Date().toISOString().slice(0, 10);
    const safeName = String(value || "dashboard-export")
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

    return `${safeName || "dashboard-export"}-${today}`;
  }

  // hne handleExport: tbadel title mta3 page temporarily, t7el print dialog, mba3ed traja3 title kima ken.
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
      startIcon={<PictureAsPdfOutlinedIcon />}
      onClick={handleExport}
      className="print-export-hidden"
      sx={{
        backgroundColor: "#dc2626",
        color: "#ffffff",
        "&:hover": {
          backgroundColor: "#b91c1c",
        },
      }}
    >
      {label}
    </Button>
  );
}
