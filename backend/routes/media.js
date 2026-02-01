import express from "express";
import multer from "multer";
import mysql from "mysql2/promise";
import dotenv from "dotenv";
import path from "path";
import fs from "fs";
import jwt from "jsonwebtoken";

dotenv.config();

const router = express.Router();

// ===== DATABASE POOL =====
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  ssl: {
    rejectUnauthorized: false
  }
});

// ===== UPLOAD FOLDER =====
const uploadDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

// ===== MULTER STORAGE =====
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});
const upload = multer({ storage });

// ===== JWT VERIFICATION =====
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

// ===== GET MEDIA (bisa filter by slug) =====
router.get("/", verifyToken, async (req, res) => {
  try {
    const { slug } = req.query; // FE bisa request ?slug=...
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
      WHERE 1
    `;

    const params = [];

    if (slug) {
      query += " AND m.content_slug = ?";
      params.push(slug);
    }

    if (user.role !== "admin") {
      query += " AND (cm.editor_email = ? OR cm.editor_email IS NULL)";
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

// ===== POST UPLOAD MEDIA (support multiple files) =====
router.post("/upload", verifyToken, upload.array("files"), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: "File wajib diunggah" });
    }

    const { model_id = null, content_slug = null } = req.body;
    const uploadedBy = req.user?.id || null;
    const uploadedEmail = req.user?.email || null;

    const results = [];

    for (const file of req.files) {
      const fileUrl = `/api/uploads/${file.filename}`;

      const [result] = await pool.query(
        `INSERT INTO media_assets 
         (filename, url, file_type, uploaded_by, uploaded_email, model_id, content_slug)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [file.filename, fileUrl, file.mimetype, uploadedBy, uploadedEmail, model_id, content_slug]
      );

      results.push({
        id: result.insertId,
        filename: file.filename,
        url: fileUrl,
        model_id,
        content_slug
      });
    }

    res.json({ message: "Upload berhasil", files: results });
  } catch (err) {
    console.error("upload error:", err);
    res.status(500).json({ message: "Upload gagal" });
  }
});

// ===== DELETE MEDIA =====
router.delete("/:id", verifyToken, async (req, res) => {
  try {
    const mediaId = Number(req.params.id);
    if (isNaN(mediaId)) return res.status(400).json({ message: "ID tidak valid" });

    const [rows] = await pool.query("SELECT * FROM media_assets WHERE id=?", [mediaId]);
    if (!rows.length) return res.status(404).json({ message: "Media tidak ditemukan" });

    const media = rows[0];

    // editor hanya bisa hapus media yang ia upload
    if (req.user.role !== "admin" && req.user.email !== media.uploaded_email) {
      return res.status(403).json({ message: "Tidak punya izin menghapus media ini" });
    }

    // hapus file fisik
    const filePath = path.join(uploadDir, path.basename(media.url));
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

    // hapus data di DB
    await pool.query("DELETE FROM media_assets WHERE id=?", [mediaId]);

    res.json({ message: "Deleted" });
  } catch (err) {
    console.error("delete media error:", err);
    res.status(500).json({ message: "Gagal menghapus media" });
  }
});

export default router;