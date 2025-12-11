import express from "express";
import mysql from "mysql2/promise";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";

dotenv.config();
const router = express.Router();

// ===== KONEKSI DATABASE =====
const db = await mysql.createConnection({
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASS || "",
    database: process.env.DB_NAME || "cms_team3",
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

// ===== GET Semua Project + Collaborators =====
router.get("/", verifyToken, async (req, res) => {
    try {
        const { role, id } = req.user;
        const id_user = id;
        const roleLower = role.toLowerCase();

        let query = `
            SELECT 
                p.*, 
                c.id AS collab_id, 
                u.nama_user AS collab_name, 
                u.email AS collab_email, 
                c.posisi, 
                c.status AS collab_status,
                u.id_user AS collaborator_user_id
            FROM projects p
            LEFT JOIN project_collaborators pc ON p.id = pc.project_id
            LEFT JOIN collaborators c ON pc.collaborator_id = c.id
            LEFT JOIN users u ON c.user_id = u.id_user
        `;

        const params = [];

        // ADMIN → lihat semua
        if (roleLower === "admin") {
            query += ` ORDER BY p.last_update DESC`;
        }

        // EDITOR → lihat semua project yang dia terlibat 
        else if (roleLower === "editor") {
            query += `
                WHERE u.id_user = ?
                ORDER BY p.last_update DESC
            `;
            params.push(id_user);
        }

        else {
            query += `
                WHERE u.id_user = ?
                ORDER BY p.last_update DESC
            `;
            params.push(id_user);
        }

        // Jalankan query
        const [rows] = await db.query(query, params);
        const result = [];
        const map = {};

        rows.forEach((row) => {
            if (!map[row.id]) {
                map[row.id] = { ...row, collaborators: [] };

                delete map[row.id].collab_id;
                delete map[row.id].collab_name;
                delete map[row.id].collab_email;
                delete map[row.id].posisi;
                delete map[row.id].collab_status;
                delete map[row.id].collaborator_user_id;

                result.push(map[row.id]);
            }

            if (row.collab_id) {
                map[row.id].collaborators.push({
                    id: row.collab_id,
                    name: row.collab_name,
                    email: row.collab_email,
                    posisi: row.posisi,
                    status: row.collab_status
                });
            }
        });

        res.json(result);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Gagal mengambil data project" });
    }
});

// ===== GET Detail Project =====
router.get("/:id", async (req, res) => {
    try {
        const [rows] = await db.query(`
      SELECT 
        p.*, 
        c.id AS collab_id, 
        u.nama_user AS collab_name, 
        u.email AS collab_email, 
        c.posisi, 
        c.status AS collab_status
      FROM projects p
      LEFT JOIN project_collaborators pc ON p.id = pc.project_id
      LEFT JOIN collaborators c ON pc.collaborator_id = c.id
      LEFT JOIN users u ON c.user_id = u.id_user
      WHERE p.id = ?
    `, [req.params.id]);

        if (rows.length === 0)
            return res.status(404).json({ message: "Project tidak ditemukan" });

        const project = { ...rows[0], collaborators: [] };
        delete project.collab_id;
        delete project.collab_name;
        delete project.collab_email;
        delete project.posisi;
        delete project.collab_status;

        rows.forEach((r) => {
            if (r.collab_id)
                project.collaborators.push({
                    id: r.collab_id,
                    name: r.collab_name,
                    email: r.collab_email,
                    posisi: r.posisi,
                    status: r.collab_status,
                });
        });

        res.json(project);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Gagal mengambil project detail" });
    }
});

// ===== POST Tambah Project =====
router.post("/", async (req, res) => {
    try {
        const { name, status } = req.body;
        const [result] = await db.query(
            "INSERT INTO projects (name, status, last_update) VALUES (?, ?, NOW())",
            [name, status || ""]
        );
        res.json({ message: "Project berhasil ditambahkan", id: result.insertId });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Gagal menambahkan project" });
    }
});

// ===== PUT Update Project =====
router.put("/:id", async (req, res) => {
    const { id } = req.params;
    const { status, name } = req.body;

    try {
        const sets = [];
        const params = [];

        if (name) {
            sets.push("name = ?");
            params.push(name);
        }
        if (status) {
            sets.push("status = ?");
            params.push(status);
        }

        if (sets.length === 0)
            return res.status(400).json({ message: "Tidak ada field untuk diupdate" });

        const sql = `UPDATE projects SET ${sets.join(", ")}, last_update = NOW() WHERE id = ?`;
        params.push(id);

        await db.query(sql, params);

        res.json({ message: "Project berhasil diperbarui" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Gagal update project" });
    }
});

// ===== DELETE Project ===== 
router.delete("/:id", async (req, res) => {
    try {
        await db.query("DELETE FROM projects WHERE id = ?", [req.params.id]);
        res.json({ message: "Project beserta relasinya berhasil dihapus" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Gagal menghapus project" });
    }
});

// ===== Tambahkan Collaborator ke Project =====
router.post("/:id/add-collaborator", async (req, res) => {
    try {
        const { id } = req.params; // id project
        let { collaborator_ids, collaborator_id } = req.body;

        // kalau frontend cuma kirim "collaborator_id" tunggal
        if (!Array.isArray(collaborator_ids)) {
            collaborator_ids = collaborator_id ? [collaborator_id] : [];
        }

        if (collaborator_ids.length === 0) {
            return res.status(400).json({ message: "Tidak ada collaborator yang dikirim" });
        }

        for (const collabId of collaborator_ids) {
            await db.query(
                "INSERT INTO project_collaborators (project_id, collaborator_id) VALUES (?, ?)",
                [id, collabId]
            );
        }

        res.json({ message: "Collaborator berhasil ditambahkan ke project" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Gagal menambahkan collaborator ke project" });
    }
});

// ===== Hapus Collaborator dari Project =====
router.post("/:id/remove-collaborator", async (req, res) => {
    try {
        const { collaborator_id } = req.body;
        const projectId = req.params.id;

        await db.query(
            "DELETE FROM project_collaborators WHERE project_id = ? AND collaborator_id = ?",
            [projectId, collaborator_id]
        );

        res.json({ message: "Collaborator berhasil dihapus dari project" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Gagal menghapus collaborator dari project" });
    }
});

export default router;
