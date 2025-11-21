import fetch from "node-fetch";
import dotenv from "dotenv";
import express from "express";
import mysql from "mysql2/promise";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { google } from "googleapis";
import { sendEmail } from "../utils/sendEmail.js";

dotenv.config();

const router = express.Router();

// ===================== DB POOL =====================
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// ===================== GOOGLE OAUTH =====================
const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  `${process.env.BACKEND_URL || "http://localhost:4000"}/api/auth/google/callback`
);

const scopes = [
  "https://www.googleapis.com/auth/userinfo.profile",
  "https://www.googleapis.com/auth/userinfo.email",
];

const authorizeUrl = oauth2Client.generateAuthUrl({
  access_type: "offline",
  scope: scopes,
  include_granted_scopes: true,
});

// ===================== GOOGLE LOGIN =====================
router.get("/auth/google", (req, res) => {
  res.redirect(authorizeUrl);
});

router.get("/auth/google/callback", async (req, res) => {
  const connection = await pool.getConnection();

  try {
    if (req.query.error)
      return res.redirect(`${process.env.FRONTEND_URL}/login`);

    const { code } = req.query;
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    const oauth2 = google.oauth2({ auth: oauth2Client, version: "v2" });
    const { data } = await oauth2.userinfo.get();

    if (!data.email)
      return res.status(400).json({ message: "Google login gagal" });

    await connection.beginTransaction();

    // 🔎 Cek user
    const [rows] = await connection.query(
      "SELECT * FROM users WHERE email = ? LIMIT 1",
      [data.email]
    );
    let user = rows[0];

    // 🆕 Jika user belum ada
    if (!user) {
      const username = data.email.split("@")[0];
      const [result] = await connection.query(
        `INSERT INTO users (nama_user, username, email, password, role, status, auth_provider, is_active)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [data.name, username, data.email, null, "user", "PENDING_ROLE", "google", 1]
      );

      // 🔔 Kirim notifikasi ke admin
      try {
        await fetch(`${process.env.BACKEND_URL || "http://localhost:4000"}/api/notifications`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: `User baru mendaftar melalui Google: ${username}`,
            userId: result.insertId,
          }),
        });
      } catch (err) {
        console.error("Gagal kirim notifikasi signup Google:", err.message);
      }

      await connection.commit();
      return res.redirect(
        `${process.env.FRONTEND_URL}/googlecallback?status=pending`
      );
    }

    // 🚫 Jika user belum diaktifkan
    if (user.status !== "ACTIVE") {
      await connection.commit();
      return res.redirect(
        `${process.env.FRONTEND_URL}/googlecallback?status=pending`
      );
    }

    // 🚫 Jika user dinonaktifkan
    if (user.is_active === 0) {
      await connection.commit();
      return res.redirect(
        `${process.env.FRONTEND_URL}/googlecallback?status=inactive`
      );
    }

    await connection.commit();

    // ✅ User aktif → buat token
    const token = jwt.sign(
      { id: user.id_user, role: user.role, status: user.status, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "2h" }
    );

    const redirectUrl = `${process.env.FRONTEND_URL}/googlecallback?token=${encodeURIComponent(
      token
    )}&user=${encodeURIComponent(
      JSON.stringify({
        id_user: user.id_user,
        nama_user: user.nama_user,
        username: user.username,
        email: user.email,
        role: user.role,
        status: user.status,
        is_active: user.is_active,
      })
    )}`;

    return res.redirect(redirectUrl);
  } catch (err) {
    await connection.rollback();
    console.error("Google Auth Error:", err.message);
    return res.redirect(`${process.env.FRONTEND_URL}/login`);
  } finally {
    connection.release();
  }
});

// ===================== LOGIN MANUAL =====================
router.post("/login", async (req, res) => {
  const { username, password } = req.body;
  try {
    const [rows] = await pool.query(
      "SELECT * FROM users WHERE username = ? OR email = ? LIMIT 1",
      [username, username]
    );

    if (rows.length === 0)
      return res.status(401).json({ message: "User not found" });

    const user = rows[0];

    // 🔒 Blokir login manual jika akun Google
    if (user.auth_provider === "google") {
      return res.status(403).json({
        message: "Akun ini terdaftar melalui Google. Silakan login dengan Google.",
      });
    }

    const md5 = crypto.createHash("md5").update(password).digest("hex");
    if (md5 !== user.password)
      return res.status(401).json({ message: "Invalid password" });

    if (user.status !== "ACTIVE")
      return res.status(403).json({ message: "Akun Anda belum di-approve oleh admin" });

    if (user.is_active === 0)
      return res.status(403).json({ message: "Akun Anda telah dinonaktifkan. Hubungi admin." });

    const token = jwt.sign(
      { id: user.id_user, role: user.role, status: user.status, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "2h" }
    );

    return res.json({
      token,
      user: {
        id_user: user.id_user,
        username: user.username,
        nama_user: user.nama_user,
        email: user.email,
        role: user.role,
        status: user.status,
        is_active: user.is_active,
      },
    });
  } catch (err) {
    console.error("Login Error:", err.message);
    return res.status(500).json({ error: "Server error" });
  }
});

// ===================== SIGNUP MANUAL =====================
router.post("/signup", async (req, res) => {
  const { nama_user, username, email, password } = req.body;
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const [existing] = await connection.query(
      "SELECT * FROM users WHERE username = ? OR email = ? LIMIT 1",
      [username, email]
    );

    if (existing.length > 0) {
      await connection.rollback();
      return res.status(400).json({ message: "Username/email sudah digunakan" });
    }

    const md5 = crypto.createHash("md5").update(password).digest("hex");
    const [result] = await connection.query(
      `INSERT INTO users (nama_user, username, email, password, role, status, auth_provider)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [nama_user, username, email, md5, "user", "PENDING_ROLE", "manual"]
    );

    try {
      await fetch(`${process.env.BACKEND_URL || "http://localhost:4000"}/api/notifications`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: `User baru mendaftar: ${username}`,
          userId: result.insertId,
        }),
      });
    } catch (err) {
      console.error("Gagal kirim notifikasi signup manual:", err.message);
    }

    await connection.commit();

    return res.status(201).json({
      message: "User berhasil dibuat, menunggu persetujuan admin",
      user: {
        id: result.insertId,
        nama_user,
        username,
        email,
        role: "user",
        status: "PENDING_ROLE",
      },
    });
  } catch (err) {
    await connection.rollback();
    console.error("Signup Error:", err.message);
    return res.status(500).json({ error: "Server error" });
  } finally {
    connection.release();
  }
});

