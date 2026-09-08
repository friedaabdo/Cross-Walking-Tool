import { Router } from "express";
import { query } from "../db.js";

const router = Router();

//select all campuses
router.get("/", async (req, res) => {
  try {
    const result = await query(`
      SELECT 
        school_id,
        school_name
      FROM cuny_school
      ORDER BY school_name ASC
    `);

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch schools" });
  }
});


export default router;