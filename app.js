const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();

const logger = require("./middleware/logger");
const errorHandler = require("./middleware/errorHandler");
const taskRoutes = require("./routes/taskRoutes");

// Parse JSON
app.use(express.json());

// Allow the local React development server to call the API.
app.use(cors({
    origin: process.env.FRONTEND_ORIGIN || "http://localhost:5173"
}));

// Logging Middleware
app.use(logger);

// Task Routes
app.use("/tasks", taskRoutes);

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
