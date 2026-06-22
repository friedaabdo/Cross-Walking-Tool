import express from "express";
import { query } from "../db.js";
const router = express.Router();

const parsePositiveInt = (value) => {
    const parsed = Number(value);
    return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
};

router.post("/bulk-replace", async (req, res) => {
    const body = req.body ?? {};
    const matchId = parsePositiveInt(body.match_id ?? body.matchId);
    const details = Array.isArray(body.details) ? body.details : [];

    if (!matchId) {
        return res.status(400).json({ error: "match_id is required" });
    }

    const normalizedDetails = details
        .map((item) => ({
            cunyOutcomeId: parsePositiveInt(item?.cuny_outcome_id ?? item?.cunyOutcomeId),
            experienceOutcomeId: parsePositiveInt(item?.experience_outcome_id ?? item?.experienceOutcomeId),
            notes: String(item?.notes ?? ""),
        }))
        .filter((item) => item.cunyOutcomeId && item.experienceOutcomeId);

    try {
        await query("DELETE FROM Match_Outcome_Details WHERE match_id = ?", [matchId]);

        for (const detail of normalizedDetails) {
            await query(
                `INSERT INTO Match_Outcome_Details (match_id, cuny_outcome_id, experience_outcome_id, notes)
                 VALUES (?, ?, ?, ?)`,
                [matchId, detail.cunyOutcomeId, detail.experienceOutcomeId, detail.notes]
            );
        }

        return res.status(201).json({
            message: "Match details saved successfully",
            matchId,
            insertedCount: normalizedDetails.length,
        });
    } catch (error) {
        console.error("Error saving match details:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
});

export default router;
