import { Router } from "express";
import { query, pool } from "../db.js";

const router = Router();

const parsePositiveInt = (value) => {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
};

const getOutcomeParent = (body = {}) => {
  const courseId = parsePositiveInt(body.courseId ?? body.cunyCourseId);
  const experienceId = parsePositiveInt(body.experienceId ?? body.learningExperienceId);

  if (Boolean(courseId) === Boolean(experienceId)) {
    return { courseId: null, experienceId: null };
  }

  return { courseId, experienceId };
};

const normalizeOutcomes = (outcomes) => {
  if (!Array.isArray(outcomes)) {
    return null;
  }

  return outcomes
    .map((item, index) => ({
      outcomeText: String(item?.outcomeText ?? item?.text ?? "").trim(),
      category: String(item?.category ?? "").trim(),
      index,
    }))
    .filter((item) => item.outcomeText.length > 0);
};

// Saved crosswalk links (Match_Outcome_Details) point at outcome ids, and outcomes are listed in id order. So the outcomes are
// re-created in the new order, then each saved link is re-attached to the new outcome that has the same text, or failing that
// the one in the same position (an edited outcome keeps its links). Links to outcomes that no longer exist are dropped.
const mapOldOutcomesToNew = (oldOutcomes, newOutcomes) => {
  const newIdByOldId = new Map();
  const claimedNewIndexes = new Set();

  oldOutcomes.forEach((oldOutcome) => {
    const index = newOutcomes.findIndex((item, i) => !claimedNewIndexes.has(i) && item.outcomeText === oldOutcome.outcomeText);
    if (index >= 0) {
      claimedNewIndexes.add(index);
      newIdByOldId.set(oldOutcome.outcomeId, newOutcomes[index].outcomeId);
    }
  });

  oldOutcomes.forEach((oldOutcome, position) => {
    if (!newIdByOldId.has(oldOutcome.outcomeId) && position < newOutcomes.length && !claimedNewIndexes.has(position)) {
      claimedNewIndexes.add(position);
      newIdByOldId.set(oldOutcome.outcomeId, newOutcomes[position].outcomeId);
    }
  });

  return newIdByOldId;
};

export const replaceOutcomesInTransaction = async (connection, { courseId = null, experienceId = null, outcomes }) => {
  const parentColumn = courseId ? "course_id" : "experience_id";
  const linkColumn = courseId ? "cuny_outcome_id" : "experience_outcome_id";
  const parentId = courseId ?? experienceId;

  const [oldRows] = await connection.execute(
    `SELECT outcome_id AS outcomeId, outcome_text AS outcomeText FROM Outcome WHERE ${parentColumn} = ? ORDER BY outcome_id ASC`,
    [parentId]
  );
  const [savedLinks] = oldRows.length
    ? await connection.execute(
        `SELECT * FROM Match_Outcome_Details WHERE ${linkColumn} IN (${oldRows.map(() => "?").join(",")})`,
        oldRows.map((row) => row.outcomeId)
      )
    : [[]];

  if (savedLinks.length) {
    await connection.execute(
      `DELETE FROM Match_Outcome_Details WHERE ${linkColumn} IN (${oldRows.map(() => "?").join(",")})`,
      oldRows.map((row) => row.outcomeId)
    );
  }

  await connection.execute(`DELETE FROM Outcome WHERE ${parentColumn} = ?`, [parentId]);

  const newOutcomes = [];
  for (const item of outcomes) {
    const [result] = await connection.execute(
      `INSERT INTO Outcome (course_id, experience_id, outcome_text, category) VALUES (?, ?, ?, ?)`,
      [courseId, experienceId, item.outcomeText, item.category || null]
    );
    newOutcomes.push({ outcomeId: Number(result.insertId), outcomeText: item.outcomeText });
  }

  const newIdByOldId = mapOldOutcomesToNew(oldRows, newOutcomes);
  for (const link of savedLinks) {
    const newId = newIdByOldId.get(link[linkColumn]);
    if (newId) {
      await connection.execute(
        `INSERT INTO Match_Outcome_Details (match_id, cuny_outcome_id, experience_outcome_id, notes) VALUES (?, ?, ?, ?)`,
        [
          link.match_id,
          courseId ? newId : link.cuny_outcome_id,
          courseId ? link.experience_outcome_id : newId,
          link.notes,
        ]
      );
    }
  }

  const [rows] = await connection.execute(
    `SELECT outcome_id AS id, course_id, experience_id, outcome_text, category FROM Outcome WHERE ${parentColumn} = ? ORDER BY outcome_id ASC`,
    [parentId]
  );

  return rows;
};

const replaceOutcomes = async (params) => {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();
    const rows = await replaceOutcomesInTransaction(connection, params);
    await connection.commit();
    return rows;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

router.get("/", async (req, res) => {
  const { courseId, experienceId } = getOutcomeParent(req.query);

  if (!courseId && !experienceId) {
    return res.status(400).json({
      error: "Provide exactly one of courseId/cunyCourseId or experienceId/learningExperienceId",
    });
  }

  try {
    const result = await query(
      `SELECT outcome_id AS outcomeId, course_id AS courseId, experience_id AS experienceId, outcome_text AS outcomeText, category
       FROM Outcome
       WHERE (? IS NULL OR course_id = ?)
         AND (? IS NULL OR experience_id = ?)
       ORDER BY outcome_id ASC`,
      [courseId, courseId, experienceId, experienceId]
    );

    return res.json(result.rows);
  } catch {
    return res.status(500).json({ error: "Failed to fetch outcomes" });
  }
});

router.post("/bulk-replace", async (req, res) => {
  const { courseId, experienceId } = getOutcomeParent(req.body);
  const outcomes = normalizeOutcomes(req.body?.outcomes);

  if (!courseId && !experienceId) {
    return res.status(400).json({
      error: "Provide exactly one of courseId/cunyCourseId or experienceId/learningExperienceId",
    });
  }

  if (!outcomes) {
    return res.status(400).json({ error: "outcomes must be an array" });
  }

  try {
    const result = await replaceOutcomes({ courseId, experienceId, outcomes });
    return res.status(201).json(result);
  } catch {
    return res.status(500).json({ error: "Failed to save outcomes" });
  }
});

router.post("/course", async (req, res) => {
  const courseId = parsePositiveInt(req.body?.courseId);
  const outcomes = normalizeOutcomes(req.body?.outcomes);

  if (!courseId) {
    return res.status(400).json({ error: "courseId is required" });
  }

  if (!outcomes) {
    return res.status(400).json({ error: "outcomes must be an array" });
  }

  try {
    const result = await replaceOutcomes({ courseId, outcomes });
    return res.status(201).json(result);
  } catch {
    return res.status(500).json({ error: "Failed to save course outcomes" });
  }
});

export default router;