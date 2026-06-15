import { Router } from "express";
import { query } from "../db.js";

const router = Router();

router.get("/", async (_req, res) => {
  try {
    const result = await query(
      `SELECT course_id AS id, department_id, user_id, title, description, syllabus_file_names AS syllabus_file_name, syllabus_file_url, last_edited AS created_at, last_edited AS updated_at
       FROM CUNY_Course
       ORDER BY last_edited DESC`
    );

    res.json(result.rows);
  } catch {
    res.status(500).json({ error: "Failed to fetch CUNY courses" });
  }
});

router.post("/", async (req, res) => {
  const {
    title,
    description = "",
    syllabusFileName = "",
    syllabusFileUrl = "",
    departmentId = null,
    userId = null,
  } = req.body ?? {};

  if (!title || !String(title).trim()) {
    return res.status(400).json({ error: "title is required" });
  }

  try {
    const result = await query(
      `INSERT INTO CUNY_Course (department_id, user_id, title, description, syllabus_file_names, syllabus_file_url)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        departmentId,
        userId,
        String(title).trim(),
        String(description),
        String(syllabusFileName),
        String(syllabusFileUrl),
      ]
    );

    return res.status(201).json({
      id: result.insertId,
      department_id: departmentId,
      user_id: userId,
      title: String(title).trim(),
      description: String(description),
      syllabus_file_name: String(syllabusFileName),
      syllabus_file_url: String(syllabusFileUrl),
    });
  } catch {
    return res.status(500).json({ error: "Failed to create CUNY course" });
  }
});

export default router;
