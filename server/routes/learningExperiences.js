import { Router } from "express";
import { query } from "../db.js";

const router = Router();

router.get("/", async (_req, res) => {
  try {
    const result = await query(
      `SELECT experience_id AS experience_id, user_id, title, description, link, last_edited AS created_at, last_edited AS updated_at
       FROM Learning_Experience
       ORDER BY last_edited DESC`
    );

    res.json(result.rows);
  } catch {
    res.status(500).json({ error: "Failed to fetch learning experiences" });
  }
});

// GET only templates
router.get("/templates", async (_req, res) => {
  try {
    const result = await query(
      // return `id` for consistency with other endpoints

      `SELECT experience_id AS experience_id, user_id, title, description, link, last_edited AS created_at, last_edited AS updated_at
       FROM Learning_Experience
       WHERE is_template = 1
       ORDER BY last_edited DESC`
    );

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch template learning experiences" });
  }
});


router.get("/:experience_id", async (req, res) => {
  try {
    const experienceId = req.params.experience_id;
    const experienceResult = await query(
      `SELECT experience_id AS experience_id, user_id, title, description, link, last_edited AS created_at, last_edited AS updated_at
       FROM Learning_Experience
       WHERE experience_id = ?`,
      [experienceId]
    );

    if (!experienceResult.rows.length) {
      return res.status(404).json({ error: "Learning experience not found" });
    }

    return res.status(200).json(experienceResult.rows[0]);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to fetch learning experience" });
  }
});


router.post("/", async (req, res) => {
  const { title, description = "", link = "", userId = null } = req.body ?? {};

  if (!title || !String(title).trim()) {
    return res.status(400).json({ error: "title is required" });
  }

  try {
    const experienceResult = await query(
      `INSERT INTO Learning_Experience (user_id, title, description, link, is_template)
       VALUES (?, ?, ?, ?, ?)`,
      [userId, String(title).trim(), String(description), String(link), 0]
    );

    const experienceId = experienceResult.insertId;

    

    return res.status(201).json({
      id: experienceId,
      user_id: userId,
      title: String(title).trim(),
      description: String(description),
      link: String(link),
      is_template: 0,
      last_edited: new Date(),
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to create learning experience" });
  }
});

router.post("/create-template", async (req, res) => {
  const { title, description = "", link = "", outcomes = [], userId = null } = req.body ?? {};

  if (!title || !String(title).trim()) {
    return res.status(400).json({ error: "title is required" });
  }

  try {
    // Insert the learning experience
    const experienceResult = await query(
      `INSERT INTO Learning_Experience (user_id, title, description, link, is_template)
       VALUES (?, ?, ?, ?, ?)`,
      [userId, String(title).trim(), String(description), String(link), 1]
    );

    const experienceId = experienceResult.insertId;

    // Insert each outcome from the parsed sections
    for (const section of outcomes) {
      const header = section.header ?? "";
      const lines = section.lines ?? [];

      for (const line of lines) {
        await query(
          `INSERT INTO Outcome (experience_id, outcome_text, category)
           VALUES (?, ?, ?)`,
          [experienceId, String(line).trim(), String(header)]
        );
      }
    }

    return res.status(201).json({
      id: experienceId,
      user_id: userId,
      title: String(title).trim(),
      description: String(description),
      link: String(link),
      outcomesCount: outcomes.reduce((sum, sec) => sum + (sec.lines?.length ?? 0), 0),
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to create learning experience" });
  }

  
});



export default router;
