import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(express.json());

// Gemini API Proxy
app.post("/api/ai/generate", async (req, res) => {
  const { prompt } = req.body;
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: "GEMINI_API_KEY is not configured on the server." });
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    res.json({ text });
  } catch (error: any) {
    console.error("Gemini Error:", error);
    res.status(500).json({ error: error.message || "Failed to generate content" });
  }
});

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", env: process.env.NODE_ENV });
});

// For local development
if (process.env.NODE_ENV !== "production") {
  const PORT = 3000;
  async function setupVite() {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  }
  setupVite();
}

export default app;
