import express from "express";
import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();
const router = express.Router();

// ======== KONEKSI DATABASE ========
const db = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASS || "",
  database: process.env.DB_NAME || "cms_team3",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// === GET Semua collaborator + daftar project yang diikuti ===
router.get("/", async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        c.id AS collaborator_id,
        u.nama_user AS name,
        u.email,
        c.posisi,
        c.status,
        p.id AS project_id,
        p.name AS project_name
      FROM collaborators c
      LEFT JOIN users u ON c.user_id = u.id_user
      LEFT JOIN project_collaborators pc ON c.id = pc.collaborator_id
      LEFT JOIN projects p ON pc.project_id = p.id
      ORDER BY c.id DESC
    `);

    // Gabungkan project yang sama ke satu collaborator
    const result = [];
    const map = {};

    rows.forEach(row => {
      if (!map[row.collaborator_id]) {
        map[row.collaborator_id] = {
          id: row.collaborator_id,
          name: row.name,
          email: row.email,
          posisi: row.posisi,
          status: row.status,
          project_id: row.project_id || null,
          projects: []
        };
        result.push(map[row.collaborator_id]);
      }

      if (row.project_id && row.project_name) {
        map[row.collaborator_id].projects.push({
          id: row.project_id,
          name: row.project_name
        });
      }
    });

    res.json({ message: "Daftar collaborators dengan projects", data: result });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Gagal mengambil data collaborators" });
  }
});

// === GET List semua projects ===
router.get("/projects", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT id, name FROM projects ORDER BY name ASC");
    res.json({ data: rows });
  } catch (err) {
    console.error("Error:", err);
    res.status(500).json({ message: "Gagal mengambil data projects" });
  }
});

// === POST Tambah collaborator baru ===
router.post("/", async (req, res) => {
  const { user_id, posisi, status } = req.body;
  try {
    const [existing] = await db.query(
      "SELECT id FROM collaborators WHERE user_id = ?",
      [user_id]
    );

    if (existing.length > 0)
      return res.status(400).json({ message: "User sudah jadi collaborator" });

    await db.query(
      "INSERT INTO collaborators (user_id, posisi, status) VALUES (?, ?, ?)",
      [user_id, posisi || "Collaborator", status || "Active"]
    );

    res.json({ message: "Collaborator berhasil ditambahkan" });
  } catch (err) {
    console.error("Error:", err);
    res.status(500).json({ message: "Gagal menambah collaborator" });
  }
});

// === PUT Edit collaborator ===
router.put("/:id", async (req, res) => {
  const { posisi, status, project_ids } = req.body;
  const { id } = req.params;

  console.log("🟣 Update collaborator:", id, { posisi, status, project_ids });

  const conn = await db.getConnection();

  try {
    await conn.beginTransaction();

    // Update posisi dan status
    if (posisi || status) {
      const updates = [];
      const values = [];

      if (posisi) {
        updates.push("posisi = ?");
        values.push(posisi);
      }
      if (status) {
        updates.push("status = ?");
        values.push(status);
      }

      values.push(id);

      await conn.query(`UPDATE collaborators SET ${updates.join(", ")} WHERE id = ?`, values);
    }

    // Update project assignments
    if (Array.isArray(project_ids)) {
      console.log("🔵 Updating projects:", project_ids);

      await conn.query("DELETE FROM project_collaborators WHERE collaborator_id = ?", [id]);

      if (project_ids.length > 0) {
        const values = project_ids.map((pid) => [id, pid]);
        await conn.query(
          "INSERT INTO project_collaborators (collaborator_id, project_id) VALUES ?",
          [values]
        );
      }
    } else {
      console.log("⚠️ Tidak ada project_ids yang dikirim");
    }

    await conn.commit();
    res.json({ message: "Collaborator dan project berhasil diperbarui" });

  } catch (err) {
    await conn.rollback();
    console.error("❌ Error update collaborator:", err);
    res.status(500).json({ message: "Gagal memperbarui collaborator", error: err.message });
  } finally {
    conn.release();
  }
});

// === DELETE collaborator ===
router.delete("/:id", async (req, res) => {
  try {
    await db.query("DELETE FROM collaborators WHERE id=?", [req.params.id]);
    res.json({ message: "Collaborator berhasil dihapus" });
  } catch (err) {
    console.error("Error:", err);
    res.status(500).json({ message: "Gagal menghapus collaborator" });
  }
});

// === GET available editors yang belum jadi collaborator ===
router.get("/available/editors", async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT u.id_user, u.nama_user, u.email
      FROM users u
      LEFT JOIN collaborators c ON c.user_id = u.id_user
      WHERE u.role = 'editor' AND c.user_id IS NULL
    `);
    res.json({ data: rows });
  } catch (err) {
    console.error("Error:", err);
    res.status(500).json({ message: "Gagal mengambil daftar editor yang tersedia" });
  }
});

export default router;
