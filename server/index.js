import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import { query } from "./db.js";
import learningExperiencesRouter from "./routes/learningExperiences.js";
import cunyCoursesRouter from "./routes/cunyCourses.js";
import outcomesRouter from "./routes/outcomes.js";
import matchesRouter from "./routes/matches.js";
import matchDetailsRouter from "./routes/matchDetails.js";

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
app.use("/api/matches", matchesRouter);
app.use("/api/match-details", matchDetailsRouter);

// Temporary debug endpoint to list mounted routes (safe to remove later) ------

const listRoutes = () => {
  const routes = [];
  app._router.stack.forEach((middleware) => {
    if (middleware.route) {
      const methods = Object.keys(middleware.route.methods).join(",");
      routes.push({ path: middleware.route.path, methods });
    } else if (middleware.name === "router" && middleware.handle && middleware.handle.stack) {
      middleware.handle.stack.forEach((handler) => {
        if (handler.route) {
          const methods = Object.keys(handler.route.methods).join(",");
          routes.push({ path: handler.route.path, methods });
        }
      });
    }
  });
  return routes;
};

app.get('/api/_routes', (_req, res) => {
  res.json(listRoutes());
});

// --------------------------------------------------------------

app.listen(PORT, () => {
  console.log(`API server listening on http://localhost:${PORT}`);
});
