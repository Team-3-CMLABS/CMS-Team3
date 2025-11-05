// server.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url"; 

import authRoutes from "./routes/auth.js"; 
import passwordRoutes from "./routes/password.js";
import usersRoutes from "./routes/users.js";
import profileRoutes from "./routes/profile.js";
import notificationsRouter from "./routes/notifications.js";
import projectsRoutes from "./routes/projects.js";
import collaboratorsRoutes from "./routes/collaborators.js";
import plansRoutes from "./routes/plans.js";
import subscriptionsRoutes from "./routes/subscriptions.js";
import paymentsRoutes from "./routes/payments.js";
import paymentMethodRoutes from "./routes/paymentMethods.js";
import contentBuilderRoutes from "./routes/contentBuilder.js";
import contentRoutes from "./routes/content.js";
import mediaRoutes from "./routes/media.js";

dotenv.config(); 

const app = express();
app.use(express.json());
app.use(cors());

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use("/api/uploads", express.static(path.join(__dirname, "uploads")));

// routes
app.use("/api/users", usersRoutes);
app.use("/api", authRoutes);
app.use("/api/password", passwordRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/notifications", notificationsRouter);
app.use("/api/projects", projectsRoutes);
app.use("/api/collaborators", collaboratorsRoutes);
app.use("/api/plans", plansRoutes);
app.use("/api/subscriptions", subscriptionsRoutes);
app.use("/api/payments", paymentsRoutes);
app.use("/api/paymentMethods", paymentMethodRoutes);
app.use("/api/content-builder", contentBuilderRoutes);
app.use("/api/content", contentRoutes);
app.use("/api/media", mediaRoutes);

// test
app.get("/", (req, res) => {
  res.send("Backend CMS berjalan 🚀");
});

const PORT = process.env.PORT || 4000; 
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
