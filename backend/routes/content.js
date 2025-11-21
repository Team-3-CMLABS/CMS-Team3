import express from "express";
import mysql from "mysql2/promise";
import dotenv from "dotenv";
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

// Middleware ambil user dari token
const verifyToken = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
        return res.status(401).json({ message: "Token tidak ditemukan" });
    }

    try {
        const token = authHeader.split(" ")[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(403).json({ message: "Token tidak valid" });
    }
};

// ===================== GET ALL CONTENT =====================
router.get("/", verifyToken, async (req, res) => {
    try {
        const { role, email } = req.user;

        let query = `
      SELECT 
        m.id AS model_id,
        m.name AS model_name,
        m.slug AS model_slug,
        m.type AS model_type,
        m.editor_email AS model_editor_email,
        COALESCE(c.id, 0) AS content_id,
        COALESCE(c.slug, m.slug) AS content_slug,
        COALESCE(c.status, 'draft') AS content_status,
        c.data AS content_data,
        c.updated_at,
        c.editor_email AS content_editor_email
      FROM content_models m
      LEFT JOIN contents c ON c.model_id = m.id
    `;

        let params = [];
        if (role === "editor") {
            query += " WHERE c.editor_email = ? OR m.editor_email = ?";
            params = [email, email];
        }

        query += " ORDER BY m.id ASC";

        const [rows] = await pool.query(query, params);

        // 🧩 Format hasil biar aman
        const formatted = rows.map((r) => {
            let parsedData = {};
            try {
                parsedData =
                    typeof r.content_data === "string"
                        ? JSON.parse(r.content_data)
                        : r.content_data || {};
            } catch {
                parsedData = {};
            }

            return {
                id: r.model_id,
                model: r.model_name,
                slug: r.content_slug,
                type: r.model_type,
                status: r.content_status,
                data: parsedData,
                editor_email: r.content_editor_email || r.model_editor_email || null,
                updated_at: r.updated_at,
            };
        });

        res.json({ contents: formatted });
    } catch (err) {
        console.error("Error fetching contents:", err);
        res.status(500).json({ message: "Database error" });
    }
});

// ===================== GET CONTENT BY SLUG =====================
router.get("/:slug", async (req, res) => {
    try {
        const { slug } = req.params;
        console.log("📥 GET content slug:", slug);

        // ambil model
        const [modelRows] = await pool.query(
            "SELECT * FROM content_models WHERE slug = ?",
            [slug]
        );
        if (!modelRows.length)
            return res.status(404).json({ message: "Model not found" });

        const model = modelRows[0];

        // ambil semua field dari model_id
        const [fields] = await pool.query(
            `SELECT 
    id,
    field_name AS label,
    LOWER(field_name) AS name,
    field_type AS type
  FROM content_fields
  WHERE model_id = ?
  ORDER BY id ASC`,
            [model.id]
        );

        // ambil konten terakhir
        const [contentRows] = await pool.query(
            "SELECT * FROM contents WHERE model_id = ? ORDER BY id DESC LIMIT 1",
            [model.id]
        );

        // jika belum ada konten
        if (!contentRows.length) {
            return res.json({
                model,
                fields,
                content: {
                    id: null,
                    slug,
                    status: "draft",
                    raw: {},
                },
            });
        }

        let contentData = {};
        try {
            contentData =
                typeof contentRows[0].data === "string"
                    ? JSON.parse(contentRows[0].data)
                    : contentRows[0].data || {};
        } catch {
            contentData = {};
        }

        res.json({
            model,
            fields,
            content: {
                id: contentRows[0].id,
                slug: contentRows[0].slug,
                status: contentRows[0].status || "draft",
                raw: contentData,
            },
        });
    } catch (err) {
        console.error("Error get content:", err);
        res.status(500).json({ message: "Gagal mengambil konten" });
    }
});

// ===================== CREATE NEW CONTENT =====================
router.post("/:slug", verifyToken, async (req, res) => {
    try {
        const { slug } = req.params;
        const { data, status } = req.body;
        const editorEmail = req.user.email;

        const [modelRows] = await pool.query(
            "SELECT id FROM content_models WHERE slug = ? LIMIT 1",
            [slug]
        );
        if (!modelRows.length)
            return res.status(404).json({ message: "Model not found" });

        const modelId = modelRows[0].id;

        await pool.query(
            `INSERT INTO contents (model_id, slug, data, status, editor_email, created_at)
       VALUES (?, ?, ?, ?, ?, NOW())`,
            [modelId, slug, JSON.stringify(data), status || "draft", editorEmail]
        );

        res.json({ message: "Content saved successfully" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Gagal menyimpan konten" });
    }
});

// ===================== UPDATE CONTENT =====================
router.put("/:slug", async (req, res) => {
    try {
        const { slug } = req.params;
        const { data, status } = req.body;

        const [modelRows] = await pool.query(
            "SELECT id FROM content_models WHERE slug = ? LIMIT 1",
            [slug]
        );
        if (!modelRows.length)
            return res.status(404).json({ message: "Model not found" });

        const modelId = modelRows[0].id;

        // cek apakah sudah ada data sebelumnya
        const [existing] = await pool.query(
            "SELECT id, slug FROM contents WHERE model_id = ? ORDER BY id DESC LIMIT 1",
            [modelId]
        );

        if (existing.length) {
            // ✅ update konten dan isi slug kalau belum ada
            await pool.query(
                "UPDATE contents SET data = ?, status = ?, slug = IFNULL(slug, ?), updated_at = NOW() WHERE id = ?",
                [JSON.stringify(data), status || "published", slug, existing[0].id]
            );
        } else {
            // kalau belum ada, insert baru
            await pool.query(
                "INSERT INTO contents (model_id, slug, data, status, created_at) VALUES (?, ?, ?, ?, NOW())",
                [modelId, slug, JSON.stringify(data), status || "published"]
            );
        }

        res.json({ message: "Content updated successfully" });
    } catch (err) {
        console.error("Update error:", err);
        res.status(500).json({ message: "Gagal mengupdate konten" });
    }
});

// ===================== UPDATE STATUS SAJA =====================
router.patch("/:slug/status", async (req, res) => {
    try {
        const { slug } = req.params;
        const { status } = req.body;

        const validStatus = ["draft", "published", "archived"];
        if (!validStatus.includes(status))
            return res.status(400).json({ message: "Invalid status value" });

        const [modelRows] = await pool.query(
            "SELECT id FROM content_models WHERE slug = ? LIMIT 1",
            [slug]
        );
        if (!modelRows.length)
            return res.status(404).json({ message: "Model not found" });

        const modelId = modelRows[0].id;
        await pool.query(
            "UPDATE contents SET status = ?, updated_at = NOW() WHERE model_id = ?",
            [status, modelId]
        );

        res.json({ message: `✅ Status updated to '${status}'` });
    } catch (err) {
        console.error("Status update error:", err);
        res.status(500).json({ message: "Gagal memperbarui status konten" });
    }
});

export default router;
