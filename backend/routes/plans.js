import express from "express";
import mysql from "mysql2/promise";
import dotenv from "dotenv";
dotenv.config();

const router = express.Router();

// 🔗 Pool koneksi database
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
});

// ✅ GET semua plan
router.get("/", async (req, res) => {
    try {
        const [rows] = await pool.query("SELECT * FROM plans");
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Gagal memuat daftar plan" });
    }
});

// ✅ GET plan by ID
router.get("/:id", async (req, res) => {
    try {
        const [rows] = await pool.query("SELECT * FROM plans WHERE id = ?", [req.params.id]);
        if (rows.length === 0) return res.status(404).json({ message: "Plan tidak ditemukan" });
        res.json(rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Gagal memuat data plan" });
    }
});

export default router;
