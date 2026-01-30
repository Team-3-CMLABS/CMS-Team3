import express from "express";
import mysql from "mysql2/promise";
import jwt from "jsonwebtoken";
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

// 🧩 Middleware untuk ambil user dari token
function verifyToken(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader)
        return res.status(401).json({ message: "Token tidak ditemukan" });

    const token = authHeader.split(" ")[1];
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // simpan info user ke request
        next();
    } catch (err) {
        console.error("Token tidak valid:", err);
        return res.status(403).json({ message: "Token tidak valid" });
    }
}

// GET subscription by userId
router.get("/user/:userId", async (req, res) => {
    try {
        const userId = req.params.userId;

        const [rows] = await pool.query(
            `SELECT 
        s.id AS subscriptionId,
        s.planId,
        s.userId,
        s.startDate,
        s.endDate,
        s.autoRenew,
        s.billingName,
        s.billingEmail,
        s.billingAddress,
        s.createdAt,
        p.name AS plan_name,
        p.price AS plan_price,
        prof.full_name AS profile_name,
        prof.email AS profile_email
      FROM subscriptions s
      JOIN plans p ON s.planId = p.id
      JOIN profile prof ON s.userId = prof.user_id
      WHERE s.userId = ?
      ORDER BY s.createdAt DESC`,
            [userId]
        );

        if (rows.length === 0) {
            return res.status(404).json({ message: "No subscription found" });
        }

        res.json(rows);
    } catch (error) {
        console.error("Error fetching subscriptions:", error);
        res.status(500).json({ message: "Server error" });
    }
});

// 🧩 Tambah subscription baru
router.post("/", verifyToken, async (req, res) => {
    const userId = req.user.id;
    const { planId, startDate, endDate, autoRenew, billingName, billingEmail, billingAddress } = req.body;

    try {
        // Ambil profil user untuk fallback data billing
        const [userRows] = await pool.query(
            "SELECT full_name, email, address FROM profile WHERE user_id = ?",
            [userId]
        );
        if (userRows.length === 0)
            return res.status(404).json({ message: "User profile not found" });
        const user = userRows[0];

        // Pastikan plan valid
        const [planRows] = await pool.query("SELECT * FROM plans WHERE id = ?", [planId]);
        if (planRows.length === 0)
            return res.status(404).json({ message: "Plan not found" });

        // Simpan subscription
        const [result] = await pool.query(
            `INSERT INTO subscriptions (userId, planId, startDate, endDate, autoRenew, billingName, billingEmail, billingAddress)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                userId,
                planId,
                startDate,
                endDate,
                autoRenew ? 1 : 0,
                billingName || user.full_name,
                billingEmail || user.email,
                billingAddress || user.address || "-",
            ]
        );

        // 🔄 Update kolom current_plan_id di tabel users
        await pool.query(
            `UPDATE users SET current_plan_id = ? WHERE id_user = ?`,
            [planId, userId]
        );

        res.json({
            message: "Subscription created successfully",
            subscriptionId: result.insertId,
            userId,
        });
    } catch (error) {
        console.error("Error creating subscription:", error);
        res.status(500).json({ message: "Error creating subscription", error });
    }
});

router.get("/usage/:userId", async (req, res) => {
    const { userId } = req.params;
    try {
        const [rows] = await pool.query(
            `SELECT s.id AS subscriptionId, s.planId, s.startDate, s.endDate, p.features
             FROM subscriptions s
             JOIN plans p ON s.planId = p.id
             WHERE s.userId = ?`,
            [userId]
        );

        if (rows.length === 0) return res.json({ message: "No subscription found", usageData: [] });

        const subscription = rows[0];
        const features = JSON.parse(subscription.features);

        // Dummy usage (ganti dengan perhitungan nyata nanti)
        const usageData = [
            { name: "API Calls", value: 450000, limit: parseInt(features.api_calls) || 500000 },
            { name: "Storage", value: 60, limit: parseInt(features.media_assets) || 100 },
            { name: "Projects", value: 3, limit: parseInt(features.projects) || 5 },
        ];

        res.json({ subscriptionId: subscription.subscriptionId, usageData });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to fetch usage" });
    }
});

// TOGGLE autoRenew
router.put("/:subscriptionId/auto-renew", verifyToken, async (req, res) => {
    try {
        const { subscriptionId } = req.params;
        const { autoRenew } = req.body;

        if (typeof autoRenew !== "boolean")
            return res.status(400).json({ message: "autoRenew harus boolean" });

        const [result] = await pool.query(
            `UPDATE subscriptions SET autoRenew = ? WHERE id = ? AND userId = ?`,
            [autoRenew ? 1 : 0, subscriptionId, req.user.id]
        );

        if (result.affectedRows === 0)
            return res.status(404).json({ message: "Subscription tidak ditemukan" });

        res.json({ message: "Auto-renew updated", autoRenew });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
});

// CANCEL subscription by userId
router.post("/cancel/user/:userId", async (req, res) => {
    try {
        const { userId } = req.params;

        const [result] = await pool.query(
            `DELETE FROM subscriptions WHERE userId = ?`,
            [userId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Tidak ada subscription ditemukan untuk user ini" });
        }

        res.json({ message: "Subscription milik user berhasil dibatalkan" });
    } catch (err) {
        console.error("Error cancelling subscription:", err);
        res.status(500).json({ message: "Server error" });
    }
});

// ✅ CEK APAKAH USER SUDAH PUNYA SUBSCRIPTION AKTIF
router.get("/check/:userId", async (req, res) => {
    try {
        const { userId } = req.params;
        const [rows] = await pool.query("SELECT * FROM subscriptions WHERE userId = ?", [userId]);
        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error checking subscription" });
    }
});

export default router;
