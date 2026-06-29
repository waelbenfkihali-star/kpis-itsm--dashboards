// hne toolbar mouchterek lel delete: menou l user ynajem yfasakh rows selected wala yfasakh lkol.
import React, { useState } from "react";
import {
  Button,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import { apiFetch } from "../utils/api";

// hne component DeleteToolbar: yaffichi boutons mta3 delete w popup mta3 confirmation.
export default function DeleteToolbar({
  selectedIds,
  setSelectedIds,
  rows,
  setRows,
  api,
}) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // hne deleteSelected: tfasakh ken les rows eli l user selectionnehom.
  const deleteSelected = async () => {
    setLoading(true);

    try {
      const res = await apiFetch(api, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ids: selectedIds }),
      });

      if (!res.ok) throw new Error("Delete failed");

      setRows((prev) => prev.filter((row) => !selectedIds.includes(row.id)));

      setSelectedIds([]);
      setOpen(false);
    } catch (e) {
      alert("Delete failed");
    }

    setLoading(false);
  };

  // hne deleteAll: tfasakh les rows lkol eli mawjouda fil tableau.
  const deleteAll = async () => {
    setLoading(true);

    try {
      // hne njibou ids mta3 rows lkol bch naba3thouhom lel backend.
      const ids = rows.map((r) => r.id);

      const res = await apiFetch(api, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ids }),
      });

      if (!res.ok) throw new Error("Delete failed");

      setRows([]);
      setSelectedIds([]);
      setOpen(false);
    } catch (e) {
      alert("Delete all failed");
    }

    setLoading(false);
  };

  return (
    <>
      <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
        <Button
          variant="contained"
          startIcon={<DeleteIcon />}
          disabled={!selectedIds.length}
          onClick={() => setOpen(true)}
          sx={{
            backgroundColor: "#dc2626",
            color: "#ffffff",
            "&:hover": { backgroundColor: "#b91c1c" },
          }}
        >
          Delete Selected
        </Button>

        <Button
          variant="outlined"
          startIcon={<DeleteIcon />}
          disabled={!rows.length}
          onClick={() => setOpen(true)}
          sx={{
            color: "#dc2626",
            borderColor: "rgba(220, 38, 38, 0.42)",
            "&:hover": {
              borderColor: "#dc2626",
              backgroundColor: "#fee2e2",
            },
          }}
        >
          Delete All
        </Button>
      </Stack>

      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>Confirm delete</DialogTitle>

        <DialogContent>
          Are you sure you want to delete selected data?
        </DialogContent>

        <DialogActions>
          <Button
            onClick={() => setOpen(false)}
            sx={{
              color: "#475569",
              "&:hover": { backgroundColor: "#e2e8f0" },
            }}
          >
            Cancel
          </Button>

          <Button
            onClick={deleteSelected}
            sx={{
              color: "#dc2626",
              "&:hover": { backgroundColor: "#fee2e2" },
            }}
          >
            Delete Selected
          </Button>

          <Button
            variant="contained"
            onClick={deleteAll}
            sx={{
              backgroundColor: "#dc2626",
              color: "#ffffff",
              "&:hover": { backgroundColor: "#b91c1c" },
            }}
          >
            Delete All
          </Button>
        </DialogActions>
      </Dialog>

      {loading && (
        /* hne spinner sghir yban wa9t l delete mazelt tekhdem fil backend. */
        <Stack alignItems="center" sx={{ mt: 1 }}>
          <CircularProgress size={24} />
        </Stack>
      )}
    </>
  );
}
