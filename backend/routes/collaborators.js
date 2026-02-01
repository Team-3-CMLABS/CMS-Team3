// routes/collaborators.ts
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

// GET all collaborators 
router.get("/all-users", async (req, res) => {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const [owners] = await conn.query(`
      SELECT DISTINCT
        u.id_user,
        u.nama_user,
        u.email
      FROM content_models cm
      JOIN users u
        ON u.email COLLATE utf8mb4_general_ci
         = cm.editor_email COLLATE utf8mb4_general_ci
      LEFT JOIN collaborators c ON c.user_id = u.id_user
      WHERE cm.editor_email IS NOT NULL
        AND c.id IS NULL
    `);

    for (const o of owners) {
      await conn.query(
        `
        INSERT INTO collaborators (user_id, name, email, posisi, status)
        VALUES (?, ?, ?, 'Owner', 'Active')
        `,
        [o.id_user, o.nama_user, o.email]
      );
    }

    const [models] = await conn.query(`
      SELECT
        cm.id AS model_id,
        c.id AS collaborator_id
      FROM content_models cm
      JOIN users u
        ON u.email COLLATE utf8mb4_general_ci
         = cm.editor_email COLLATE utf8mb4_general_ci
      JOIN collaborators c ON c.user_id = u.id_user
      LEFT JOIN model_collaborators mc
        ON mc.collaborator_id = c.id
       AND mc.model_id = cm.id
      WHERE cm.editor_email IS NOT NULL
        AND mc.id IS NULL
    `);

    for (const m of models) {
      await conn.query(
        `
        INSERT INTO model_collaborators (collaborator_id, model_id)
        VALUES (?, ?)
        `,
        [m.collaborator_id, m.model_id]
      );
    }

    await conn.commit();

    const [rows] = await conn.query(`
      SELECT
        u.id_user,
        u.nama_user AS name,
        u.email,
        u.role,

        c.id AS collaborator_id,
        c.posisi,
        c.status,

        cm_owner.editor_email AS is_owner_editor,

        m.id AS model_id,
        m.name AS model_name,
        m.slug
      FROM users u
      LEFT JOIN collaborators c ON u.id_user = c.user_id

      LEFT JOIN (
        SELECT DISTINCT editor_email
        FROM content_models
      ) cm_owner
        ON cm_owner.editor_email COLLATE utf8mb4_general_ci
         = u.email COLLATE utf8mb4_general_ci

      LEFT JOIN model_collaborators mc ON c.id = mc.collaborator_id
      LEFT JOIN content_models m ON mc.model_id = m.id

      WHERE u.role IN ('admin', 'editor')
      ORDER BY u.nama_user ASC
    `);

    const map = {};
    const result = [];

    (rows).forEach((row) => {
      if (!map[row.id_user]) {
        let defaultPosisi = "Collaborator";

        if (row.role === "admin") {
          defaultPosisi = "Owner";
        } else if (row.role === "editor" && row.is_owner_editor) {
          defaultPosisi = "Owner";
        }

        map[row.id_user] = {
          id: row.collaborator_id,
          user_id: row.id_user,
          name: row.name,
          email: row.email,
          role: row.role,
          posisi: row.posisi || defaultPosisi,
          status: row.status || "Active",
          models: [],
        };

        result.push(map[row.id_user]);
      }

      if (row.model_id) {
        map[row.id_user].models.push({
          id: row.model_id,
          name: row.model_name,
          slug: row.slug,
        });
      }
    });

    res.json({ data: result });
  } catch (err) {
    await conn.rollback();
    console.error(err);
    res.status(500).json({ message: "Gagal mengambil user collaborator" });
  } finally {
    conn.release();
  }
});

// GET content models, optional filter by editor email
router.get("/content-models", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT id, name, slug, editor_email FROM content_models ORDER BY name ASC");
    res.json({ data: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Gagal mengambil content models" });
  }
});

