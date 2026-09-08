import { Router } from "express";
import { query } from "../db.js";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const result = await query(`
      SELECT
        tag_id,
        tag_name,
        category
      FROM Tag
      ORDER BY category IS NULL, category ASC, tag_name ASC
    `);

    const grouped = {};

    result.rows.forEach((row) => {
      const category = row.category || "Uncategorized";

      if (!grouped[category]) {
        grouped[category] = [];
      }

      grouped[category].push({
        tag_id: row.tag_id,
        tag_name: row.tag_name,
      });
    });

    res.json(grouped);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch tags" });
  }
});

export default router;
