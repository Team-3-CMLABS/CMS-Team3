import express from "express";
import multer from "multer";
import mysql from "mysql2/promise";
import dotenv from "dotenv";
import path from "path";
import fs from "fs";
import jwt from "jsonwebtoken";

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

// middleware to verify JWT token
const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer "))
    return res.status(401).json({ message: "Token tidak ditemukan" });

  try {
    const token = authHeader.split(" ")[1];
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    return res.status(403).json({ message: "Token tidak valid" });
  }
};

// ✅ GET semua media + uploader
router.get("/", verifyToken, async (req, res) => {
  try {
    const user = req.user; 
    let query = `
      SELECT
        m.id,
        m.filename,
        m.url,
        m.created_at,
        m.content_slug,
        cm.name AS content_name,
        cm.editor_email,
        u.nama_user AS editor_name
      FROM media_assets m
      LEFT JOIN content_models cm ON cm.id = m.model_id
      LEFT JOIN users u 
        ON u.email COLLATE utf8mb4_general_ci = cm.editor_email
    `;

    const params = [];

    if (user.role !== "admin") {
      query += " WHERE cm.editor_email = ?";
      params.push(user.email);
    }

    query += " ORDER BY m.created_at DESC";

    const [rows] = await pool.query(query, params);

    res.json({
      total: rows.length,
      media: rows.map(item => ({
        id: item.id,
        filename: item.filename,
        url: item.url,
        content_slug: item.content_slug,
        created_at: item.created_at,
        uploader: item.editor_email
          ? {
            name: item.editor_name || item.editor_email,
            email: item.editor_email,
          }
          : null,
      })),
    });
  } catch (err) {
    console.error("get media error:", err);
    res.status(500).json({ message: "Gagal memuat media" });
  }
});

// ✅ POST upload file
router.post("/upload", verifyToken, upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "File wajib diunggah" });
    }

    const uploadedBy = req.user?.id || null;
    const uploadedEmail = req.user?.email || null;

    const fileUrl = `/api/uploads/${req.file.filename}`;

    const [result] = await pool.query(
      `INSERT INTO media_assets 
   (filename, url, file_type, uploaded_by, uploaded_email)
   VALUES (?, ?, ?, ?, ?)`,
      [
        req.file.filename,
        fileUrl,
        req.file.mimetype,
        uploadedBy,
        uploadedEmail,
      ]
    );

    res.json({
      id: result.insertId,
      filename: req.file.filename,
      url: fileUrl,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Upload gagal" });
  }
});

// ✅ DELETE file
router.delete("/:id", verifyToken, async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM media_assets WHERE id=?", [req.params.id]);
    if (!rows.length) return res.status(404).json({ message: "Not found" });

    const media = rows[0];

    // editor hanya bisa hapus media yang ia upload
    if (req.user.role !== "admin" && req.user.email !== media.uploaded_email) {
      return res.status(403).json({ message: "Tidak punya izin menghapus media ini" });
    }

    fs.unlinkSync(path.join(uploadDir, media.filename));
    await pool.query("DELETE FROM media_assets WHERE id=?", [req.params.id]);

    res.json({ message: "Deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Gagal menghapus media" });
  }
});

export default router;
