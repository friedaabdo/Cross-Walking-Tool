//create matches route
import express from "express";
import { query } from "../db.js";

const router = express.Router();

// POST: Create a new match
router.post("/", async (req, res) => {
  const body = req.body ?? {};
  const experience_id = body.experience_id ?? body.experienceId;
  const course_id = body.course_id ?? body.courseId;

  if (!experience_id) {
    return res.status(400).json({ error: "experience_id is required" });
  }
  if (!course_id) {
    return res.status(400).json({ error: "course_id is required" });
  }

  try {
    const result = await query(
      `INSERT INTO Matches (course_id, experience_id)
       VALUES (?, ?)`,
      [course_id, experience_id]
    );

    res.status(201).json({
      match_id: result.insertId,
      course_id,
      experience_id,
      message: "Match created successfully",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create match" });
  }
});

export default router;

