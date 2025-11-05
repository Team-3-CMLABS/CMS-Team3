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

// 🧩 CREATE MODEL
router.post("/model", async (req, res) => {
    try {
        const { name, type } = req.body;
        if (!name || !type)
            return res.status(400).json({ message: "Name dan type wajib diisi" });

        const slug = name.toLowerCase().replace(/\s+/g, "-");
        const apiEndpoint = `/api/content/${slug}`;

        // 🔍 Cek duplikat slug
        const [check] = await pool.query(
            "SELECT id FROM content_models WHERE slug = ?",
            [slug]
        );
        if (check.length > 0) {
            return res
                .status(400)
                .json({ message: `Model "${name}" sudah ada. Gunakan nama lain.` });
        }

        // lanjut insert kalau aman
        const [result] = await pool.query(
            `INSERT INTO content_models (name, slug, type, api_endpoint, created_at)
       VALUES (?, ?, ?, ?, NOW())`,
            [name, slug, type, apiEndpoint]
        );

        const modelId = result.insertId;

        // Tambahkan default fields dan konten seperti sebelumnya...
        res.status(201).json({
            message: "Content model berhasil dibuat",
            model: {
                id: modelId,
                name,
                slug,
                type,
                api_endpoint: apiEndpoint,
            },
        });
    } catch (err) {
        console.error("createModel error:", err);
        res.status(500).json({
            message: err.message || "Gagal membuat model",
        });
    }
});

// 🧩 TAMBAH FIELD BARU
router.post("/field", async (req, res) => {
    try {
        const { model_id, label, field_type } = req.body;
        const field_key = label
            .toLowerCase()
            .replace(/\s+/g, "_")
            .replace(/[^a-z0-9_]/g, ""); // buat API ID otomatis

        const [result] = await pool.query(
            `INSERT INTO content_fields (model_id, field_name, field_key, field_type, is_required, \`order\`)
       VALUES (?, ?, ?, ?, 0, 0)`,
            [model_id, label, field_key, field_type]
        );

        res.json({
            message: "Field created successfully",
            field: {
                id: result.insertId,
                field_name: label,
                field_key, // << ini dikirim balik ke FE
                field_type,
            },
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to create field" });
    }
});

// 🧩 HAPUS FIELD
router.delete("/field/:id", async (req, res) => {
    try {
        const { id } = req.params;

        if (!id || id === "undefined" || id === "null") {
            console.error("❌ Invalid field ID:", id);
            return res.status(400).json({ message: "ID field tidak valid" });
        }

        const [result] = await pool.query(`DELETE FROM content_fields WHERE id = ?`, [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Field tidak ditemukan" });
        }

        res.json({ message: "Field berhasil dihapus" });
    } catch (err) {
        console.error("deleteField error:", err);
        res.status(500).json({ message: "Gagal menghapus field" });
    }
});

// 🧩 UPDATE MODEL (konfigurasi)
// PUT /model/:id
router.put("/model/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const { name, slug, type, api_endpoint } = req.body;

        await pool.query(
            `UPDATE content_models 
       SET name = ?, slug = ?, type = ?, api_endpoint = ? 
       WHERE id = ?`,
            [name, slug, type, api_endpoint, id]
        );

        res.json({ message: "Model updated successfully" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Gagal memperbarui model" });
    }
});

// DELETE MODEL
router.delete("/model/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const [result] = await pool.query("DELETE FROM content_models WHERE id = ?", [id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Model tidak ditemukan" });
        }
        res.json({ message: "Model berhasil dihapus" });
    } catch (err) {
        console.error("deleteModel error:", err);
        res.status(500).json({ message: "Gagal menghapus model" });
    }
});

export default router;
