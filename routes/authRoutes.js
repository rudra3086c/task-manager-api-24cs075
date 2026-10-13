const bcrypt = require("bcryptjs");
const express = require("express");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const auth = require("../middleware/auth");

const router = express.Router();

function validateCredentials(req, res, next) {
    const { email, password } = req.body || {};
    const errors = [];

    if (typeof email !== "string" || !email.trim()) {
        errors.push({ field: "email", message: "Email is required" });
    }
    if (typeof password !== "string" || !password) {
        errors.push({ field: "password", message: "Password is required" });
    } else if (password.length < 6) {
        errors.push({ field: "password", message: "Password must be at least 6 characters" });
    }

    if (errors.length > 0) {
        return res.status(400).json({ message: "Validation failed", errors });
    }

    req.body.email = email.trim().toLowerCase();
    next();
}

function createToken(user) {
    if (!process.env.JWT_SECRET) {
        throw new Error("JWT_SECRET is not configured. Add it to your .env file.");
    }

    return jwt.sign({ id: user._id.toString() }, process.env.JWT_SECRET, { expiresIn: "1h" });
}

router.post("/register", validateCredentials, async (req, res, next) => {
    try {
        const existingUser = await User.findOne({ email: req.body.email });
        if (existingUser) {
            return res.status(409).json({ message: "An account with that email already exists" });
        }

        const password = await bcrypt.hash(req.body.password, 10);
        const user = await User.create({ email: req.body.email, password });
        res.status(201).json({
            message: "Registration successful",
            user: { id: user._id, email: user.email }
        });
    } catch (error) {
        next(error);
    }
});

router.post("/login", validateCredentials, async (req, res, next) => {
    try {
        const user = await User.findOne({ email: req.body.email }).select("+password");
        const isMatch = user && await bcrypt.compare(req.body.password, user.password);

        if (!isMatch) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        res.status(200).json({
            message: "Login successful",
            token: createToken(user),
            user: { id: user._id, email: user.email }
        });
    } catch (error) {
        next(error);
    }
});

router.get("/me", auth, async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(401).json({ message: "User account no longer exists" });
        }

        res.status(200).json({ id: user._id, email: user.email });
    } catch (error) {
        next(error);
    }
});

module.exports = router;
