const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: [true, "Email is required"],
        unique: true,
        lowercase: true,
        trim: true,
        match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Enter a valid email address"]
    },
    password: {
        type: String,
        required: [true, "Password is required"],
        select: false
    }
}, {
    timestamps: true
});

module.exports = mongoose.model("User", userSchema);
