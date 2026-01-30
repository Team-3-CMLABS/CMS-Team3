import express from "express";
import mysql from "mysql2/promise";
import dotenv from "dotenv";
dotenv.config();

const router = express.Router();

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

// 🔹 Ambil semua metode pembayaran
router.get("/", async (req, res) => {
    try {
        const [rows] = await pool.query("SELECT * FROM payment_methods ORDER BY id ASC");
        res.json(rows.map((r) => ({
            ...r,
            instructions: r.instructions ? JSON.parse(r.instructions) : [],
            number: r.number || null,
        })));
    } catch (err) {
        console.error("❌ Gagal ambil payment methods:", err);
        res.status(500).json({ message: "Gagal memuat metode pembayaran" });
    }
});

// 🔹 Tambah metode baru
router.post("/", async (req, res) => {
    const { category, provider, instructions } = req.body;
    try {
        const [result] = await pool.query(
            `INSERT INTO payment_methods (category, provider, number, instructions) VALUES (?, ?, ?, ?)`,
            [category, provider, JSON.stringify(instructions)]
        );
        res.json({ message: "Metode pembayaran berhasil ditambahkan", id: result.insertId });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Gagal menambahkan metode pembayaran" });
    }
});

// 🔹 Hapus metode pembayaran
router.delete("/:id", async (req, res) => {
    try {
        await pool.query("DELETE FROM payment_methods WHERE id = ?", [req.params.id]);
        res.json({ message: "Metode pembayaran berhasil dihapus" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Gagal menghapus metode pembayaran" });
    }
});

export default router;
