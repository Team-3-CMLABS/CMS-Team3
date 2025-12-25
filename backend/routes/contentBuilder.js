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

export const verifyToken = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
        return res.status(401).json({ message: "Token tidak ditemukan" });
    }

    const token = authHeader.split(" ")[1];
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // simpan { id, email, role }
        next();
    } catch (err) {
        return res.status(403).json({ message: "Token tidak valid" });
    }
};

// 🧩 GET ALL MODELS + CONTENT (FILTER BY ROLE)
router.get("/", verifyToken, async (req, res) => {
    try {
        const { role, email, id } = req.user;
        const { type } = req.query;

        let query = `
      SELECT DISTINCT
  m.id,
  m.name AS model,
  m.slug,
  m.type,
  m.api_endpoint,
  m.editor_email AS model_editor,
  m.created_at AS model_created_at,
  c.id AS content_id,
  c.status,
  c.editor_email AS content_editor,
  c.created_at
      FROM content_models m
      LEFT JOIN contents c ON c.model_id = m.id
      LEFT JOIN model_collaborators mc ON mc.model_id = m.id
      LEFT JOIN collaborators col ON col.id = mc.collaborator_id
    `;

        const conditions = [];
        const params = [];

        if (type) {
            conditions.push("m.type = ?");
            params.push(type);
        }

        if (role === "editor") {
            conditions.push(`
        (
          m.editor_email = ?
          OR c.editor_email = ?
          OR (col.user_id = ? AND col.status = 'Active')
        )
      `);
            params.push(email, email, id);
        }

        if (conditions.length) {
            query += " WHERE " + conditions.join(" AND ");
        }

        query += " ORDER BY m.created_at DESC";

        const [rows] = await pool.query(query, params);

        const formatted = rows.map(r => ({
            id: r.id,
            model: r.model,
            slug: r.slug,
            type: r.type,
            api_endpoint: r.api_endpoint,
            status: r.status || "draft",
            editor_email: r.model_editor || r.content_editor || null,
            created_at: r.created_at,
        }));

        res.json({ contents: formatted });
    } catch (err) {
        console.error("getAllModels error:", err);
        res.status(500).json({ message: "Gagal mengambil data model" });
    }
});

// 🧩 HELPER FUNCTION
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

// 🧩 CREATE MODEL
router.post("/model", verifyToken, async (req, res) => {
    try {
        const allowed = await canManageContent(req.user);
        if (!allowed) {
            return res.status(403).json({
                message: "Anda tidak memiliki izin untuk membuat model",
            });
        }

        const { name, type, multiLang = false, seo = false, workflow = false } = req.body;
        const editorEmail = req.user.email; // 🧩 ambil dari token login

        const slug = name.toLowerCase().replace(/\s+/g, "-");
        const apiEndpoint = `/api/content/${slug}`;

        const [check] = await pool.query("SELECT id FROM content_models WHERE slug = ?", [slug]);
        if (check.length > 0)
            return res.status(400).json({ message: `Model "${name}" sudah ada.` });

        const [result] = await pool.query(
            `INSERT INTO content_models 
       (name, slug, type, api_endpoint, multiLang, seo, workflow, editor_email, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
            [name, slug, type, apiEndpoint, multiLang ? 1 : 0, seo ? 1 : 0, workflow ? 1 : 0, editorEmail]
        );

        res.status(201).json({
            message: "Content model berhasil dibuat",
            model: {
                id: result.insertId,
                name,
                slug,
                type,
                api_endpoint: apiEndpoint,
                editor_email: editorEmail,
            },
        });
    } catch (err) {
        console.error("createModel error:", err);
        res.status(500).json({ message: "Gagal membuat model" });
    }
});

// 🧩 UPDATE MODEL (konfigurasi)
router.put("/model/:id", verifyToken, async (req, res) => {
    try {
        const allowed = await canManageContent(req.user);
        if (!allowed) {
            return res.status(403).json({
                message: "Anda tidak memiliki izin untuk memperbarui model",
            });
        }

        const { id } = req.params;
        const { name, type, multiLang, seo, workflow } = req.body;

        // 🔁 Generate otomatis kalau tidak dikirim dari FE
        const slug = name ? name.toLowerCase().replace(/\s+/g, "-") : null;
        const apiEndpoint = slug ? `/api/content/${slug}` : null;

        // 🔍 Ambil data lama dulu supaya kalau field kosong, tetap pakai nilai lama
        const [rows] = await pool.query("SELECT * FROM content_models WHERE id = ?", [id]);
        if (rows.length === 0) {
            return res.status(404).json({ message: "Model tidak ditemukan" });
        }
        const old = rows[0];

        const finalName = name || old.name;
        const finalSlug = slug || old.slug;
        const finalType = type || old.type;
        const finalApi = apiEndpoint || old.api_endpoint;

        // 🧩 Update ke DB
        await pool.query(
            `UPDATE content_models 
       SET name = ?, slug = ?, type = ?, api_endpoint = ?, 
           multiLang = ?, seo = ?, workflow = ? 
       WHERE id = ?`,
            [
                finalName,
                finalSlug,
                finalType,
                finalApi,
                multiLang ? 1 : 0,
                seo ? 1 : 0,
                workflow ? 1 : 0,
                id,
            ]
        );

        res.json({ message: "Model updated successfully" });
    } catch (err) {
        console.error("updateModel error:", err);
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

// 🧩 TAMBAH FIELD BARU
router.post("/field", verifyToken, async (req, res) => {
    try {
        const { model_id, label, field_type } = req.body;
        const editorEmail = req.user.email;

        const field_key = label
            .toLowerCase()
            .replace(/\s+/g, "_")
            .replace(/[^a-z0-9_]/g, "");

        const [result] = await pool.query(
            `INSERT INTO content_fields (model_id, field_name, field_key, field_type, is_required, \`order\`, editor_email)
             VALUES (?, ?, ?, ?, 0, 0, ?)`,
            [model_id, label, field_key, field_type, editorEmail]
        );

        res.json({ message: "Field created", id: result.insertId });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to create field" });
    }
});


// 🧩 HAPUS FIELD
router.delete("/field/:id", verifyToken, async (req, res) => {
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

// 🧩 GET FIELD BY ID
router.get("/field/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const [rows] = await pool.query("SELECT * FROM content_fields WHERE id = ?", [id]);

        if (rows.length === 0)
            return res.status(404).json({ message: "Field tidak ditemukan" });

        res.json({ field: rows[0] });
    } catch (err) {
        console.error("getFieldById error:", err);
        res.status(500).json({ message: "Gagal mengambil data field" });
    }
});

// 🧩 UPDATE FIELD
router.put("/field/:id", verifyToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { field_name, field_key, field_type, is_required, order } = req.body;

        const [result] = await pool.query(
            `UPDATE content_fields 
             SET field_name = ?, field_key = ?, field_type = ?, is_required = ?, 
                 editor_email = ?, \`order\` = ? 
             WHERE id = ?`,
            [
                field_name,
                field_key,
                field_type,
                is_required ? 1 : 0,
                req.user.email,
                order || 0,
                id,
            ]
        );

        if (result.affectedRows === 0)
            return res.status(404).json({ message: "Field tidak ditemukan" });

        res.json({ message: "Field berhasil diperbarui" });
    } catch (err) {
        console.error("updateField error:", err);
        res.status(500).json({ message: "Gagal memperbarui field" });
    }
});

