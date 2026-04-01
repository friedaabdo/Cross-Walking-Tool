import { useState } from "react";

const normalizeMatches = (value) =>
  Array.isArray(value) ? value : value ? [value] : [];

function useCrosswalkState() {
  const [matchesByRow, setMatchesByRow] = useState({});
  const [notesByRow, setNotesByRow] = useState({});
  const [draggedOnceById, setDraggedOnceById] = useState({});

  const getMatchesForRow = (rowId) => normalizeMatches(matchesByRow[rowId]);

  const handleDragEnd = (event) => {
    if (event.canceled) {
      return;
    }

    const draggedId = event.operation?.source?.id;
    const dropId = event.operation?.target?.id;

    if (draggedId?.startsWith("cert-")) {
      setDraggedOnceById((previous) => {
        if (previous[draggedId]) {
          return previous;
        }

        return { ...previous, [draggedId]: true };
      });
    }

    if (!draggedId || !dropId) {
      return;
    }

    setMatchesByRow((previous) => {
      const next = { ...previous };
      const matchesForRow = normalizeMatches(next[dropId]);

      if (!matchesForRow.includes(draggedId)) {
        next[dropId] = [...matchesForRow, draggedId];
      }

      return next;
    });
  };

  const handleRemoveMatch = (rowId, matchedId) => {
    setMatchesByRow((previous) => {
      const matchesForRow = normalizeMatches(previous[rowId]);
      const nextMatches = matchesForRow.filter((id) => id !== matchedId);

      if (nextMatches.length === matchesForRow.length) {
        return previous;
      }

      return {
        ...previous,
        [rowId]: nextMatches,
      };
    });
  };

  const handleNotesChange = (rowId, value) => {
    setNotesByRow((previous) => ({ ...previous, [rowId]: value }));
  };

  return {
    draggedOnceById,
    matchesByRow,
    notesByRow,
    handleDragEnd,
    handleNotesChange,
    handleRemoveMatch,
    getMatchesForRow,
  };
}

export default useCrosswalkState;