// ===================== ADMIN LOGIN =====================
router.post("/admin/login", async (req, res) => {
  const { username, password } = req.body;

  try {
    const [rows] = await pool.query(
      "SELECT * FROM users WHERE username = ? AND role = 'admin' LIMIT 1",
      [username]
    );

    if (rows.length === 0)
      return res.status(401).json({ message: "Admin not found" });

    const admin = rows[0];
    const md5 = crypto.createHash("md5").update(password).digest("hex");

    if (md5 !== admin.password)
      return res.status(401).json({ message: "Invalid password" });

    if (admin.status !== "ACTIVE")
      return res.status(403).json({ message: "Admin belum aktif" });

    if (admin.is_active === 0)
      return res.status(403).json({ message: "Akun admin telah dinonaktifkan" });

    const token = jwt.sign(
      { id: admin.id_user, role: admin.role, status: admin.status, email: admin.email },
      process.env.JWT_SECRET,
      { expiresIn: "2h" }
    );

    return res.json({ token, admin });
  } catch (err) {
    console.error("Admin Login Error:", err.message);
    return res.status(500).json({ error: "Server error" });
  }
});

// ===================== ADMIN GET PENDING USERS =====================
router.get("/admin/users/pending", async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT id_user, nama_user, username, email, role, status, created_at 
       FROM users WHERE status = 'PENDING_ROLE'`
    );
    return res.json(rows);
  } catch (err) {
    console.error("DB Error:", err.message);
    return res.status(500).json({ error: "Database error" });
  }
});

// ===================== ADMIN APPROVE USER (dengan auto collaborator) =====================
router.put("/admin/users/:id/approve", async (req, res) => {
  const { id } = req.params;
  const { role } = req.body;
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const [result] = await connection.query(
      "UPDATE users SET status = 'ACTIVE', role = ? WHERE id_user = ?",
      [role || "user", id]
    );

    if (result.affectedRows === 0) {
      await connection.rollback();
      return res.status(404).json({ message: "User not found" });
    }

    // ✅ Jika role yang di-approve adalah editor, tambahkan ke collaborators
    if (role === "editor") {
      const [existingCollab] = await connection.query(
        "SELECT id FROM collaborators WHERE user_id = ?",
        [id]
      );

      if (existingCollab.length === 0) {
        await connection.query(
          "INSERT INTO collaborators (user_id, posisi, status) VALUES (?, ?, ?)",
          [id, "Collaborator", "Active"]
        );
      }
    }

    const [userRows] = await connection.query(
      "SELECT nama_user, email FROM users WHERE id_user = ? LIMIT 1",
      [id]
    );

    const user = userRows[0];
    const subject = "Akun CMS Anda Telah Diaktifkan ✅";
    const html = `
      <h2>Halo ${user.nama_user},</h2>
      <p>Akun Anda sudah diaktifkan oleh Admin dengan role <strong>${role}</strong>. Sekarang Anda bisa login ke sistem CMS.</p>
      <p><a href="${process.env.FRONTEND_URL}/login"
          style="display:inline-block;padding:10px 20px;background:#3A7AC3;color:white;text-decoration:none;border-radius:5px;">
          Login Sekarang
      </a></p>
      <p>Terima kasih,<br/>Tim CMS</p>
    `;

    try {
      await sendEmail(user.email, subject, html);
    } catch (err) {
      console.error("Gagal kirim email approval:", err.message);
    }

    await connection.commit();
    return res.json({ message: "User approved successfully" + (role === "editor" ? " dan ditambahkan ke collaborators" : "") });
  } catch (err) {
    await connection.rollback();
    console.error("Approve Error:", err.message);
    return res.status(500).json({ error: "Database or email error" });
  } finally {
    connection.release();
  }
});

// ===================== GET ALL USERS =====================
router.get("/users", async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT id_user, nama_user, username, email, role, status, auth_provider FROM users"
    );
    return res.json(rows);
  } catch (err) {
    console.error("DB Error:", err.message);
    return res.status(500).json({ error: "Database error" });
  }
});

export default router;