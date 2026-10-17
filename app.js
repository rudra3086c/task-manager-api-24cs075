const dns = require("dns");
dns.setServers(["8.8.8.8", "1.1.1.1"]);
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();

const logger = require("./middleware/logger");
const errorHandler = require("./middleware/errorHandler");
const auth = require("./middleware/auth");
const authRoutes = require("./routes/authRoutes");
const taskRoutes = require("./routes/taskRoutes");
const aiRoutes = require("./routes/aiRoutes");

// Register background event listeners once when the application starts.
require("./listeners");

// Parse JSON
app.use(express.json());

// Allow the local React development server to call the API.
app.use(cors({
    origin: process.env.FRONTEND_ORIGIN || "http://localhost:5173"
}));

// Logging Middleware
app.use(logger);

// Authentication routes
app.use("/auth", authRoutes);

// Task routes require a valid JWT.
app.use("/tasks", auth, taskRoutes);
app.use("/api/ai", auth, aiRoutes);

// 404 Handler
app.use((req, res) => {
    res.status(404).json({
        message: "Route not found"
    });
});

// Global Error Handler - LAST
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

async function startServer() {
    if (!process.env.MONGO_URI) {
        throw new Error("MONGO_URI is not configured. Add it to your .env file.");
    }
    if (!process.env.JWT_SECRET) {
        throw new Error("JWT_SECRET is not configured. Add it to your .env file.");
    }

    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected");

    app.listen(PORT, () => {
        console.log(`Server running at http://localhost:${PORT}`);
    });
}

if (require.main === module) {
    startServer().catch((error) => {
        console.error("Unable to start server:", error.message);
        process.exit(1);
    });
}

module.exports = app;
