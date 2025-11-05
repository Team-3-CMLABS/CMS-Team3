import express from "express";
import mysql from "mysql2/promise";
import dotenv from "dotenv";
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

// 🔹 Get semua content model dan kontennya
router.get("/", async (req, res) => {
    try {
        const [models] = await pool.query("SELECT * FROM content_models ORDER BY id DESC");
        res.json(models);
    } catch (err) {
        res.status(500).json({ message: "Gagal memuat daftar konten" });
    }
});

// 🧩 GET model + fields + isi konten by slug
// 🧩 GET model + fields + isi konten by slug
router.get("/:slug", async (req, res) => {
    try {
        const { slug } = req.params;

        const [modelRows] = await pool.query(
            "SELECT * FROM content_models WHERE slug = ? LIMIT 1",
            [slug]
        );

        if (modelRows.length === 0)
            return res.status(404).json({ message: "Model not found" });

        const model = modelRows[0];

        const [fields] = await pool.query(
            "SELECT id, field_name, field_key, field_type FROM content_fields WHERE model_id = ? ORDER BY id ASC",
            [model.id]
        );

        const [contentRows] = await pool.query(
            "SELECT * FROM contents WHERE model_id = ? ORDER BY id DESC LIMIT 1",
            [model.id]
        );

        let contentData = {};
        if (contentRows.length > 0) {
            const raw = contentRows[0].data;
            contentData = typeof raw === "string" ? JSON.parse(raw) : raw; 
        }

        res.json({ model, fields, content: contentData });
    } catch (err) {
        console.error("fetch content error:", err);
        res.status(500).json({ message: "Error fetching content data" });
    }
});

// 🧩 SAVE / UPDATE isi konten
router.post("/:slug", async (req, res) => {
    try {
        const { slug } = req.params;
        const { data, status } = req.body;

        // ambil model id
        const [modelRows] = await pool.query(
            "SELECT id FROM content_models WHERE slug = ? LIMIT 1",
            [slug]
        );
        if (modelRows.length === 0)
            return res.status(404).json({ message: "Model not found" });

        const modelId = modelRows[0].id;

        // simpan ke tabel contents
        await pool.query(
            `INSERT INTO contents (model_id, data, status, created_at)
       VALUES (?, ?, ?, NOW())`,
            [modelId, JSON.stringify(data), status || "draft"]
        );

        res.json({ message: "Content saved successfully" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Gagal menyimpan konten" });
    }
});

export default router;