// GET all admin & editor users
router.get("/users", async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT id_user, nama_user, email, role
      FROM users
      WHERE role IN ('admin', 'editor')
      ORDER BY nama_user ASC
    `);

    res.json({ data: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Gagal mengambil user admin/editor" });
  }
});

// POST add collaborator
router.post("/", async (req, res) => {
  const { user_id, posisi, status, model_ids } = req.body;
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const [userRows] = await conn.query("SELECT nama_user, email FROM users WHERE id_user = ?", [user_id]);
    if (userRows.length === 0) return res.status(400).json({ message: "User tidak ditemukan" });

    const user = userRows[0];

    const [exist] = await conn.query(
      "SELECT id FROM collaborators WHERE user_id=?",
      [user_id]
    );

    if (exist.length > 0) {
      return res.status(400).json({ message: "User sudah menjadi collaborator" });
    }

    const [insertResult] = await conn.query(
      "INSERT INTO collaborators (user_id, name, email, posisi, status) VALUES (?, ?, ?, ?, ?)",
      [user_id, user.nama_user, user.email, posisi || "Collaborator", status || "Active"]
    );
    const collaboratorId = insertResult.insertId;

    if (Array.isArray(model_ids) && model_ids.length > 0) {
      const values = model_ids.map(mid => [collaboratorId, mid]);
      await conn.query("INSERT INTO model_collaborators (collaborator_id, model_id) VALUES ?", [values]);
    }

    await conn.commit();
    res.json({ message: "Collaborator berhasil ditambahkan" });
  } catch (err) {
    await conn.rollback();
    console.error(err);
    res.status(500).json({ message: "Gagal menambah collaborator" });
  } finally {
    conn.release();
  }
});

// PUT update collaborator + models
router.put("/:id", async (req, res) => {
  const { posisi, status, model_ids } = req.body;
  const { id } = req.params;
  const conn = await pool.getConnection();

  try {
    await conn.beginTransaction();

    // 1️⃣ Update posisi & status
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

    if (updates.length > 0) {
      values.push(id);
      await conn.query(
        `UPDATE collaborators SET ${updates.join(", ")} WHERE id = ?`,
        values
      );
    }

    // 2️⃣ Ambil data collaborator
    const [[collab]] = await conn.query(
      "SELECT email, posisi FROM collaborators WHERE id = ?",
      [id]
    );

    if (!collab) {
      throw new Error("Collaborator tidak ditemukan");
    }

    // 3️⃣ Sinkron model_collaborators (REMOVE + ADD)
    if (Array.isArray(model_ids)) {
      await conn.query(
        "DELETE FROM model_collaborators WHERE collaborator_id = ?",
        [id]
      );

      if (model_ids.length > 0) {
        const values = model_ids.map((mid) => [id, mid]);
        await conn.query(
          "INSERT INTO model_collaborators (collaborator_id, model_id) VALUES ?",
          [values]
        );
      }
    }

    // 4️⃣ Sinkron editor_email (KHUSUS OWNER)
    if (Array.isArray(model_ids)) {
      // a. Lepas semua model milik user ini
      await conn.query(
        `
        UPDATE content_models
        SET editor_email = NULL
        WHERE editor_email = ?
        `,
        [collab.email]
      );

      // b. Jika OWNER → assign editor_email
      const finalPosisi = posisi || collab.posisi;

      if (finalPosisi === "Owner" && model_ids.length > 0) {
        await conn.query(
          `
    UPDATE content_models
    SET editor_email = ?
    WHERE id IN (${model_ids.map(() => "?").join(",")})
    `,
          [collab.email, ...model_ids]
        );
      }
    }

    await conn.commit();
    res.json({ message: "Collaborator berhasil diperbarui" });
  } catch (err) {
    await conn.rollback();
    console.error(err);
    res.status(500).json({
      message: "Gagal memperbarui collaborator",
      error: err.message,
    });
  } finally {
    conn.release();
  }
});

// DELETE collaborator
router.delete("/:id", async (req, res) => {
  try {
    await pool.query("DELETE FROM collaborators WHERE id=?", [req.params.id]);
    res.json({ message: "Collaborator berhasil dihapus" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Gagal menghapus collaborator" });
  }
});

export default router;