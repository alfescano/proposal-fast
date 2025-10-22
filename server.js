import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());

// Serve static files from dist directory (React build output)
app.use(express.static(path.join(__dirname, "dist")));

// API routes would go here (for future backend functionality)
// app.post("/api/custom-endpoint", async (req, res) => { ... });

// Fallback: serve index.html for all non-API routes (SPA routing)
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "dist", "index.html"));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`ProposalFast server running on port ${PORT}`);
  console.log(`Visit http://localhost:${PORT}`);
});