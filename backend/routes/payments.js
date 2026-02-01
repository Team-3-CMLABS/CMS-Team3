import express from "express";
import mysql from "mysql2/promise";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";

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

// 🧠 Middleware verifikasi token
const verifyToken = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader)
        return res.status(401).json({ message: "Token tidak ditemukan" });

    const token = authHeader.split(" ")[1];
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(403).json({ message: "Token tidak valid" });
    }
};

// ✅ CREATE PAYMENT
router.post("/", verifyToken, async (req, res) => {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: "User not authenticated" });

    const { subscriptionId, paymentMethodId, amount, status = "Pending" } = req.body;

    // Validasi input
    if (!subscriptionId || !paymentMethodId || !amount) {
        return res.status(400).json({ message: "subscriptionId, paymentMethodId, dan amount diperlukan" });
    }

    try {
        console.log("🧾 Payment request:", { userId, subscriptionId, paymentMethodId, amount, status });

        // 🔹 Validasi subscription berdasarkan user
        const [subsRows] = await pool.query(
            `SELECT s.*, 
                    p.name AS plan_name, 
                    p.price,
                    prof.full_name AS billingName,
                    prof.email AS billingEmail
             FROM subscriptions s
             JOIN plans p ON s.planId = p.id
             JOIN profile prof ON s.userId = prof.user_id
             WHERE s.id = ? AND s.userId = ?`,
            [subscriptionId, userId]
        );

        if (subsRows.length === 0) {
            return res.status(404).json({
                message: "Subscription not found or not owned by user",
            });
        }

        const sub = subsRows[0];
        const paymentRef = `PAY-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

        // Simpan ke tabel payments
        const [result] = await pool.query(
            `INSERT INTO payments (userId, subscriptionId, planId, paymentMethodId, amount, paymentRef, status)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [userId, subscriptionId, sub.planId, paymentMethodId, amount, paymentRef, status]
        );

        res.json({
            message: "Payment berhasil dibuat",
            paymentId: result.insertId,
            paymentRef,
            status,
            planName: sub.plan_name,
            billingName: sub.billingName,
            billingEmail: sub.billingEmail,
        });
    } catch (err) {
        console.error("❌ Gagal membuat pembayaran:", err);
        res.status(500).json({ message: "Gagal membuat pembayaran", error: err.message });
    }
});


// ✅ GET ALL PAYMENTS
router.get("/", async (req, res) => {
    const { userId } = req.query;
    if (!userId) return res.status(400).json({ message: "userId diperlukan" });
    try {
        const [rows] = await pool.query(
            `SELECT 
                pay.*, 
                s.startDate, 
                s.endDate, 
                s.autoRenew, 
                s.planId, 
                pl.name AS plan_name, 
                prof.full_name AS billing_name, 
                prof.email AS billing_email
             FROM payments pay
             JOIN subscriptions s ON pay.subscriptionId = s.id
             JOIN plans pl ON s.planId = pl.id
             JOIN profile prof ON s.userId = prof.user_id
             WHERE pay.userId = ?
             ORDER BY pay.id DESC`,
            [userId]
        );

        res.json(rows);
    } catch (err) {
        console.error("❌ Gagal memuat data pembayaran:", err);
        res.status(500).json({ message: "Gagal memuat data pembayaran" });
    }
});

router.get("/user/:userId", async (req, res) => {
    try {
        const userId = req.params.userId;
        if (!userId) return res.status(400).json({ message: "userId diperlukan" });

        const [rows] = await pool.query(
            `SELECT 
                pay.id AS paymentId,
                pay.subscriptionId,
                pay.planId,
                pay.amount,
                pay.status,
                pay.createdAt,
                pay.paymentMethodId,
                sub.startDate,
                sub.endDate,
                p.name AS plan_name,
                p.price AS plan_price,
                pm.category AS method_category,
                pm.provider AS method_provider
            FROM payments pay
            LEFT JOIN subscriptions sub ON pay.subscriptionId = sub.id
            LEFT JOIN plans p ON pay.planId = p.id
            LEFT JOIN payment_methods pm ON pay.paymentMethodId = pm.id
            WHERE pay.userId = ?
            ORDER BY pay.createdAt DESC`,
            [userId]
        );

        res.json(rows || []);
    } catch (error) {
        console.error("Error fetching payments:", error);
        res.status(500).json({ message: "Server error" });
    }
}); 

// ✅ CEK APAKAH USER SUDAH PUNYA PAYMENT
router.get("/check/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const [rows] = await pool.query("SELECT * FROM payments WHERE userId = ?", [userId]);
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error checking payment" });
  }
});

export default router;