// 🧩 GET MODEL BY ID
router.get("/model/:id", async (req, res) => {
    try {
        const { id } = req.params;

        const [rows] = await pool.query("SELECT * FROM content_models WHERE id = ?", [id]);
        if (rows.length === 0) {
            return res.status(404).json({ message: "Model tidak ditemukan" });
        }

        const model = rows[0];
        res.json({ model });
    } catch (err) {
        console.error("getModel error:", err);
        res.status(500).json({ message: "Gagal mengambil data model" });
    }
});

// 🧩 GET MODEL, FIELDS, DAN CONTENT BERDASARKAN SLUG
router.get("/content/:slug", async (req, res) => {
    try {
        const { slug } = req.params;

        // 🔍 Ambil model berdasarkan slug
        const [models] = await pool.query("SELECT * FROM content_models WHERE slug = ?", [slug]);
        if (models.length === 0) {
            return res.status(404).json({ message: "Model tidak ditemukan" });
        }

        const model = models[0];

        // 🔍 Ambil daftar field berdasarkan model_id
        const [fields] = await pool.query(
            "SELECT id, field_name, field_key, field_type, editor_email, is_required, `order` FROM content_fields WHERE model_id = ? ORDER BY `order` ASC",
            [model.id]
        );

        // 🔍 Ambil konten (jika ada) dari tabel contents
        const [contents] = await pool.query(
            "SELECT id, slug, data, status, created_at, updated_at FROM contents WHERE model_id = ? LIMIT 1",
            [model.id]
        );

        let contentData = null;
        if (contents.length > 0) {
            let parsedData = {};
            const rawData = contents[0].data;

            try {
                // kalau sudah object, langsung pakai
                if (typeof rawData === "object") {
                    parsedData = rawData;
                } else if (typeof rawData === "string" && rawData.trim() !== "") {
                    parsedData = JSON.parse(rawData);
                } else {
                    parsedData = {};
                }
            } catch (e) {
                console.warn("⚠️ JSON parse gagal, isi bukan JSON valid:", rawData);
                parsedData = {};
            }

            contentData = {
                id: contents[0].id,
                slug: contents[0].slug,
                status: contents[0].status,
                data: parsedData,
            };
        }

        res.json({
            model,
            fields,
            content: contentData,
        });
    } catch (err) {
        console.error("getContentBySlug error:", err);
        res.status(500).json({ message: "Gagal mengambil data konten" });
    }
});

export default router;
