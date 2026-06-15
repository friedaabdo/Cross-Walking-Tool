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

router.get("/", async (req, res) => {
  const { courseId, experienceId } = getOutcomeParent(req.query);

  if (!courseId && !experienceId) {
    return res.status(400).json({
      error: "Provide exactly one of courseId/cunyCourseId or experienceId/learningExperienceId",
    });
  }

  try {
    const result = await query(
      `SELECT outcome_id AS id, course_id, experience_id, outcome_text, category
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

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    await connection.execute(
      `DELETE FROM Outcome
       WHERE (? IS NULL OR course_id = ?)
         AND (? IS NULL OR experience_id = ?)`,
      [courseId, courseId, experienceId, experienceId]
    );

    for (const item of outcomes) {
      await connection.execute(
        `INSERT INTO Outcome (course_id, experience_id, outcome_text, category)
         VALUES (?, ?, ?, ?)`,
        [courseId, experienceId, item.outcomeText, item.category || null]
      );
    }

    await connection.commit();

    const result = await connection.execute(
      `SELECT outcome_id AS id, course_id, experience_id, outcome_text, category
       FROM Outcome
       WHERE (? IS NULL OR course_id = ?)
         AND (? IS NULL OR experience_id = ?)
       ORDER BY outcome_id ASC`,
      [courseId, courseId, experienceId, experienceId]
    );

    return res.status(201).json(result[0]);
  } catch {
    await connection.rollback();
    return res.status(500).json({ error: "Failed to save outcomes" });
  } finally {
    connection.release();
  }
});

export default router;