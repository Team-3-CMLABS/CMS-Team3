import express from "express";
import mysql from "mysql2/promise";
import crypto from "crypto";
import dotenv from "dotenv";
import { sendEmail } from "../utils/sendEmail.js";

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

// 🔑 Forgot Password
router.post("/forgot-password", async (req, res) => {
  const { email } = req.body;

  try {
    // Case-insensitive dan trim spasi
    const [rows] = await pool.query(
      "SELECT * FROM users WHERE LOWER(email) = LOWER(?)",
      [email.trim()]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "Email tidak terdaftar" });
    }

    const token = crypto.randomBytes(32).toString("hex");
    const expire = new Date(Date.now() + 10 * 60 * 1000); // 10 menit

    await pool.query(
      "UPDATE users SET reset_token = ?, reset_expires = ? WHERE email = ?",
      [token, expire, email.trim()]
    );

    // Link reset password
    const resetUrl = `http://localhost:3000/reset-password/${token}`;
    const html = `
      <p>Hai,</p>
      <p>Klik link berikut untuk reset password akun CMS kamu:</p>
      <a href="${resetUrl}">${resetUrl}</a>
      <p>Link ini hanya berlaku selama 10 menit.</p>
    `;

    await sendEmail(email, "Reset Password CMS", html);
    console.log("✅ Email terkirim ke:", email);

    res.json({ message: "Email reset password telah dikirim" });
  } catch (err) {
    console.error("Forgot Password Error:", err);
    res.status(500).json({ error: "Server error", detail: err.message });
  }
});

// 🔑 Reset Password
router.post("/reset-password/:token", async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  try {
    const [rows] = await pool.query(
      "SELECT * FROM users WHERE reset_token = ? AND reset_expires > NOW()",
      [token]
    );

    if (rows.length === 0) {
      return res.status(400).json({ message: "Token tidak valid atau sudah kadaluarsa" });
    }

    const hashed = crypto.createHash("md5").update(password).digest("hex");

    await pool.query(
      "UPDATE users SET password = ?, reset_token = NULL, reset_expires = NULL WHERE id_user = ?",
      [hashed, rows[0].id_user]
    );

    res.json({ message: "Password berhasil direset" });
  } catch (err) {
    console.error("Reset Password Error:", err);
    res.status(500).json({ error: "Server error", detail: err.message });
  }
});

export default router;
