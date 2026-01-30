import express from "express";
import mysql from "mysql2/promise";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import md5 from "md5";

dotenv.config();
const router = express.Router();

// ===================== KONEKSI DATABASE =====================
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  ssl: {
    rejectUnauthorized: false
  }
});

// ===================== CEK TOKEN LOGIN =====================
const verifyToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Token tidak ditemukan" });
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;

    const [rows] = await pool.query("SELECT * FROM users WHERE id_user = ?", [
      decoded.id,
    ]);
    if (rows.length === 0) {
      return res
        .status(401)
        .json({ error: "Akun sudah dihapus, silakan login ulang" });
    }

    next();
  } catch (err) {
    console.error("Token verify error:", err.message);
    return res.status(403).json({ error: "Token tidak valid" });
  }
};

// ===================== CEK ROLE ADMIN =====================
const verifyAdmin = (req, res, next) => {
  if (req.user.role !== "admin") {
    return res
      .status(403)
      .json({ error: "Akses ditolak, hanya admin yang bisa" });
  }
  next();
};

// ===================== GET SEMUA USER =====================
router.get("/", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        id_user AS id,
        nama_user,
        username,
        email,
        role,
        status,
        is_active,
        auth_provider
      FROM users
      ORDER BY id_user DESC
    `);

    const formatted = rows.map((u) => ({
      ...u,
      is_active: Number(u.is_active),
    }));

    res.json(formatted);
  } catch (err) {
    console.error("GET users error:", err);
    res.status(500).json({ error: "Gagal mengambil data user" });
  }
});

// ===================== TAMBAH USER =====================
router.post("/", verifyToken, verifyAdmin, async (req, res) => {
  let { username, email, role, status, password } = req.body;

  if (!username || !email || !password) {
    return res
      .status(400)
      .json({ error: "Username, email, dan password wajib diisi" });
  }

  let connection;
  try {
    connection = await pool.getConnection();
    await connection.beginTransaction();

    const [exists] = await connection.query(
      "SELECT 1 FROM users WHERE email = ? OR username = ? LIMIT 1",
      [email, username]
    );
    if (exists.length > 0) {
      await connection.rollback();
      return res
        .status(400)
        .json({ error: "Email atau username sudah digunakan" });
    }

    const hashedPassword =
      !password.startsWith("$") && password.length < 40
        ? md5(password)
        : password;

    const [result] = await connection.query(
      `INSERT INTO users (nama_user, username, email, role, status, password, is_active)
       VALUES (?, ?, ?, ?, ?, ?, 1)`,
      [username, username, email, role || "viewer", status || "ACTIVE", hashedPassword]
    );

    const userId = result.insertId;

    await connection.query(
      `INSERT INTO profile (user_id, full_name, username, email, role)
   VALUES (?, ?, ?, ?, ?)
   ON DUPLICATE KEY UPDATE
     full_name = VALUES(full_name),
     username = VALUES(username),
     email = VALUES(email),
     role = VALUES(role)`,
      [userId, username, username, email, role || "viewer"]
    );

    // Jika rolenya editor, masukkan juga nama dan email ke tabel collaborators
    if (role === "editor") {
      await connection.query(
        `INSERT INTO collaborators (name, email, user_id, posisi, status )
         VALUES (?, ?, ?, ?, ?)`,
        [username, email, userId, "Collaborator", "Active"]
      );
    }

    await connection.commit();
    res.status(201).json({
      message: `User${role === "editor" ? " + profile + collaborator" : ""
        } berhasil dibuat`,
      id: userId,
      success: true,
    });
  } catch (err) {
    if (connection) await connection.rollback();
    console.error("POST user error:", err);
    res
      .status(500)
      .json({ error: "Gagal menambahkan user", details: err.message });
  } finally {
    if (connection) connection.release();
  }
});

// ===================== UPDATE USER =====================
router.put("/:id", verifyToken, verifyAdmin, async (req, res) => {
  const { id } = req.params;
  let { username, email, role, status, password } = req.body;

  let connection;
  try {
    connection = await pool.getConnection();
    await connection.beginTransaction();

    const [oldUser] = await connection.query(
      "SELECT role FROM users WHERE id_user = ?",
      [id]
    );
    if (oldUser.length === 0) {
      await connection.rollback();
      return res.status(404).json({ error: "User tidak ditemukan" });
    }

    const oldRole = oldUser[0].role;

    let query = "UPDATE users SET username=?, email=?, role=?, status=?";
    const params = [username, email, role, status];

    if (password) {
      const hashedPassword =
        !password.startsWith("$") && password.length < 40
          ? md5(password)
          : password;
      query += ", password=?";
      params.push(hashedPassword);
    }

    query += " WHERE id_user=?";
    params.push(id);

    const [result] = await connection.query(query, params);
    if (result.affectedRows === 0) {
      await connection.rollback();
      return res.status(404).json({ error: "User tidak ditemukan" });
    }

    await connection.query(
      "UPDATE profile SET full_name=?, username=?, email=?, role=? WHERE user_id=?",
      [username, username, email, role, id]
    );

    // Jika role diubah menjadi editor, tambahkan ke collaborators
    if (oldRole !== "editor" && role === "editor") {
      await connection.query(
        `INSERT IGNORE INTO collaborators (name, email, user_id, posisi, status )
         VALUES (?, ?, ?, ?, ?)`,
        [username, email, id, "Collaborator", "Active"]
      );
      // Jika role diubah dari editor menjadi role lain, hapus dari collaborators
    } else if (oldRole === "editor" && role !== "editor") {
      await connection.query("DELETE FROM collaborators WHERE user_id = ?", [id]);
    }

    await connection.commit();
    res.json({ message: "User berhasil diupdate", success: true });
  } catch (err) {
    if (connection) await connection.rollback();
    console.error("PUT user error:", err);
    res
      .status(500)
      .json({ error: "Gagal mengupdate user", details: err.message });
  } finally {
    if (connection) connection.release();
  }
});

// ===================== TOGGLE ACTIVE USER =====================
router.patch("/:id/toggle-active", verifyToken, verifyAdmin, async (req, res) => {
  const { id } = req.params;

  if (req.user.id == id) {
    return res
      .status(403)
      .json({ error: "Anda tidak bisa menonaktifkan akun Anda sendiri" });
  }

  try {
    const [rows] = await pool.query(
      "SELECT is_active FROM users WHERE id_user = ?",
      [id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: "User tidak ditemukan" });
    }

    const newStatus = rows[0].is_active ? 0 : 1;
    await pool.query("UPDATE users SET is_active=? WHERE id_user=?", [
      newStatus,
      id,
    ]);

    res.json({
      message: `Akun berhasil ${newStatus ? "diaktifkan" : "dinonaktifkan"}`,
      is_active: newStatus,
    });
  } catch (err) {
    console.error("PATCH toggle-active error:", err);
    res.status(500).json({ error: "Gagal mengubah status user" });
  }
});

// ===================== HAPUS USER =====================
router.delete("/:id", verifyToken, verifyAdmin, async (req, res) => {
  const { id } = req.params;

  if (req.user.id == id) {
    return res.status(400).json({ error: "Tidak bisa menghapus akun sendiri" });
  }

  try {
    const [rows] = await pool.query("SELECT id_user FROM users WHERE id_user=?", [
      id,
    ]);
    if (rows.length === 0) {
      return res.status(404).json({ error: "User tidak ditemukan" });
    }

    await pool.query("DELETE FROM users WHERE id_user=?", [id]);
    await pool.query("DELETE FROM profile WHERE user_id=?", [id]);
    await pool.query("DELETE FROM collaborators WHERE user_id=?", [id]);

    res.json({ message: "User berhasil dihapus", success: true });
  } catch (err) {
    console.error("DELETE user error:", err);
    res.status(500).json({ error: "Gagal menghapus user", details: err.message });
  }
});

export default router;