import express from "express";
import mysql from "mysql2/promise";
import dotenv from "dotenv";
dotenv.config();

const router = express.Router();

// 🔗 Koneksi pool ke database
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

// ✅ Ambil semua notifikasi (urut terbaru dulu)
router.get("/", async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT * FROM notifications ORDER BY created_at DESC"
    );
    res.json(rows);
  } catch (err) {
    console.error("Gagal ambil notifikasi:", err);
    res.status(500).json({ error: "Gagal mengambil notifikasi" });
  }
});

// ✅ Tambah notifikasi baru
router.post("/", async (req, res) => {
  const { message, userId } = req.body;
  try {
    const [result] = await pool.query(
      "INSERT INTO notifications (message, userId) VALUES (?, ?)",
      [message, userId || null]
    );
    const [newNotif] = await pool.query(
      "SELECT * FROM notifications WHERE id = ?",
      [result.insertId]
    );
    res.status(201).json(newNotif[0]);
  } catch (err) {
    console.error("Gagal tambah notifikasi:", err);
    res.status(500).json({ error: "Gagal membuat notifikasi" });
  }
});

// ✅ Tandai notifikasi sudah dibaca
router.put("/:id/read", async (req, res) => {
  try {
    await pool.query("UPDATE notifications SET read_status = 1 WHERE id = ?", [req.params.id]);
    res.json({ message: "Notifikasi ditandai dibaca" });
  } catch (err) {
    console.error("Gagal update notifikasi:", err);
    res.status(500).json({ error: "Gagal memperbarui status" });
  }
});

// ✅ Tandai notifikasi belum dibaca
router.put("/:id/unread", async (req, res) => {
  try {
    await pool.query("UPDATE notifications SET read_status = 0 WHERE id = ?", [req.params.id]);
    res.json({ message: "Notifikasi ditandai belum dibaca" });
  } catch (err) {
    console.error("Gagal update notifikasi:", err);
    res.status(500).json({ error: "Gagal memperbarui status" });
  }
});

// ✅ Hapus notifikasi tertentu
router.delete("/:id", async (req, res) => {
  try {
    await pool.query("DELETE FROM notifications WHERE id = ?", [req.params.id]);
    res.json({ message: "Notifikasi dihapus" });
  } catch (err) {
    console.error("Gagal hapus notifikasi:", err);
    res.status(500).json({ error: "Gagal menghapus notifikasi" });
  }
});

// ✅ Hapus semua notifikasi
router.delete("/", async (req, res) => {
  try {
    await pool.query("DELETE FROM notifications");
    res.json({ message: "Semua notifikasi dihapus" });
  } catch (err) {
    console.error("Gagal hapus semua notifikasi:", err);
    res.status(500).json({ error: "Gagal menghapus semua notifikasi" });
  }
});

export default router;
