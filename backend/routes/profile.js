import express from "express";
import mysql from "mysql2/promise";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import multer from "multer";
import path from "path";
import fs from "fs";

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

// ===================== Middleware verifikasi token =====================
const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ message: "Token missing" });

  const token = authHeader.split(" ")[1];
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) return res.status(403).json({ message: "Token invalid" });
    req.user = decoded;
    next();
  });
};

// ===================== Konfigurasi upload foto profil =====================
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = "uploads/";
    if (!fs.existsSync(uploadPath)) fs.mkdirSync(uploadPath);
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const filename = `profile_${Date.now()}${ext}`;
    cb(null, filename);
  },
});

const upload = multer({ storage, limits: { fileSize: 2 * 1024 * 1024 } });

// ===============================================================
// ✅ 2️⃣ GET PROFILE BY TOKEN
// ===============================================================
router.get("/", verifyToken, async (req, res) => {
  try {
    const user_id = req.user.id;
    const [profileRows] = await pool.query(
      "SELECT * FROM profile WHERE user_id = ?",
      [user_id]
    );

    if (profileRows.length > 0) {
      return res.json({ profile: profileRows[0] });
    }

    const [userRows] = await pool.query(
      "SELECT id_user, nama_user, username, email, role FROM users WHERE id_user = ?",
      [user_id]
    );

    if (userRows.length === 0)
      return res.status(404).json({ message: "User not found" });

    const user = userRows[0];
    await pool.query(
      `INSERT INTO profile 
        (user_id, full_name, username, email, role, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, NOW(), NOW())`,
      [user.id_user, user.nama_user, user.username, user.email, user.role]
    );

    const [newProfile] = await pool.query(
      "SELECT * FROM profile WHERE user_id = ?",
      [user_id]
    );

    res.json({ profile: newProfile[0] });
  } catch (err) {
    console.error("Error fetching profile:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ===============================================================
// ✅ 1️⃣ GET PROFILE BY USER ID (non-token, untuk billing otomatis)
// ===============================================================
router.get("/:userId", async (req, res) => {
  const { userId } = req.params;
  try {
    const [rows] = await pool.query(
      "SELECT * FROM profile WHERE user_id = ?",
      [userId]
    );
    if (rows.length === 0)
      return res.status(404).json({ message: "User not found" });
    res.json(rows[0]);
  } catch (err) {
    console.error("❌ Error fetching user data:", err);
    res.status(500).json({ message: "Error fetching user data" });
  }
});

// ===============================================================
// ✅ 3️⃣ UPDATE PROFILE
// ===============================================================
router.put("/", verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      full_name = null,
      username = null,
      email = null,
      company = null,
      job = null,
      country = null,
      address = null,
      role = null,
    } = req.body;

    const [result] = await pool.query(
      `UPDATE profile 
       SET full_name=?, username=?, email=?, company=?, job=?, country=?, address=?, role=?, updated_at=NOW()
       WHERE user_id=?`,
      [full_name, username, email, company, job, country, address, role, userId]
    );

    if (result.affectedRows === 0)
      return res.status(404).json({ message: "Profil tidak ditemukan" });

    res.json({ message: "Profil berhasil diperbarui" });
  } catch (err) {
    console.error("❌ Error saat update profile:", err);
    res.status(500).json({ message: "Terjadi kesalahan server saat update profil" });
  }
});

// ===============================================================
// ✅ 4️⃣ UPDATE FOTO PROFIL
// ===============================================================
router.put("/photo", verifyToken, upload.single("photo"), async (req, res) => {
  try {
    const userId = req.user.id;
    if (!req.file)
      return res.status(400).json({ message: "File foto tidak ditemukan" });

    const photoPath = `/uploads/${req.file.filename}`;
    await pool.query(
      "UPDATE profile SET photo=?, updated_at=NOW() WHERE user_id=?",
      [photoPath, userId]
    );

    res.json({ message: "Foto profil berhasil diperbarui", photo: photoPath });
  } catch (err) {
    console.error("❌ Error saat update foto:", err);
    res.status(500).json({ message: "Terjadi kesalahan saat upload foto" });
  }
});

// ===============================================================
// ✅ 5️⃣ DELETE FOTO PROFIL
// ===============================================================
router.delete("/photo", verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const [rows] = await pool.query(
      "SELECT photo FROM profile WHERE user_id = ?",
      [userId]
    );

    if (rows.length === 0)
      return res.status(404).json({ message: "Profil tidak ditemukan" });

    const photo = rows[0].photo;
    if (photo) {
      const filePath = path.join(process.cwd(), photo);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }

    await pool.query(
      "UPDATE profile SET photo=NULL, updated_at=NOW() WHERE user_id=?",
      [userId]
    );

    res.json({ message: "Foto profil dihapus" });
  } catch (err) {
    console.error("❌ Error saat hapus foto:", err);
    res.status(500).json({ message: "Terjadi kesalahan saat menghapus foto" });
  }
});

// ===============================================================
// ✅ 6️⃣ UPDATE BILLING
// ===============================================================
router.put("/billing", verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      full_name,
      email,
      address,
      city,
      state,
      zip,
      country,
      company,
    } = req.body;

    const [existing] = await pool.query(
      "SELECT id FROM profile WHERE user_id = ?",
      [userId]
    );

    if (existing.length === 0) {
      await pool.query(
        `INSERT INTO profile 
         (user_id, full_name, email, address, city, state, zip, country, company, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
        [userId, full_name, email, address, city, state, zip, country, company]
      );
    } else {
      await pool.query(
        `UPDATE profile 
         SET full_name=?, email=?, address=?, city=?, state=?, zip=?, country=?, company=?, updated_at=NOW()
         WHERE user_id=?`,
        [full_name, email, address, city, state, zip, country, company, userId]
      );
    }

    await pool.query(
      "UPDATE users SET nama_user=?, email=? WHERE id_user=?",
      [full_name, email, userId]
    );

    res.json({ message: "Billing info updated successfully!" });
  } catch (err) {
    console.error("❌ Error saat update billing:", err);
    res.status(500).json({ message: "Gagal update billing", error: err.message });
  }
});

export default router;
