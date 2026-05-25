// hne toolbar mouchterek lel delete: menou l user yfasakh selected rows wala lkol.
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

// hne component DeleteToolbar: mas2oul 3la affichage joz2 men l interface wala page kamla men l app.
export default function DeleteToolbar({
  selectedIds,
  setSelectedIds,
  rows,
  setRows,
  api,
}) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // hne function deleteSelected: t3awen ba9i l code fil fichier hedha b logic sghira.
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

  // hne function deleteAll: t3awen ba9i l code fil fichier hedha b logic sghira.
  const deleteAll = async () => {
    setLoading(true);

    try {
      // hne function ids: t3awen ba9i l code fil fichier hedha b logic sghira.
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
          color="error"
          startIcon={<DeleteIcon />}
          disabled={!selectedIds.length}
          onClick={() => setOpen(true)}
        >
          Delete Selected
        </Button>

        <Button
          variant="outlined"
          color="error"
          startIcon={<DeleteIcon />}
          disabled={!rows.length}
          onClick={() => setOpen(true)}
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
          <Button onClick={() => setOpen(false)}>Cancel</Button>

          <Button color="error" onClick={deleteSelected}>
            Delete Selected
          </Button>

          <Button color="error" variant="contained" onClick={deleteAll}>
            Delete All
          </Button>
        </DialogActions>
      </Dialog>

      {loading && (
        /* hne spinner sghir yban wa9t backend mazal 9a3ed yemsa7. */
        <Stack alignItems="center" sx={{ mt: 1 }}>
          <CircularProgress size={24} />
        </Stack>
      )}
    </>
  );
}
