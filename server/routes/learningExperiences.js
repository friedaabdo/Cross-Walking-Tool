import { Router } from "express";
import { query } from "../db.js";

const router = Router();

router.get("/", async (_req, res) => {
  try {
    const result = await query(
      `SELECT experience_id AS experienceId, user_id, title, description, link, last_edited AS created_at, last_edited AS updated_at
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
      `SELECT experience_id AS experienceId, user_id, title, description, link, last_edited AS created_at, last_edited AS updated_at
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
      `SELECT experience_id AS experienceId, user_id, title, description, link, last_edited AS created_at, last_edited AS updated_at
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
  const {
    title,
    description = "",
    link = "",
    userId = null,
    is_template = 0,
  } = req.body ?? {};

  if (!title || !String(title).trim()) {
    return res.status(400).json({ error: "title is required" });
  }

  const templateFlag = Number(Boolean(is_template));

  try {
    const experienceResult = await query(
      `INSERT INTO Learning_Experience (user_id, title, description, link, is_template)
       VALUES (?, ?, ?, ?, ?)`,
      [userId, String(title).trim(), String(description), String(link), templateFlag]
    );

    const experienceId = experienceResult.insertId;

    return res.status(201).json({
      experienceId,
      user_id: userId,
      title: String(title).trim(),
      description: String(description),
      link: String(link),
      is_template: templateFlag,
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
      experienceId,
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

router.put("/:experienceId", async (req, res) => {
  const experienceId = req.params?.experienceId;
  const {
    title,
    description = "",
    link = "",
    userId = null,
    is_template = 0,
  } = req.body ?? {};

  if (!experienceId) {
    return res.status(400).json({ error: "experience id is required" });
  }

  if (!title || !String(title).trim()) {
    return res.status(400).json({ error: "title is required" });
  }

  try {
    await query(
      `UPDATE Learning_Experience
       SET user_id = ?, title = ?, description = ?, link = ?, is_template = ?
       WHERE experience_id = ?`,
      [
        userId,
        String(title).trim(),
        String(description),
        String(link),
        Number(Boolean(is_template)),
        experienceId,
      ]
    );

    return res.json({
      experienceId: Number(experienceId),
      user_id: userId,
      title: String(title).trim(),
      description: String(description),
      link: String(link),
      is_template: Number(Boolean(is_template)),
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to update learning experience" });
  }
});



export default router;
