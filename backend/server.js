require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const repositoryRoutes = require("./routes/repositoryRoutes");
const testRoutes = require("./routes/testRoutes");
const fileRoutes = require("./routes/fileRoutes");
const commitRoutes = require("./routes/commitRoutes");

const app = express();
app.use(cors({ origin: process.env.FRONTEND_URL || true }));
app.use(express.json());
app.get("/", (_req, res) => res.json({ message: "RepoSphere API is running" }));
app.get("/api/health", (_req, res) => res.json({ status: "ok" }));
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/repositories", repositoryRoutes);
app.use("/api/test", testRoutes);
app.use("/api/files", fileRoutes);
app.use("/api/commits", commitRoutes);

const PORT = process.env.PORT || 5000;

const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/RepoSphere";

mongoose.connect(MONGO_URI).then(() => {
  console.log("MongoDB connected successfully");
  app.listen(PORT, "0.0.0.0", () => console.log(`RepoSphere backend running on http://localhost:${PORT}`));
}).catch((error) => {
  console.error("MongoDB connection failed:", error.message);
  process.exit(1);
});
