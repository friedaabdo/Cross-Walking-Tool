import { normalizeToArray } from "./collections";

// The crosswalk page identifies outcomes by position: course outcome i is row "drop-i", learning experience outcome j is card "cert-j".
// The database identifies them by outcomeId. These two functions convert between the two, so loading and saving stay in sync.

export const loadMatchState = async (matchId, courseOutcomeRows, experienceOutcomeRows) => {
  const response = await fetch(`/api/match-details/${matchId}`);

  if (!response.ok) {
    throw new Error("Failed to load match details");
  }

  const matchesByRow = {};
  const notesByRow = {};
  const draggedOnceById = {};

  (await response.json()).forEach((detail) => {
    const courseRowIndex = courseOutcomeRows.findIndex(
      (row) => Number(row?.outcomeId) === Number(detail?.cuny_outcome_id),
    );
    const experienceRowIndex = experienceOutcomeRows.findIndex(
      (row) => Number(row?.outcomeId) === Number(detail?.experience_outcome_id),
    );

    if (courseRowIndex < 0) {
      return;
    }

    const rowId = `drop-${courseRowIndex}`;

    if (detail?.notes && !notesByRow[rowId]) {
      notesByRow[rowId] = detail.notes;
    }

    if (experienceRowIndex >= 0) {
      const matchedId = `cert-${experienceRowIndex}`;

      matchesByRow[rowId] = [...(matchesByRow[rowId] ?? []), matchedId];
      draggedOnceById[matchedId] = true;
    }
  });

  return { matchesByRow, notesByRow, draggedOnceById };
};

export const saveMatchState = async (
  matchId,
  { courseOutcomeRows, experienceOutcomeRows, matchesByRow, notesByRow },
) => {
  const details = [];

  courseOutcomeRows.forEach((courseRow, rowIndex) => {
    const rowId = `drop-${rowIndex}`;
    const notes = notesByRow[rowId] ?? "";
    const cunyOutcomeId = courseRow?.outcomeId;
    const matchedIds = normalizeToArray(matchesByRow[rowId]);

    if (!cunyOutcomeId) {
      return;
    }

    if (matchedIds.length === 0) {
      if (String(notes).trim()) {
        details.push({ cuny_outcome_id: cunyOutcomeId, experience_outcome_id: null, notes });
      }

      return;
    }

    matchedIds.forEach((matchedId) => {
      const experienceOutcomeId = experienceOutcomeRows[Number(String(matchedId).replace("cert-", ""))]?.outcomeId;

      if (experienceOutcomeId) {
        details.push({ cuny_outcome_id: cunyOutcomeId, experience_outcome_id: experienceOutcomeId, notes });
      }
    });
  });

  const response = await fetch("/api/match-details/bulk-replace", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ match_id: matchId, details }),
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    throw new Error(errorBody?.error || "Failed to save match details");
  }
};
