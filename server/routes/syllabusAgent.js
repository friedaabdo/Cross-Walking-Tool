import { Router } from "express";
import { DefaultAzureCredential } from "@azure/identity";
import { AIProjectClient } from "@azure/ai-projects";

const router = Router();

const MAX_SYLLABUS_CHARS = 200_000;

let openaiClient = null;

// Created on first request because dotenv.config() runs after the route modules are imported.
const getOpenAIClient = () => {
  openaiClient ??= new AIProjectClient(
    process.env.FOUNDRY_PROJECT_ENDPOINT,
    new DefaultAzureCredential(),
  ).getOpenAIClient();
  return openaiClient;
};

// Agents often wrap JSON in a ```json fence or add a sentence around it.
export const extractJson = (text) => {
  const candidates = [text.trim()];
  const fenced = /```(?:json)?\s*([\s\S]*?)```/i.exec(text);
  if (fenced) candidates.push(fenced[1].trim());

  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start !== -1 && end > start) candidates.push(text.slice(start, end + 1));

  for (const candidate of candidates) {
    try {
      return JSON.parse(candidate);
    } catch {
      // try the next candidate
    }
  }

  return null;
};

router.post("/parse", async (req, res) => {
  const text = typeof req.body?.text === "string" ? req.body.text.trim() : "";

  if (!text) {
    return res.status(400).json({ error: "text is required" });
  }

  if (text.length > MAX_SYLLABUS_CHARS) {
    return res.status(413).json({ error: "Syllabus text is too long" });
  }

  if (!process.env.FOUNDRY_PROJECT_ENDPOINT || !process.env.FOUNDRY_AGENT_NAME) {
    console.error("Set FOUNDRY_PROJECT_ENDPOINT and FOUNDRY_AGENT_NAME in .env, then restart the API.");
    return res.status(503).json({
      error: "the syllabus agent isn't configured on the server (FOUNDRY_PROJECT_ENDPOINT / FOUNDRY_AGENT_NAME)",
    });
  }

  let outputText;

  try {
    const response = await getOpenAIClient().responses.create(
      { input: text },
      { body: { agent_reference: { name: process.env.FOUNDRY_AGENT_NAME, type: "agent_reference" } } },
    );
    outputText = response.output_text ?? "";
  } catch (err) {
    console.error("Foundry agent call failed:", err);
    const signInProblem = /Credential|Authentication/i.test(`${err?.name} ${err?.cause?.name}`);
    return res.status(502).json({
      error: signInProblem
        ? "The server isn't signed in to Azure. Run az login, then restart the API from a new terminal."
        : "Failed to reach the syllabus agent",
    });
  }

  const result = extractJson(outputText);

  if (!result) {
    console.error("Syllabus agent did not return JSON:", outputText);
    return res.status(502).json({ error: "The syllabus agent did not return valid JSON" });
  }

  return res.json({ result });
});

export default router;
