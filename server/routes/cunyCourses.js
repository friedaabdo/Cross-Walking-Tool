import { Router } from "express";
import { query } from "../db.js";

const router = Router();

router.get("/", async (_req, res) => {
  try {
    const result = await query(
      `SELECT course_id AS courseId, department_id, user_id, title, description, syllabus_file_names AS syllabus_file_name, syllabus_file_url, last_edited AS created_at, last_edited AS updated_at
       FROM CUNY_Course
       ORDER BY last_edited DESC`
    );

    res.json(result.rows);
  } catch {
    res.status(500).json({ error: "Failed to fetch CUNY courses" });
  }
});

// GET: CUNY course by ID
router.get("/:courseId", async (req, res) => {
  try {
    const { courseId } = req.params;
    const result = await query(
      `SELECT course_id AS courseId, department_id, user_id, title, description, syllabus_file_names AS syllabus_file_name, syllabus_file_url, last_edited AS created_at, last_edited AS updated_at
       FROM CUNY_Course
       WHERE course_id = ?`,
      [courseId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "CUNY course not found" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch CUNY course" });
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
    courseCode = "",
    experienceId = null,
  } = req.body ?? {};

  if (!title || !String(title).trim()) {
    return res.status(400).json({ error: "title is required" });
  }

  if (!String(courseCode ?? "").trim()) {
    return res.status(400).json({ error: "courseCode is required" });
  }

  try {
    const result = await query(
      `INSERT INTO CUNY_Course (department_id, user_id, course_code, title, description, syllabus_file_names, syllabus_file_url)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        departmentId,
        userId,
        String(courseCode ?? "").trim() || "",
        String(title).trim(),
        String(description),
        String(syllabusFileName),
        String(syllabusFileUrl),
      ]
    );

    const courseId = Number(result.insertId);

    if (experienceId) {
      try {
        await query(
          `INSERT INTO Matches (course_id, experience_id) VALUES (?, ?)`,
          [courseId, Number(experienceId)]
        );
      } catch {
        // optional relation is not required to create the course itself
      }
    }

    return res.status(201).json({
      courseId,
      department_id: departmentId,
      user_id: userId,
      course_code: String(courseCode ?? "").trim() || "",
      title: String(title).trim(),
      description: String(description),
      syllabus_file_name: String(syllabusFileName),
      syllabus_file_url: String(syllabusFileUrl),
    });
  } catch {
    return res.status(500).json({ error: "Failed to create CUNY course" });
  }
});

router.put("/:courseId", async (req, res) => {
  const courseId = req.params?.courseId;
  const {
    title = "",
    description = "",
    syllabusFileName = "",
    syllabusFileUrl = "",
    departmentId = null,
    userId = null,
  } = req.body ?? {};

  if (!courseId) {
    return res.status(400).json({ error: "course id is required" });
  }

  try {
    await query(
      `UPDATE CUNY_Course
       SET department_id = ?, user_id = ?, title = ?, description = ?, syllabus_file_names = ?, syllabus_file_url = ?
       WHERE course_id = ?`,
      [
        departmentId,
        userId,
        String(title).trim(),
        String(description),
        String(syllabusFileName),
        String(syllabusFileUrl),
        courseId,
      ]
    );

    return res.json({
      courseId: Number(courseId),
      department_id: departmentId,
      user_id: userId,
      title: String(title).trim(),
      description: String(description),
      syllabus_file_name: String(syllabusFileName),
      syllabus_file_url: String(syllabusFileUrl),
      message: "CUNY course updated successfully",
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to update CUNY course" });
  }
});

export default router;
