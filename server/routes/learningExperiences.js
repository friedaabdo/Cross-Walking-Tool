import { Router } from "express";
import { query } from "../db.js";

const router = Router();

// router.get("/", async (_req, res) => {
//   try {
//     const result = await query(
//       `SELECT experience_id AS id, user_id, title, description, link, last_edited AS created_at, last_edited AS updated_at
//        FROM Learning_Experience
//        ORDER BY last_edited DESC`
//     );

//     res.json(result.rows);
//   } catch {
//     res.status(500).json({ error: "Failed to fetch learning experiences" });
//   }
// });

// help me
router.post("/create-template", async (req, res) => {
  const { title, description = "", link = "", userId = null } = req.body ?? {};

  if (!title || !String(title).trim()) {
    return res.status(400).json({ error: "title is required" });
  }

  try {
    const result = await query(
      `INSERT INTO Learning_Experience (user_id, title, description, link)
       VALUES (?, ?, ?, ?)`,
      [userId, String(title).trim(), String(description), String(link)]
    );

    return res.status(201).json({
      id: result.insertId,
      user_id: userId,
      title: String(title).trim(),
      description: String(description),
      link: String(link),
    });
  } catch {
    return res.status(500).json({ error: "Failed to create learning experience" });
  }
});

export default router;
