//create matches route
import express from "express";
import { query } from "../db.js";

const router = express.Router();

// POST: Create a new match
router.post("/", async (req, res) => {
  const body = req.body ?? {};
  const experienceId = body.experienceId ?? body.experience_id;
  const courseId = body.courseId ?? body.course_id;

  if (!experienceId) {
    return res.status(400).json({ error: "experienceId is required" });
  }
  if (!courseId) {
    return res.status(400).json({ error: "courseId is required" });
  }

  try {
    const result = await query(
      `INSERT INTO Matches (course_id, experience_id)
       VALUES (?, ?)`,
      [courseId, experienceId]
    );

    res.status(201).json({
      matchId: result.insertId,
      courseId,
      experienceId,
      message: "Match created successfully",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create match" });
  }
});

router.get("/", async (req, res) => {
  try {
    const result = await query(
      `SELECT match_id AS matchId, course_id AS courseId, experience_id AS experienceId FROM Matches`
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch matches" });
  }
});

// GET: matches by experienceId (path param or query)
router.get("/equivalency/:experienceId", async (req, res) => {
  const experienceId = req.params.experienceId ?? req.query.experienceId ?? req.params.experience_id ?? req.query.experience_id;

  if (!experienceId) {
    return res.status(400).json({ error: "experienceId is required" });
  }

  try {
    const result = await query(
      `SELECT match_id AS matchId, course_id AS courseId FROM Matches WHERE experience_id = ?`,
      [experienceId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch matches for experience" });
  }
});

export default router;

