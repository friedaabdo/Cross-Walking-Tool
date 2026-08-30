import { Router } from "express";
import { query } from "../db.js";

const router = Router();


//select all departments by specific school
router.get("/:schoolid", async (req, res) => {
  try {
    const { schoolid } = req.params;

    const sql = `
      SELECT 
        department_id,
        department_name,
        department_code
      FROM Department
      WHERE school_id = ?
      ORDER BY department_name ASC
    `;

    const result = await query(sql, [schoolid]);
    const rows = result.rows; // Extract the rows from the result

    if (rows.length === 0) {
      return res.status(404).json({ error: "Departments not found" });
    }

    res.json(rows); // Return all departments for that school
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch Departments" });
  }
});



export default router;