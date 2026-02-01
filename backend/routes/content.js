import express from "express";
import mysql from "mysql2/promise";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import multer from "multer";
import path from "path";
import fs from "fs";

dotenv.config();

const router = express.Router();

/* ===================== DATABASE ===================== */
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

/* ===================== MULTER CONFIG ===================== */
const uploadPath = "uploads";
if (!fs.existsSync(uploadPath)) fs.mkdirSync(uploadPath);

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadPath),
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        const filename = `${Date.now()}-${Math.random().toString(36).substring(2)}${ext}`;
        cb(null, filename);
    },
});
const upload = multer({ storage });

/* ===================== AUTH MIDDLEWARE ===================== */
const verifyToken = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) return res.status(401).json({ message: "Token tidak ditemukan" });
    try {
        const token = authHeader.split(" ")[1];
        req.user = jwt.verify(token, process.env.JWT_SECRET);
        next();
    } catch {
        return res.status(403).json({ message: "Token tidak valid" });
    }
};

/* ===================== GET ALL CONTENT ===================== */
router.get("/", verifyToken, async (req, res) => {
    try {
        const { role, email, id } = req.user;

        let query = `
            SELECT DISTINCT
                m.id AS model_id,
                m.name AS model_name,
                m.slug AS model_slug,
                m.type AS model_type,
                m.editor_email AS model_editor_email,
                m.slug AS slug,
                COALESCE(c.status, 'draft') AS content_status,
                c.data AS content_data,
                c.updated_at
            FROM content_models m
            LEFT JOIN contents c ON c.model_id = m.id
            LEFT JOIN model_collaborators mc ON mc.model_id = m.id
            LEFT JOIN collaborators col ON col.id = mc.collaborator_id
        `;

        const params = [];

        if (role === "editor") {
            query += `
                WHERE
                    m.editor_email = ?
                    OR c.editor_email = ?
                    OR (col.user_id = ? AND col.status = 'Active')
            `;
            params.push(email, email, id);
        }

        query += " ORDER BY m.id ASC";

        const [rows] = await pool.query(query, params);

        const formatted = rows.map((r) => {
            let parsedData = {};
            try {
                parsedData = typeof r.content_data === "string"
                    ? JSON.parse(r.content_data)
                    : r.content_data || {};
            } catch {
                parsedData = {};
            }

            return {
                id: r.model_id,
                model: r.model_name,
                slug: r.slug,
                status: r.content_status,
                data: parsedData,
                editor_email: r.model_editor_email,
                updated_at: r.updated_at,
            };
        });

        res.json({ contents: formatted });
    } catch (err) {
        console.error("GET CONTENT ERROR:", err);
        res.status(500).json({ message: "Database error" });
    }
});

/* ===================== GET CONTENT BY SLUG ===================== */
router.get("/:slug", async (req, res) => {
    try {
        const { slug } = req.params;
        const [modelRows] = await pool.query("SELECT * FROM content_models WHERE slug = ?", [slug]);
        if (!modelRows.length) return res.status(404).json({ message: "Model not found" });
        const model = modelRows[0];

        const [fields] = await pool.query(
            `SELECT field_name AS label, REPLACE(LOWER(field_name), ' ', '_') AS name, field_type AS type
             FROM content_fields WHERE model_id = ? ORDER BY id ASC`,
            [model.id]
        );

        const [contentRows] = await pool.query(
            "SELECT * FROM contents WHERE model_id = ? ORDER BY id DESC LIMIT 1",
            [model.id]
        );

        let contentData = { status: "draft", raw: {} };
        if (contentRows.length) {
            let raw = {};
            try { raw = typeof contentRows[0].data === "string" ? JSON.parse(contentRows[0].data) : contentRows[0].data; } catch { raw = {}; }
            contentData = { status: contentRows[0].status, raw };
        }

        res.json({ model, fields, content: contentData });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Gagal mengambil konten" });
    }
});

/* ===================== HELPER FUNCTION ===================== */
const canManageContent = async (user) => {
    if (user.role === "admin") return true;

    if (user.role === "editor") {
        const [rows] = await pool.query(
            `SELECT posisi FROM collaborators WHERE email = ? LIMIT 1`,
            [user.email]
        );

        if (!rows.length) return false;
        return rows[0].posisi === "Owner";
    }

    return false;
};

