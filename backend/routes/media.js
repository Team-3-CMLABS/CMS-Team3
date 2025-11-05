import express from "express";
import multer from "multer";
import mysql from "mysql2/promise";
import dotenv from "dotenv";
import path from "path";
import fs from "fs";
dotenv.config();

const router = express.Router();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

const uploadDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});
const upload = multer({ storage });

// ✅ POST upload file
router.post("/upload", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "File wajib diunggah" });
    const fileUrl = `/api/uploads/${req.file.filename}`;
    const [result] = await pool.query(
      "INSERT INTO media_assets (filename, url, file_type) VALUES (?, ?, ?)",
      [req.file.filename, fileUrl, req.file.mimetype]
    );
    res.status(201).json({ message: "Upload berhasil", id: result.insertId, url: fileUrl });
  } catch (err) {
    console.error("upload error:", err);
    res.status(500).json({ message: "Gagal upload file" });
  }
});

// ✅ GET semua file
router.get("/", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM media_assets ORDER BY created_at DESC");
    res.json(rows);
  } catch (err) {
    console.error("get media error:", err);
    res.status(500).json({ message: "Gagal memuat media" });
  }
});

export default router;
