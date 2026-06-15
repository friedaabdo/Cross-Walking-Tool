import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import { query } from "./db.js";
import learningExperiencesRouter from "./routes/learningExperiences.js";
import cunyCoursesRouter from "./routes/cunyCourses.js";
import outcomesRouter from "./routes/outcomes.js";

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT || 4000);

app.use(cors());
app.use(express.json({ limit: "10mb" }));

app.get("/api/health", async (_req, res) => {
  try {
    await query("SELECT 1");
    res.json({ ok: true });
  } catch {
    res.status(500).json({ ok: false, error: "Database connection failed" });
  }
});
app.use("/api/learning-experiences", learningExperiencesRouter);
app.use("/api/cuny-courses", cunyCoursesRouter);
app.use("/api/outcomes", outcomesRouter);

app.listen(PORT, () => {
  console.log(`API server listening on http://localhost:${PORT}`);
});