/* ===================== SAVE MEDIA TO LIBRARY ===================== */
const saveMediaToLibrary = async (files, userId, modelId, contentSlug) => {
    if (!files || !files.length) return;

    const values = files.map(file => [
        file.filename,
        `/uploads/${file.filename}`,
        file.mimetype,
        userId,
        modelId,
        contentSlug
    ]);

    await pool.query(
        `INSERT INTO media_assets 
        (filename, url, file_type, uploaded_by, model_id, content_slug)
        VALUES ?`,
        [values]
    );
};

/* ===================== CREATE CONTENT ===================== */
router.post("/:slug", verifyToken, upload.any(), async (req, res) => {
    try {
        const allowed = await canManageContent(req.user);
        if (!allowed) {
            return res.status(403).json({
                message: "Anda tidak memiliki izin untuk menambahkan content",
            });
        }

        const { slug } = req.params;
        const status = req.body.status || "draft";

        const [modelRows] = await pool.query("SELECT id, editor_email FROM content_models WHERE slug = ?", [slug]);
        if (!modelRows.length) return res.status(404).json({ message: "Model not found" });
        const model = modelRows[0];
        const editorEmail = model.editor_email || req.user.email;

        const data = {};
        Object.keys(req.body).forEach(key => {
            if (key === "status") return;
            try { data[key] = JSON.parse(req.body[key]); } catch { data[key] = req.body[key]; }
        });

        if (req.files?.length) {
            req.files.forEach((file) => {
                if (!data[file.fieldname]) data[file.fieldname] = [];
                if (!Array.isArray(data[file.fieldname])) data[file.fieldname] = [data[file.fieldname]];
                data[file.fieldname].push(`/uploads/${file.filename}`);
            });
            // 🔥 SIMPAN KE MEDIA LIBRARY
            await saveMediaToLibrary(req.files, req.user.id, model.id, slug);
        }

        await pool.query(
            "INSERT INTO contents (model_id, data, status, editor_email, created_at) VALUES (?, ?, ?, ?, NOW())",
            [model.id, JSON.stringify(data), status, editorEmail]
        );

        res.json({ message: "Content saved", data });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Gagal menyimpan konten" });
    }
});

/* ===================== UPDATE CONTENT ===================== */
router.put("/:slug", verifyToken, upload.any(), async (req, res) => {
    try {
        const allowed = await canManageContent(req.user);
        if (!allowed) {
            return res.status(403).json({
                message: "Anda tidak memiliki izin untuk mengedit content",
            });
        }

        const { slug } = req.params;
        const status = req.body.status || "draft";

        const [modelRows] = await pool.query("SELECT id, editor_email FROM content_models WHERE slug = ?", [slug]);
        if (!modelRows.length) return res.status(404).json({ message: "Model not found" });
        const model = modelRows[0];
        const editorEmail = model.editor_email || req.user.email;

        const [existingRows] = await pool.query(
            "SELECT id, data FROM contents WHERE model_id = ? ORDER BY id DESC LIMIT 1",
            [model.id]
        );

        let oldData = {};
        if (existingRows.length) {
            try { oldData = typeof existingRows[0].data === "string" ? JSON.parse(existingRows[0].data) : existingRows[0].data; } catch { oldData = {}; }
        }

        const data = { ...oldData };
        Object.keys(req.body).forEach(key => {
            if (key !== "status") {
                try { data[key] = JSON.parse(req.body[key]); } catch { data[key] = req.body[key]; }
            }
        });

        if (req.files?.length) {
            req.files.forEach((file) => {
                if (!data[file.fieldname]) data[file.fieldname] = [];
                if (!Array.isArray(data[file.fieldname])) data[file.fieldname] = [data[file.fieldname]];
                data[file.fieldname].push(`/uploads/${file.filename}`);
            });
            await saveMediaToLibrary(req.files, req.user.id, model.id, slug);
        }

        if (existingRows.length) {
            await pool.query(
                "UPDATE contents SET data = ?, status = ?, updated_at = NOW(), editor_email = ? WHERE id = ?",
                [JSON.stringify(data), status, editorEmail, existingRows[0].id]
            );
        } else {
            await pool.query(
                "INSERT INTO contents (model_id, data, status, editor_email, created_at) VALUES (?, ?, ?, ?, NOW())",
                [model.id, JSON.stringify(data), status, editorEmail]
            );
        }

        res.json({ message: "Content updated successfully", data });
    } catch (err) {
        console.error("Update error:", err);
        res.status(500).json({ message: "Gagal mengupdate konten" });
    }
});

export default router;