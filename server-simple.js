import express from "express";
import cors from "cors";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3001;

// Storage directory
const STORAGE_DIR = path.join(__dirname, ".server-data");
const CONFIG_FILE = path.join(STORAGE_DIR, "config.json");
const CSV_DIR = path.join(STORAGE_DIR, "csv");

// Ensure directories exist
if (!fs.existsSync(STORAGE_DIR)) {
  fs.mkdirSync(STORAGE_DIR, { recursive: true });
}
if (!fs.existsSync(CSV_DIR)) {
  fs.mkdirSync(CSV_DIR, { recursive: true });
}

// Middleware
app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Serve static files from dist (for production)
app.use(express.static(path.join(__dirname, "dist")));

/**
 * GET /config - Read global config
 */
app.get("/config", (req, res) => {
  try {
    if (fs.existsSync(CONFIG_FILE)) {
      const data = fs.readFileSync(CONFIG_FILE, "utf-8");
      res.json({ success: true, data: JSON.parse(data) });
    } else {
      res.json({ success: true, data: null });
    }
  } catch (error) {
    console.error("Error reading config:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /config - Save global config
 */
app.post("/config", (req, res) => {
  try {
    const config = req.body;
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2), "utf-8");
    res.json({ success: true, data: config });
  } catch (error) {
    console.error("Error saving config:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /csv/:category - Read CSV for category
 */
app.get("/csv/:category", (req, res) => {
  try {
    const category = decodeURIComponent(req.params.category);
    const csvPath = path.join(CSV_DIR, `${category}.csv`);

    if (fs.existsSync(csvPath)) {
      const data = fs.readFileSync(csvPath, "utf-8");
      res.json({ success: true, data });
    } else {
      res.json({ success: true, data: null });
    }
  } catch (error) {
    console.error("Error reading CSV:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /csv/:category - Save/Upload CSV for category
 */
app.post("/csv/:category", (req, res) => {
  try {
    const category = decodeURIComponent(req.params.category);
    const { csvContent } = req.body;

    if (!csvContent) {
      return res.status(400).json({ success: false, error: "CSV content is required" });
    }

    const csvPath = path.join(CSV_DIR, `${category}.csv`);
    fs.writeFileSync(csvPath, csvContent, "utf-8");
    res.json({ success: true, data: { category, fileName: `${category}.csv` } });
  } catch (error) {
    console.error("Error saving CSV:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * DELETE /csv/:category - Delete CSV for category
 */
app.delete("/csv/:category", (req, res) => {
  try {
    const category = decodeURIComponent(req.params.category);
    const csvPath = path.join(CSV_DIR, `${category}.csv`);

    if (fs.existsSync(csvPath)) {
      fs.unlinkSync(csvPath);
    }

    res.json({ success: true, data: null });
  } catch (error) {
    console.error("Error deleting CSV:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /health - Health check
 */
app.get("/health", (req, res) => {
  res.json({ success: true, message: "Server is running" });
});

/**
 * Serve index.html for all other routes (SPA fallback)
 */
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "dist", "index.html"));
});

// Start server
app.listen(PORT, () => {
  console.log(`✓ Server running on http://localhost:${PORT}`);
  console.log(`✓ Storage directory: ${STORAGE_DIR}`);
  console.log(`✓ CSV directory: ${CSV_DIR}`);
});
